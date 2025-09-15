import { Collection, ObjectId, type StrictFilter } from 'mongodb'
import { initTRPC, TRPCError } from '@trpc/server'
import { type OperationMeta } from 'openapi-trpc'
import { createHash } from 'node:crypto'
import z from 'zod'

import { type TweetSchema, zStackSchema, zTweetSchema } from './schemas.js'
import { getSecretString } from './secrets.js'
import { getFromHeaders } from '../utils/http.js'
import { createLocalContext } from '../local.js'

//TODO: rate limiting with cloudflare
const t = initTRPC
	.meta<OperationMeta>()
	.context<Awaited<ReturnType<typeof createLocalContext>>>()
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

async function queryRandomTweets(Tweet: Collection<TweetSchema>, filter: StrictFilter<TweetSchema>) {
	const tweetIds = await Tweet.find(filter).project<{ _id: ObjectId }>({ _id: 1 }).toArray()
	const sampledIds: ObjectId[] = []
	for (let i = 0; i < Math.min(20, tweetIds.length); i++) { // Sample either 20 or the amount of IDs, whichever is smaller
		sampledIds.push(tweetIds.splice(Math.floor(Math.random() * tweetIds.length - 1), 1)[0]._id) // Remove IDs as they are sampled
	}
	return await Tweet.find({ _id: { $in: sampledIds } }).toArray()
}

export const router = t.router({
	// User
	deleteUser: isUserProcedure
		.mutation(async ({ ctx }) => (await ctx.User.deleteOne(ctx.User)).acknowledged),
	markTweet: isUserProcedure
		.input(z.array(zTweetSchema))
		.mutation(async ({ input, ctx }) =>
			(
				await ctx.User.updateOne(ctx.user, {
					$push: { viewedPosts: { $each: input.map(tweet => tweet.tweet_id) } },
				})
			).acknowledged
		),

	// Tweet
	getRandomTweets: publicProcedure
		.input(zTweetSchema.pick({ stackUsername: true }))
		.query(async ({ input, ctx }) => await queryRandomTweets(ctx.Tweet, input)),
	getRandomUnviewedTweets: isUserProcedure
		.input(zTweetSchema.pick({ stackUsername: true }))
		.query(async ({ input, ctx }) =>
			await queryRandomTweets(ctx.Tweet, {
				stackUsername: input.stackUsername,
				tweet_id: { $nin: ctx.user.viewedPosts },
			})
		),
	getTweets: publicProcedure
		.input(z.object({
			tweetFilter: zTweetSchema.or(z.record(zTweetSchema.keyof(), z.any())).describe("Accepts either a plain tweet filter or a mongodb filter object"),
			tweetSorter: z.record(zTweetSchema.keyof(), z.literal(1).or(z.literal(-1))).default({ date_time: 1 }).describe("A record with keys of tweet properties, and values of 1 (ascending) or -1 (descending)"),
			page: z.number().min(1).default(1),
			pageSize: z.number().max(100).min(1).default(20)
		}))
		.output(z.array(zTweetSchema))
		.query(async ({ input, ctx }) => ((await ctx.Tweet
			.aggregate([
				{ $match: input.tweetFilter },
				{ $sort: Object.keys(input.tweetSorter).length == 0 ? { date_time: 1 } : input.tweetSorter }, // Cover the case of {}. Maintain default in validation for documentation
				{
					$facet: {
						data: [{ $skip: (input.page - 1) * input.pageSize }, { $limit: input.pageSize }]
					}
				}
			]).toArray()) as { data: TweetSchema[] }[]) [0].data),
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

export type AppRouter = typeof router
