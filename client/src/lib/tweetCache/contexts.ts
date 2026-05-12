import { createUseContext } from "../contexts"
import type { TweetWithBlobs } from "../tweetQueue"
import { createContext, type Dispatch, type SetStateAction } from "react"

export type TweetCacheStore = {
    tweetBatches: TweetWithBlobs[][]
    addTweetBatch: (tweetBatch: TweetWithBlobs[]) => void
    hasLoadedInitialTweetsRef: React.RefObject<boolean>
    isLoading: boolean
    setIsLoading: Dispatch<SetStateAction<boolean>>
}

export const TweetCacheContext = createContext<TweetCacheStore | null>(null)

export const useTweetCache = createUseContext(TweetCacheContext)