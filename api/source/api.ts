import { os } from '@orpc/server'
import { type APIGatewayProxyEventV2 } from 'aws-lambda'
import { Collection, type Filter, ObjectId } from 'mongodb'
import { createHash } from 'node:crypto'
import z from 'zod'
import { getDBClient, getSecretString } from './db.js'
import { type StackSchema, type TweetSchema, type UserSchema, zStackSchema, zTweetSchema } from './schemas.js'
import { getFromHeaders } from './utils/http.js'
import { ORPCError } from '@orpc/server'
import { RPCHandler as AWSRPCHandler } from '@orpc/server/aws-lambda'

const base = os.$context<Awaited<ReturnType<typeof createContext>>>()

async function queryRandomTweets(Tweet: Collection<TweetSchema>, filter: Filter<TweetSchema>) {
	const tweetIds = await Tweet.find(filter).project<{ _id: ObjectId }>({ _id: 1 }).toArray()
	const ids = tweetIds.map(t => t._id)
	// sample up to 20 unique ids
	const sampledIds: ObjectId[] = []
	const max = Math.min(20, ids.length)
	for (let i = 0; i < max; i++) {
		const idx = Math.floor(Math.random() * ids.length)
		sampledIds.push(ids.splice(idx, 1)[0])
	}
	return await Tweet.find({ _id: { $in: sampledIds } }).toArray()
}

const attachDB = base.middleware(async ({ context, next }) => {
	const dbClient = await getDBClient()
	const User = dbClient.db('Scrapstack').collection<UserSchema>('user')
	const Tweet = dbClient.db('Scrapstack').collection<TweetSchema>('tweet')
	const Stack = dbClient.db('Scrapstack').collection<StackSchema>('stack')
	return next({ context: { dbClient, User, Tweet, Stack }})
})

const requireUser = base.middleware(async ({ context, next }) => {
	const token = getFromHeaders('userToken', context)
	if (!context.User) throw new ORPCError('INTERNAL', 'DB not attached')
	let user = await context.User.findOne({ identifier: token })
	if (!user) {
		const res = await context.User.insertOne({ identifier: token, viewedPosts: [] })
		if (!res.acknowledged) throw new ORPCError('INTERNAL', 'JIT user creation not acknowledged')
		user = await context.User.findOne({ identifier: token })
		if (!user) throw new ORPCError('INTERNAL', 'JIT created but not found')
	}
	return next({ context: { user, userToken: token }})
})

const requireAdmin = base.middleware(async ({ context, next }) => {
	const authHeader = getFromHeaders('authorization', context) || ''
	const adminPassword = authHeader.split(' ')[1]
	if (!adminPassword) throw new ORPCError('UNAUTHORIZED', 'Missing admin bearer')
	const adminAnswer = await getSecretString('ADMIN_ANSWER')
	const isAdmin = createHash('sha256').update(adminPassword).digest('hex') === adminAnswer
	if (!isAdmin) throw new ORPCError('UNAUTHORIZED', 'Invalid admin token')
	context.isAdmin = true
	return next()
})

export const router = {
	deleteUser: base
		.use(requireUser)
		.handler(async ({ context }) => {
			return (await context.User.deleteOne(context.user)).acknowledged
		}),
	markTweet: base
		.use(requireUser)
		.input(z.array(zTweetSchema))
		.handler(async ({ input, context }) => {
			return (await context.User.updateOne(
				context.user,
				{ $push: { viewedPosts: { $each: input.map(t => t.statusId) } } }
			)).acknowledged
		}),
	getRandomTweets: base
		.input(zTweetSchema.pick({ stackId: true }))
		.handler(async ({ input, context }) => {
			return await queryRandomTweets(context.Tweet, { stackId: input.stackId })
		}),
	getRandomUnviewedTweets: base
		.use(requireUser)
		.input(zTweetSchema.pick({ stackId: true }))
		.handler(async ({ input, context }) => {
			return await queryRandomTweets(context.Tweet, {
				stackId: input.stackId,
				statusId: { $nin: context.user.viewedPosts },
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
		.handler(async ({ input, context }) => {
			return await context.Tweet.aggregate([
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
	createTweets: base
		.use(requireAdmin)
		.input(z.array(zTweetSchema))
		.output(z.boolean())
		.handler(async ({ input, context }) => {
			return (await context.Tweet.insertMany(input)).acknowledged
		}),
	getStacks: base
		.input(zStackSchema.partial())
		.output(z.array(zStackSchema))
		.handler(async ({ input, context }) => {
			return await context.Stack.find(input).toArray()
		}),
	createStack: base
		.use(requireAdmin)
		.input(zStackSchema.pick({ twitterHandle: true }))
		.output(z.boolean())
		.handler(async ({ input, context }) => {
			return (await context.Stack.insertOne({ postCount: 0, ...input })).acknowledged
		}),
	deleteStack: base
		.use(requireAdmin)
		.input(zStackSchema.pick({ twitterHandle: true }))
		.output(z.boolean())
		.handler(async ({ input, context }) => {
			return (await context.Stack.deleteOne({ ...input })).acknowledged
		}),
}

const rpcHandler = new AWSRPCHandler(router)

async function createContext(event, context) {
	const dbClient = await getDBClient()

	return {
		...event,
		...context,
		dbClient,
		User: dbClient.db('Scrapstack').collection<UserSchema>('user'),
		Tweet: dbClient.db('Scrapstack').collection<TweetSchema>('tweet'),
		Stack: dbClient.db('Scrapstack').collection<StackSchema>('stack'),
	}
}

export const handler = awslambda.streamifyResponse(async (event, responseStream, context) => {
  const { matched } = await rpcHandler.handle(event, responseStream, {
    prefix: '/rpc',
    context: createContext(event, context)
  })

  if (matched)
    return

  awslambda.HttpResponseStream.from(responseStream, {
    statusCode: 404,
  })
  responseStream.write('Not found')
  responseStream.end()
})



export type AppRouter = typeof router
