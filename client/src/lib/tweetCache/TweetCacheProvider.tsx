import { useState, type ReactNode } from 'react'
import type { TweetWithBlobs } from '../tweetQueue'
import { TweetCacheContext } from './contexts'

export function TweetCacheProvider({ stackKey, children }: { stackKey: string; children: ReactNode }) {
	const [tweetCache, setTweetCache] = useState<{ [index: string]: TweetWithBlobs[][] }>({})

	const tweetBatches = tweetCache[stackKey] ?? []

	function addTweetBatch(tweetBatch: TweetWithBlobs[]) {
		setTweetCache(previous => ({
			...previous,
			[stackKey]: [...(previous[stackKey] ?? []), tweetBatch],
		}))
	}

	return <TweetCacheContext.Provider value={{ tweetBatches, addTweetBatch }}>{children}</TweetCacheContext.Provider>
}
