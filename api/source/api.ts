import { os } from '@orpc/server'
import { Collection, type Filter, ObjectId } from 'mongodb'
import { createHash } from 'node:crypto'
import z from 'zod'
import { getDBClient, getSecretString } from './db.js'
import { type StackSchema, type TweetSchema, type UserSchema, zStackSchema, zTweetSchema } from './schemas.js'
import { getFromHeaders } from './utils/http.js'
import { ORPCError } from '@orpc/server'
import { RPCHandler as AWSRPCHandler } from '@orpc/server/aws-lambda'
// @ts-ignore
import type { Context, APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

const base = os.$context()

async function queryRandomTweets(Tweet: Collection<TweetSchema>, filter: Filter<TweetSchema>) {
	const tweetIds = await Tweet.find(filter).project<{ _id: ObjectId }>({ _id: 1 }).toArray()
	const ids = tweetIds.map(t => t._id)
	const sampledIds: ObjectId[] = []
	for (let i = 0; i < Math.min(20, ids.length); i++) { // No more than 20
		const index = Math.floor(Math.random() * ids.length)
		sampledIds.push(ids.splice(index, 1)[0]) // Remove as we sample
	}
	return await Tweet.find({ _id: { $in: sampledIds } }).toArray()
}

const requireUser = base.use(
	base.middleware<{ user: UserSchema, userToken: string }, unknown>(async ({ context: { User, event }, next }) => {
		const userToken = getFromHeaders('userToken', event)
		if (!User) throw new ORPCError('INTERNAL', 'DB not attached')
		let user = await User.findOne({ userToken })
		if (!user) {
			const res = await User.insertOne({ userToken, viewedPosts: [] })
			if (!res.acknowledged) throw new ORPCError('INTERNAL', 'JIT user creation not acknowledged')
			user = await User.findOne({ userToken })
			if (!user) throw new ORPCError('INTERNAL', 'JIT created but not found')
		}
		return next({ context: { user, userToken } })
	})
)

const requireTheseNuts = base.middleware(async ({ context: { User, event }, next }) => {
		const userToken = getFromHeaders('userToken', event)
		if (!User) throw new ORPCError('INTERNAL', 'DB not attached')
		let user = await User.findOne({ userToken })
		if (!user) {
			const res = await User.insertOne({ userToken, viewedPosts: [] })
			if (!res.acknowledged) throw new ORPCError('INTERNAL', 'JIT user creation not acknowledged')
			user = await User.findOne({ userToken })
			if (!user) throw new ORPCError('INTERNAL', 'JIT created but not found')
		}
		return next({ context: { user, userToken } })
	})

const requireAdmin = base.use(
	base.middleware(async ({ context: { event }, next }) => {
		const authHeader = getFromHeaders('authorization', event) || ''
		const adminPassword = authHeader.split(' ')[1]
		if (!adminPassword) throw new ORPCError('UNAUTHORIZED', 'Missing admin bearer')
		const adminAnswer = await getSecretString('ADMIN_ANSWER')
		const isAdmin = createHash('sha256').update(adminPassword).digest('hex') === adminAnswer
		if (!isAdmin) throw new ORPCError('UNAUTHORIZED', 'Invalid admin token')
		return next({ context: { isAdmin: true } })
	})
)

export const router = {
	// Users
	deleteUser: base.use(requireTheseNuts)
		.handler(async ({ context: { User, user } }) => {
			return (await User.deleteOne(user)).acknowledged
		}),

	// Tweets
	markTweet: requireUser
		.input(z.array(zTweetSchema))
		.handler(async ({ input, context: { User, user } }) => {
			return (await User.updateOne(
				user, { $push: { viewedPosts: { $each: input.map(t => t.statusId) } } }
			)).acknowledged
		}),
	getRandomTweets: base
		.input(zTweetSchema.pick({ stackId: true }))
		.handler(async ({ input, context: { Tweet } }) => {
			return await queryRandomTweets(Tweet, { stackId: input.stackId })
		}),
	getRandomUnviewedTweets: requireUser
		.input(zTweetSchema.pick({ stackId: true }))
		.handler(async ({ input, context: { Tweet, user } }) => {
			return await queryRandomTweets(Tweet, {
				stackId: input.stackId,
				statusId: { $nin: user.viewedPosts },
			})
		}),
	getTweets: base
		.input(z.object({
			tweetFilter: z.any().describe("Accepts either a plain tweet filter or a mongodb filter object"),
			tweetSorter: z.record(zTweetSchema.keyof(), z.union([z.literal(1), z.literal(-1)])),
			page: z.number(),
			pageSize: z.number()
		}))
		.output(z.array(z.object({ metadata: z.number(), data: z.array(zTweetSchema) })))
		.handler(async ({ input, context: { Tweet } }) => {
			return await Tweet.aggregate([
				{ $match: input.tweetFilter },
				{ $sort: input.tweetSorter },
				{
					$facet: {
						metadata: [{ $count: 'count' }],
						data: [{ $skip: (input.page - 1) * input.pageSize }, { $limit: input.pageSize }]
					}
				}
			]).toArray()
		}),
	createTweets: requireAdmin
		.input(z.array(zTweetSchema))
		.output(z.boolean())
		.handler(async ({ input, context: { Tweet } }) => {
			return (await Tweet.insertMany(input)).acknowledged
		}),

	// Stacks
	getStacks: base
		.input(zStackSchema.partial())
		.output(z.array(zStackSchema))
		.handler(async ({ input, context: { Stack } }) => {
			return await Stack.find(input).toArray()
		}),
	createStack: requireAdmin
		.input(zStackSchema.pick({ twitterHandle: true }))
		.output(z.boolean())
		.handler(async ({ input, context: { Stack } }) => {
			return (await Stack.insertOne({ postCount: 0, ...input })).acknowledged
		}),
	deleteStack: requireAdmin
		.input(zStackSchema.pick({ twitterHandle: true }))
		.output(z.boolean())
		.handler(async ({ input, context: { Stack } }) => {
			return (await Stack.deleteOne({ ...input })).acknowledged
		}),
}

const rpcHandler = new AWSRPCHandler(router)

async function createContext(
	event: APIGatewayProxyEventV2,
	context: Context
) {
	const dbClient = await getDBClient()

	return {
		event,
		context,
		dbClient,
		User: dbClient.db('Scrapstack').collection<UserSchema>('user'),
		Tweet: dbClient.db('Scrapstack').collection<TweetSchema>('tweet'),
		Stack: dbClient.db('Scrapstack').collection<StackSchema>('stack'),
	}
}

export const handler = awslambda.streamifyResponse(async (
	event: APIGatewayProxyEventV2, 
	responseStream: any, 
	context: Context
) => {
	const { matched } = await rpcHandler.handle(event, responseStream, {
		prefix: '/rpc',
		context: await createContext(event, context)
	})

	if (matched) return

	awslambda.HttpResponseStream.from(responseStream, {
		statusCode: 404,
	})
	responseStream.write('Not found')
	responseStream.end()
})



export type AppRouter = typeof router

const testRouter = {
	
}