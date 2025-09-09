import { initTRPC, TRPCError } from '@trpc/server'
import { awsLambdaRequestHandler, type CreateAWSLambdaContextOptions } from '@trpc/server/adapters/aws-lambda'
import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import { Collection, type Filter, ObjectId } from 'mongodb'
import { createHash } from 'node:crypto'
import z from 'zod'
import { getDBClient, getSecretString } from './db'
import { type StackSchema, type TweetSchema, type UserSchema, zStackSchema, zTweetSchema } from './schemas'
import { getFromHeaders } from './utils/http'
import { OpenApiMeta } from 'trpc-to-openapi'

//TODO: rate limiting with cloudflare
const t = initTRPC
	.meta<OpenApiMeta>()
	.context<Awaited<ReturnType<typeof createContext>>>()
	.create()
const publicProcedure = t.procedure

const ACKNOWLEDGE_DESCRIPTION = "Whether the operation was acknowledged"

const isUserProcedure = t.procedure.use(async function hasSession(opts) {
	const { ctx } = opts

	// If user doesn't exist, create it and check again
	const userToken = getFromHeaders('userToken', ctx)
	let user = await ctx.User.findOne({ identifier: userToken })
	if (!user) {
		const addedUser = (await ctx.User.insertOne({ userToken, viewedPosts: [] })).acknowledged
		if (!addedUser) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'JIT user creation not acknowledged' })
		user = await ctx.User.findOne({ userToken })
		if (!user) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'JIT user creation acknowledged but not found' })
	}
	return opts.next({ ctx: { ...ctx, user } })
})

const isAdminProcedure = t.procedure.use(async function isAdmin(opts) {
	const { ctx } = opts

	const adminPassword = getFromHeaders('authorization', ctx).split(' ')[1]
	const adminAnswer = await getSecretString('ADMIN_ANSWER')
	const isAdmin = !!adminPassword && createHash('sha256').update(adminPassword).digest('hex') == adminAnswer
	if (!isAdmin) throw new TRPCError({ code: 'UNAUTHORIZED' })

	return opts.next({ ctx: { ...ctx, isAdmin: true } })
})

async function queryRandomTweets(Tweet: Collection<TweetSchema>, filter: Filter<TweetSchema>) {
	const tweetIds = await Tweet.find(filter).project<{ _id: ObjectId }>({ _id: 1 }).toArray()

	const sampledIds: ObjectId[] = []
	for (let i = 0; i < Math.min(20, tweetIds.length); i++) { // Sample either 20 or the amount of IDs, whichever is smaller
		sampledIds.push(tweetIds.splice(Math.floor(Math.random() * tweetIds.length - 1), 1)[0]._id) // Remove IDs as they are sampled
	}
	return await Tweet.find({ _id: { $in: sampledIds } }).toArray()
}

const router = t.router({
	// User
	deleteUser: isUserProcedure
		.mutation(async ({ ctx }) => (await ctx.User.deleteOne(ctx.User)).acknowledged),

	markTweet: isUserProcedure
		.input(z.array(zTweetSchema))
		.mutation(async ({ input, ctx }) =>
			(
				await ctx.User.updateOne(ctx.user, {
					$push: { viewedPosts: { $each: input.map(tweet => tweet.statusId) } },
				})
			).acknowledged
		),

	// Tweet
	getRandomTweets: publicProcedure
		.input(zTweetSchema.pick({ stackId: true }))
		.query(async ({ input, ctx }) => await queryRandomTweets(ctx.Tweet, { stackId: input })),

	getRandomUnviewedTweets: isUserProcedure
		.input(zTweetSchema.pick({ stackId: true }))
		.query(async ({ input, ctx }) =>
			await queryRandomTweets(ctx.Tweet, {
				stackId: input,
				statusId: { $nin: ctx.user.viewedPosts },
			})
		),

	getTweets: publicProcedure
		.input(z.object({
			tweetFilter: zTweetSchema.or(z.record(zTweetSchema.keyof(), z.any())).describe("Accepts either a plain tweet filter or a mongodb filter object"),
			tweetSorter: z.record(zTweetSchema.keyof(), z.literal(1).or(z.literal(-1))),
			page: z.number(),
			pageSize: z.number()
		}))
		.output(z.array(z.object({ metadata: z.number(), data: z.array(zTweetSchema) })))
		.query(async ({ input, ctx }) => await ctx.Tweet
			.aggregate([
				{ $match: input.tweetFilter },
				{ $sort: input.tweetSorter },
				{
					$facet: {
						metadata: [{ $count: 'count' }],
						data: [{ $skip: (input.page - 1) * input.pageSize }, { $limit: input.pageSize }]
					}
				}
			]).toArray() as any),
	/*
	Example to call this:
	isAdminProcedure requires special admin password as your Bearer token
	
	you can make multiple trpc requests with one http request. This is done by listing the requests like
	{ 0: {input data for first request}, 1: {input data for second...} }
	even if you are making one request, you still must follow this format.

	To determine what input data is, check the .input on the endpoint. It kinda sortof reads like english.
	if youre confused, go to "searchStacks.tsx" and create a mock request to play around with types
	
	data is returned similarly to how it is inputted. formatted with 0: ..., 1: ...
	Assuming you make a single successful request, it will look like { 0: { result: { data: {output data} } } }
	*/
	createTweets: isAdminProcedure
		.input(z.array(zTweetSchema))
		.output(z.boolean().describe(ACKNOWLEDGE_DESCRIPTION))
		.mutation(async ({ input, ctx }) => (await ctx.Tweet.insertMany(input)).acknowledged),

	// Stack
	getStacks: publicProcedure
		.input(zStackSchema.partial())
		.output(z.array(zStackSchema))
		.query(async ({ input, ctx }) => await ctx.Stack.find(input).toArray()),

	createStack: isAdminProcedure
		.input(zStackSchema.pick({ twitterHandle: true }))
		.output(z.boolean().describe(ACKNOWLEDGE_DESCRIPTION))
		.mutation(async ({ ctx, input }) => (await ctx.Stack.insertOne({ postCount: 0, ...input })).acknowledged),

	deleteStack: isAdminProcedure
		.input(zStackSchema.pick({ twitterHandle: true }))
		.output(z.boolean().describe(ACKNOWLEDGE_DESCRIPTION))
		.mutation(async ({ ctx, input }) => (await ctx.Stack.deleteOne({ ...input })).acknowledged),
})

const createContext = async (opts: CreateAWSLambdaContextOptions<APIGatewayProxyEventV2>) => {
	const dbClient = await getDBClient()

	return {
		...opts,
		dbClient,
		User: dbClient.db('Scrapstack').collection<UserSchema>('user'),
		Tweet: dbClient.db('Scrapstack').collection<TweetSchema>('tweet'),
		Stack: dbClient.db('Scrapstack').collection<StackSchema>('stack'),
		userToken: null,
		user: null,
		isAdmin: false,
	}
}

export const handle_request = awsLambdaRequestHandler({
	router,
	createContext,
})

export type AppRouter = typeof router

