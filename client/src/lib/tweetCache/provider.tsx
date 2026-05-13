import { useRef, useState, type ReactNode } from 'react'
import type { TweetWithBlobs } from '../tweetQueue'
import { TweetCacheContext } from './contexts'
import { useStackKey } from '../keys/contexts'

export function TweetCacheProvider({ children }: { children: ReactNode }) {
	const [tweetCache, setTweetCache] = useState<{ [index: string]: TweetWithBlobs[][] }>({})
	const { stackKey } = useStackKey()

	const tweetBatches = tweetCache[stackKey] ?? []

	function addTweetBatch(tweetBatch: TweetWithBlobs[]) {
		setTweetCache(previous => ({
			...previous,
			[stackKey]: [...(previous[stackKey] ?? []), tweetBatch],
		}))
	}

	const hasLoadedInitialTweetsRef = useRef(false)

	const [isLoading, setIsLoading] = useState(false)

	return <TweetCacheContext.Provider value={{ tweetBatches, addTweetBatch, hasLoadedInitialTweetsRef, isLoading, setIsLoading }}>{children}</TweetCacheContext.Provider>
}
