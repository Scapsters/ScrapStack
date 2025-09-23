import { Collection, ObjectId, type StrictFilter } from "mongodb"
import type { TweetSchema, UserSchema } from "./schemas.js"

export async function queryRandomTweets(
    Tweet: Collection<TweetSchema>,
    User: Collection<UserSchema>,
    filter: StrictFilter<TweetSchema>, 
    user: UserSchema | null
) {
    const tweetIds = await Tweet.find(filter).project<{ _id: ObjectId }>({ _id: 1 }).toArray()
    const sampledIds: ObjectId[] = []
    const length = tweetIds.length
    for (let i = 0; i < Math.min(20, length); i++) { // Sample either 20 or the amount of IDs, whichever is smaller
        sampledIds.push(tweetIds.splice(Math.floor(Math.random() * tweetIds.length), 1)[0]._id) // Remove IDs as they are sampled
    }
    const sampledTweets = await Tweet.find({ _id: { $in: sampledIds } }).toArray()
    if (user) {
        await User.updateOne(user, {
            $push: { sentPosts: { $each: sampledTweets.map(tweet => tweet.tweet_id) } }
        })
    }
    return sampledTweets
}