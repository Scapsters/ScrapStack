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
    uuid: z.uuidv7(),
    viewedPosts: z.array(z.number())
})
export const zUserDB = zUserSchema.and(DBObject)
export type UserSchema = z.infer<typeof zUserSchema>
export type UserDB = z.infer<typeof zUserDB>

export const zTweetSchema = z.object({
    statusId: z.number()
})
export const zTweetDB = zTweetSchema.and(DBObject)
export type TweetSchema = z.infer<typeof zTweetSchema>
export type TweetDB = z.infer<typeof zTweetDB>