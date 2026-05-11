import type { TweetWithBlobs } from "../tweetQueue"
import { createContext, useContext } from "react"

export const TweetCacheContext = createContext<{
    tweetBatches: TweetWithBlobs[][]
    addTweetBatch: (tweetBatch: TweetWithBlobs[]) => void
} | null>(null)

export function useTweetCache() {
    const ctx = useContext(TweetCacheContext)
    if (!ctx) throw new Error('Tweet cache context is undefined')
    return ctx
}