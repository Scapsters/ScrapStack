import z from "zod"

const DBObject = z.object({ _id: z.string() })

export const zUserSchema = z.object({
    userToken: z.string(),
    viewedPosts: z.array(z.string()),
    sentPosts: z.array(z.string())
})
export const zUserDB = zUserSchema.and(DBObject)
export type UserSchema = z.infer<typeof zUserSchema>
export type UserDB = z.infer<typeof zUserDB>


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
    isBanned: z.boolean(),
    tagSet: z.array(z.object({
        owner: z.string().describe("User.userToken"),
        tags: z.array(z.string())
    }))
})
export const zTweetDB = zTweetSchema.and(DBObject)
export type TweetSchema = z.infer<typeof zTweetSchema>
export type TweetDB = z.infer<typeof zTweetDB>


export const zStackSchema = z.object({
    twitterHandle: z.string(),
    postCount: z.number()
})
export const zStackDB = zStackSchema.and(DBObject)
export type StackSchema = z.infer<typeof zStackSchema>
export type StackDB = z.infer<typeof zStackDB>