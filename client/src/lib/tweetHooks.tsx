import { useEffect, useMemo, useRef, useState } from "react"
import type { TweetWithURLs } from "./tweetQueue"
import { trpcClient } from "@/trpc"

export const useTweet = (tweet: TweetWithURLs): [React.ReactNode[], boolean, () => void] => {
    const mediaPromise = useMemo(() => Promise.all(tweet.mediaUrlBlobs), [tweet.mediaUrlBlobs])
    const [urls, areURLsLoading] = usePromise(mediaPromise, [])
    return [
        urls.map((url) => url.includes("mp4") ? <video src={url} className="rounded-lg border-1 border-black/10"></video> : <img className="rounded-lg border-1 border-black/10" src={url}></img>),
        areURLsLoading,
        () => trpcClient.markTweet.mutate([tweet.data])
    ]
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
export function useIsVisible(ref: React.RefObject<HTMLElement | null>): [boolean, () => void] {
    const [isIntersecting, setIntersecting] = useState(false)
    const observerRef = useRef<IntersectionObserver | null>(null)

    useEffect(() => {
        if (!ref.current)
			return

        const observer = new IntersectionObserver(([entry]) => {
            setIntersecting(entry.isIntersecting)
        })

        observer.observe(ref.current)
        observerRef.current = observer

        return () => {
            observer.disconnect()
            observerRef.current = null
        }
    }, [ref])

    const removeListener = () => {
        observerRef.current?.disconnect()
        observerRef.current = null
    }

    return [isIntersecting, removeListener]
}
