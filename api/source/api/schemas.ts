import { ObjectId } from "mongodb"
import z from "zod"

const zDBObject = z.object({ _id: z.instanceof(ObjectId) })
const zDBObjectClient = z.object({ _id: z.string() });


export const zUserSchema = z.object({
    userToken: z.string(),
    viewedPosts: z.array(z.instanceof(ObjectId)),
    sentPosts: z.array(z.instanceof(ObjectId))
})
export const zUserInput = zUserSchema.merge(zDBObjectClient)
export const zUser = zUserSchema.merge(zDBObject)
export type UserSchema = z.infer<typeof zUserSchema>
export type UserInput = z.infer<typeof zUserInput>
export type User = z.infer<typeof zUser>


export const zTweetSchema = z.object({
    stackUsername: z.string().describe("Stack.twitterHandle"),
    tweet_id: z.string(),
    tweet_link: z.string(),
    date_time: z.string(),
    content: z.string(),
    user: z.string(),
    handle: z.string(),
    is_quote_tweet: z.boolean(),
    replying_to: z.string(),
    media_url: z.array(z.string()),
    has_media: z.boolean(),
    profile_img: z.string(),
    quote_tweet_text: z.string(),
    quote_tweet_images: z.array(z.string()),
    isBanned: z.boolean(),
    tagSet: z.array(z.object({
        owner: z.string().describe("User.userToken"),
        tags: z.array(z.string())
    }))
})
export const zTweetInput = zTweetSchema.merge(zDBObjectClient)
export const zTweet = zTweetSchema.merge(zDBObject)
export type TweetSchema = z.infer<typeof zTweetSchema>
export type TweetInput = z.infer<typeof zTweetInput>
export type Tweet = z.infer<typeof zTweet>


export const zStackSchema = z.object({
    twitterHandle: z.string(),
    postCount: z.number()
})
export const zStackInput = zStackSchema.merge(zDBObjectClient)
export const zStack = zStackSchema.merge(zDBObject)
export type StackSchema = z.infer<typeof zStackSchema>
export type StackInput = z.infer<typeof zStackInput>
export type Stack = z.infer<typeof zStack>