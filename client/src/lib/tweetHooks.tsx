import { useContext, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
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

// https://dev.to/bcncodeschool/detecting-if-an-element-is-in-view-with-react-5b60
export function useIsVisible(ref: RefObject<HTMLElement | null>, loose?: boolean) {
	const [isVisible, setIsVisible] = useState(false)
	const observerRef = useRef<IntersectionObserver | null>(null)

	useEffect(() => {
		const current = ref.current
		if (!current) return

		const observer = new IntersectionObserver(
			([entry]) => {
				setIsVisible(entry.isIntersecting)
			},
			{
				root: null, // viewport
				rootMargin: loose ? '200px 0px' : '-50% 0px -50% 0px', // loose includes anywhere on screen + space above top and bottm, while not strict leaves only a horizontal strip at mid-screen
				threshold: 0, // trigger as soon as it touches that strip
			}
		)

		observer.observe(current)
		observerRef.current = observer

		return () => {
			observer.disconnect()
			observerRef.current = null
		}
	}, [loose, ref])

	const removeListener = () => {
		observerRef.current?.disconnect()
		observerRef.current = null
	}

	return [isVisible, removeListener] as const
}
