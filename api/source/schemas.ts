import z from "zod"

const DBObject = z.object({ _id: z.string() }).strict()

export const zMeowSchema = z.object({
    name: z.string(),
    value: z.number(),
}).strict()
export const zMeowDB = zMeowSchema.and(DBObject)
export type MeowSchema = z.infer<typeof zMeowSchema>
export type MeowDB = z.infer<typeof zMeowDB>


export const zUserSchema = z.object({
    userToken: z.string(),
    viewedPosts: z.array(z.number())
})
export const zUserDB = zUserSchema.and(DBObject)
export type UserSchema = z.infer<typeof zUserSchema>
export type UserDB = z.infer<typeof zUserDB>


export const zTweetSchema = z.object({
    stackId: z.number(),
    statusId: z.number(),
    date: z.date(),
    order: z.number(),
    text: z.string(),
    displayName: z.string(),
    username: z.string(),
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