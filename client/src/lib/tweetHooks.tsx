import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { TweetWithBlobs } from './tweetQueue'
import Player from '@/components/player/Player'
import FullscreenableImage from '@/components/Image'
import { TrpcClient } from '@/trpc'

export const useTweet = (tweet: TweetWithBlobs, markAsStable: () => void) => {
	const mediaPromise = useMemo(() => Promise.all(tweet.blobs), [tweet.blobs])
	const [urls, areURLsLoading] = usePromise(mediaPromise, [])
	const trpcClient = useContext(TrpcClient)

	const loadStatuses = useRef<Map<string, boolean>>(new Map(urls.map(url => [url, false])))
	const handleLoad = (url: string) => {
		loadStatuses.current.set(url, true)
		if ([...loadStatuses.current.values()].every(loaded => loaded)) markAsStable()
	}

	return [
		urls.map(url =>
			url.includes('mp4') || url.includes('m3u8') ? (
				<Player
					key={url}
					src={url}
					onLoad={() => handleLoad(url)}
					className="min-w-0 max-h-full rounded-lg border-1 border-black/10"
				/>
			) : (
				<FullscreenableImage key={url} onLoad={() => handleLoad(url)} src={url} />
			)
		),
		areURLsLoading,
		() => trpcClient.markTweet.mutate([tweet.data]),
	] as const
}

export function usePromise<T>(promise: Promise<T>, defaultValue: T): [T, boolean]
export function usePromise<T>(promise: Promise<T>, defaultValue: null): [T | null, boolean]
export function usePromise<T>(promise: Promise<T>, defaultValue: T | null) {
	const [data, setData] = useState<T | null>(defaultValue)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const awaitData = async () => {
			if (!promise) return
			try {
				setData(await promise)
			} catch (error) {
				console.error('Error fetching data:', error)
			} finally {
				setIsLoading(false)
			}
		}
		awaitData()
	}, [promise])

	return [data, isLoading]
}
