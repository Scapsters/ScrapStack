import { initTRPC } from '@trpc/server'
import { getDBClient } from './db'
import { awsLambdaRequestHandler, CreateAWSLambdaContextOptions } from '@trpc/server/adapters/aws-lambda'
import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import { TweetSchema, UserSchema, zTweetSchema } from './schemas'
import z from 'zod'
import { getFromHeaders } from './utils/http'
import { getSessionUser } from './utils/user'

const t = initTRPC.context<Awaited<ReturnType<typeof createContext>>>().create()
const publicProcedure = t.procedure

const router = t.router({
    createUser: publicProcedure.query(async ({ ctx }) => {
        return (await ctx.User.insertOne({ uuid: getFromHeaders('user_uuid', ctx), viewedPosts: [] })).acknowledged
    }),
    deleteUser: publicProcedure.query(async ({ ctx }) => {
        return (await ctx.User.deleteOne({ uuid: getFromHeaders('user_uuid', ctx) })).acknowledged
    }),

    getRandomUnviewedTweets: publicProcedure.query(async ({ ctx }) => {
        return ctx.Tweet.find({ statusId: { $nin: (await getSessionUser(ctx)).viewedPosts } })
    }),
    markTweetsAsViewed: publicProcedure.input(z.array(zTweetSchema)).query(async ({ input, ctx }) => {
        return ctx.User.updateOne(await getSessionUser(ctx), { $push: { viewedPosts: { $each: input.map(tweet => tweet.statusId) } } })
    }),
})

const createContext = async (opts: CreateAWSLambdaContextOptions<APIGatewayProxyEventV2>) => {
    const dbClient = await getDBClient()
    return {
        ...opts,
        dbClient: dbClient,
        User: dbClient.db('Scrapstack').collection<UserSchema>('user'),
        Tweet: dbClient.db('Scrapstack').collection<TweetSchema>('tweet'),
    }
}

export const handle_request = awsLambdaRequestHandler({
    router,
    createContext,
})

export type AppRouter = typeof router
