import { ObjectId } from "mongodb"
import z from "zod"

const zObjectId = z.union([z.instanceof(ObjectId), z.string().regex(/^[0-9a-fA-F]{24}$/)])
  .transform(val => val instanceof ObjectId ? val : new ObjectId(val));

export const zUserSchema = z.object({
  userToken: z.string(),
  viewedPosts: z.array(zObjectId),
  sentPosts: z.array(zObjectId),
})
export type UserSchema = z.infer<typeof zUserSchema>
export const zUserClient = zUserSchema.extend({ _id: z.string() })
export type UserClient = z.infer<typeof zUserClient>
export const zUser = zUserSchema.extend({ _id: zObjectId })
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
export type TweetSchema = z.infer<typeof zTweetSchema>
export const zTweetClient = zTweetSchema.extend({ _id: z.string() })
export type TweetClient = z.infer<typeof zTweetClient>
export const zTweet = zTweetSchema.extend({ _id: zObjectId })
export type Tweet = z.infer<typeof zTweet>

export const zStackSchema = z.object({
  twitterHandle: z.string(),
  postCount: z.number()
})
export type StackSchema = z.infer<typeof zStackSchema>
export const zStackClient = zStackSchema.extend({ _id: z.string() })
export type StackClient = z.infer<typeof zStackClient>
export const zStack = zStackSchema.extend({ _id: zObjectId })
export type Stack = z.infer<typeof zStack>