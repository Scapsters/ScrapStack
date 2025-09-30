import { Collection, type StrictFilter } from "mongodb"
import type { Tweet, TweetSchema, User, UserSchema } from "./schemas.js"

export async function queryRandomTweets(
    Tweet: Collection<TweetSchema>,
    User: Collection<UserSchema>,
    filter: StrictFilter<TweetSchema>, 
    user: User | null
) {
    const count = await Tweet.countDocuments(filter);
    if (count === 0) return [];
    const sampledTweets = await Tweet.aggregate([
        { $match: filter },
        { $sample: { size: Math.min(5, count) } }
    ]).toArray() as Tweet[]

    if (user) {
        await User.updateOne({ _id : user._id }, {
            $addToSet: { sentPosts: { $each: sampledTweets.map(tweet => tweet._id) } }
        })
    }
    return sampledTweets
}