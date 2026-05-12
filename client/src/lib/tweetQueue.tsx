import { useCallback, useEffect, useRef, type RefObject } from 'react'
import type { TweetClient } from '../../../api/source/api/schemas'
import { defaultTrpcClient } from '../trpc'
import throttle from 'lodash/throttle'
import { useTweetCache } from './tweetCache/contexts'

type TweetQuery = ReturnType<typeof defaultTrpcClient.getTweets.query>
export type TweetWithBlobs = {
	data: TweetClient
	blobs: Promise<string>[]
}

export function useTweetQueue(
	getFirstTweet: (() => TweetQuery) | null,
	getNextTweet: (batchIndex: number) => TweetQuery,
	stackRef: RefObject<HTMLDivElement | null>
) {
	const { addTweetBatch, setIsLoading } = useTweetCache()
	const batchIndexRef = useRef(0)

	// Tweet-adding functions
	const addBatchToBatches = useCallback(
		(batch: Awaited<ReturnType<typeof getNextTweet>>) => {
			setIsLoading(false)
			const batchWithBlobs = batch.map(data => ({
				data,
				blobs: getMediaBlobs(data),
			})) satisfies TweetWithBlobs[]
			addTweetBatch(batchWithBlobs)
		},
		[addTweetBatch, setIsLoading]
	)

	const loadMoreTweets = useCallback(() => {
		getNextTweet(batchIndexRef.current++).then(addBatchToBatches)
	}, [addBatchToBatches, getNextTweet])

	// On first load
	const { hasLoadedInitialTweetsRef } = useTweetCache()
	const loadInitialTweets = useCallback(async () => {
		if (hasLoadedInitialTweetsRef.current) return

		await getFirstTweet?.().then(addBatchToBatches)
		loadMoreTweets()
		hasLoadedInitialTweetsRef.current = true
	}, [addBatchToBatches, getFirstTweet, hasLoadedInitialTweetsRef, loadMoreTweets])
	useEffect(() => void loadInitialTweets(), [loadInitialTweets])

	// Load on scroll
	useEffect(() => {
		const handleScroll = throttle(() => {
			const stack = stackRef.current
			if (!stack) return

			const distanceToBottom = stack.getBoundingClientRect().bottom
			if (distanceToBottom > 6000) return

			loadMoreTweets()
		}, 500)

		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [loadMoreTweets, stackRef])

	const { tweetBatches, isLoading } = useTweetCache()
	return [tweetBatches, isLoading] as const
}

function getMediaBlobs(tweet: Awaited<TweetQuery>[number]) {
	return tweet.media_url.map(url =>
		url.includes('m3u8') || url.includes('mp4')
			? new Promise<string>(resolve => resolve(url))
			: fetch(url)
					.then(response => response.blob())
					.then(data => URL.createObjectURL(data))
	)
}
