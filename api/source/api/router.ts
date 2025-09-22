import { initTRPC, TRPCError } from '@trpc/server'
import { type OperationMeta } from 'openapi-trpc'
import z from 'zod'

import { type TweetSchema, zStackSchema, zTweetSchema } from './schemas.js'
import { createLocalContext } from '../local.js'
import { checkIsAdmin, getUser } from '../utils/auth.js'
import { queryRandomTweets } from './db.js'

//TODO: rate limiting with cloudflare
const t = initTRPC
	.meta<OperationMeta>()
	.context<Awaited<ReturnType<typeof createLocalContext>>>()
	.create()
const publicProcedure = t.procedure

const ACKNOWLEDGE_DESCRIPTION = "Whether the operation was acknowledged"

const isUserProcedure = t.procedure.use(async function hasSession(opts) {
	const { ctx } = opts
	const user = await getUser(ctx)
	return opts.next({ ctx: { ...ctx, user } })
})

const isAdminProcedure = t.procedure.use(async function isAdmin(opts) {
	const { ctx } = opts
	if (!(await checkIsAdmin(ctx))) throw new TRPCError({ code: 'UNAUTHORIZED' })
	return opts.next({ ctx: { ...ctx, isAdmin: true } })
})

export const router = t.router({
	// User
	deleteUser: isUserProcedure
		.mutation(async ({ ctx }) => (await ctx.User.deleteOne(ctx.User)).acknowledged),
	markTweet: isUserProcedure
		.input(z.array(zTweetSchema))
		.mutation(async ({ input, ctx }) =>{
			const found = await ctx.Tweet.findOne(input[0])
			console.log("found", !!found)
			const result = (
				await ctx.User.updateOne(ctx.user, {
					$push: { viewedPosts: { $each: input.map(tweet => tweet.tweet_id) } },
				})
			).acknowledged
			console.log(result)
		}),

	// Tweet
	getRandomTweets: publicProcedure
		.input(zTweetSchema.pick({ stackUsername: true }).and(zTweetSchema.partial()))
		.query(async ({ input, ctx }) => {
			if (input.isBanned && !(await checkIsAdmin(ctx))) {
				throw new TRPCError({ code: 'FORBIDDEN', message: "User not authenticated" })
			}
			return await queryRandomTweets(ctx.Tweet, ctx.User, input, ctx.user)
		}),
	getRandomUnviewedTweets: isUserProcedure
		.input(zTweetSchema.pick({ stackUsername: true }).and(zTweetSchema.partial()))
		.query(async ({ input, ctx }) => {
			if (input.isBanned && !(await checkIsAdmin(ctx))) {
				throw new TRPCError({ code: 'FORBIDDEN', message: "User not authenticated" })
			}
			// first, filter by posts sent to the user. Sometimes, a post is sent but never seen. When this list is empty, consult the viewed posts list.
			const unsentTweets = await queryRandomTweets(ctx.Tweet, ctx.User, 
				{
					stackUsername: input.stackUsername,
					tweet_id: { $nin: ctx.user.sentPosts },
				},
				ctx.user
			)
			if (unsentTweets.length > 0) return unsentTweets
			return await queryRandomTweets(ctx.Tweet, ctx.User, 
				{
					stackUsername: input.stackUsername,
					tweet_id: { $nin: ctx.user.viewedPosts }
				},
				ctx.user
			)
		}),
	getTweets: publicProcedure
		.input(z.object({
			tweetFilter: zTweetSchema.partial().describe("Accepts either a plain tweet filter or a mongodb filter object"),
			tweetSorter: z.record(zTweetSchema.keyof(), z.literal(1).or(z.literal(-1))).default({ date_time: 1 }).describe("A record with keys of tweet properties, and values of 1 (ascending) or -1 (descending)"),
			page: z.number().min(1).default(1),
			pageSize: z.number().max(100).min(1).default(20)
		}))
		.output(z.array(zTweetSchema))
		.query(async ({ input, ctx }) => {
			const isSearchingForBans = input.tweetFilter.isBanned
			if (isSearchingForBans && !(await checkIsAdmin(ctx))) {
				throw new TRPCError({ code: 'FORBIDDEN', message: "User not authenticated" })
			}
			const tagsBeingSearched = input.tweetFilter.tagSet
			if (tagsBeingSearched) {
				const user = await getUser(ctx)
				for (const tag of tagsBeingSearched) {
					if (user.userToken != tag.owner) throw new TRPCError({ code: 'FORBIDDEN', message: "User is not owner of requested tag" })
				}
			}
			const aggregationResult = ((await ctx.Tweet
				.aggregate([
					{ $match: input.tweetFilter },
					{ $sort: Object.keys(input.tweetSorter).length == 0 ? { date_time: 1 } : input.tweetSorter }, // Cover the case of {}. Maintain default in validation for documentation
					{
						$facet: {
							data: [{ $skip: (input.page - 1) * input.pageSize }, { $limit: input.pageSize }]
						}
					}
				]).toArray()) as { data: TweetSchema[] }[])[0].data
			return aggregationResult
		}),
	createTweets: isAdminProcedure
		.input(z.array(zTweetSchema))
		.output(z.boolean().describe(ACKNOWLEDGE_DESCRIPTION))
		.mutation(async ({ input, ctx }) => (await ctx.Tweet.insertMany(input)).acknowledged),
	banTweet: isAdminProcedure
		.input(zTweetSchema)
		.output(z.boolean().describe(ACKNOWLEDGE_DESCRIPTION))
		.mutation(async ({ input, ctx }) => (await ctx.Tweet.updateOne(input, { $set: { isBanned: true }} )).acknowledged),

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
