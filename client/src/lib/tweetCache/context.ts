import { createUseContext } from "../contexts"
import type { TweetWithBlobs } from "../tweetQueue"
import { createContext } from "react"

export const TweetCacheContext = createContext<{
    tweetBatches: TweetWithBlobs[][]
    addTweetBatch: (tweetBatch: TweetWithBlobs[]) => void
} | null>(null)

export const useTweetCache = createUseContext(TweetCacheContext)