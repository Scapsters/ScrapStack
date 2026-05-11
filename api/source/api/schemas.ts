import { ObjectId } from "mongodb"
import z from "zod"

const zObjectId = z.union([z.instanceof(ObjectId), z.string().regex(/^[0-9a-fA-F]{24}$/)])
  .transform(val => val instanceof ObjectId ? val : new ObjectId(val));

/* 
 * Note on UserClient vs. User 
 *
 * In terms of the patterns in this file, z.input<typeof zX> is nearly identical to z.infer<typeof zX>
 * The only difference is that z.infer outputs the exact types (_id is always an ObjectId) and 
 * z.input outputs what is needed to create those types (Because mongodb could easily turn a string into an ObjectId, _id is either ObjectId or string)
 * To use the z.infer in the frontend would require some crazy cryptography package to satisfy monogdb, so that is why the input one is for usage in the frontend.
 */

export const zUserSchema = z.object({
  userToken: z.string(),
  viewedPosts: z.array(zObjectId),
  sentPosts: z.array(zObjectId),
})
export const zUser = zUserSchema.extend({ _id: zObjectId })
export type UserSchema = z.infer<typeof zUserSchema>
export type UserClient = z.input<typeof zUser>
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
export const zTweet = zTweetSchema.extend({ _id: zObjectId })
export type TweetSchema = z.infer<typeof zTweetSchema>
export type TweetClient = z.input<typeof zTweet>
export type Tweet = z.infer<typeof zTweet>

export const zStackSchema = z.object({
  twitterHandle: z.string(),
  postCount: z.number()
})
export const zStack = zStackSchema.extend({ _id: zObjectId })
export type StackSchema = z.infer<typeof zStackSchema>
export type StackClient = z.infer<typeof zStack>
export type Stack = z.infer<typeof zStack>