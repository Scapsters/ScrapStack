import { useEffect, useRef, useState } from "react"
import type { TweetWithURLs } from "./tweetQueue"

export const useTweet = (tweet: TweetWithURLs): [React.ReactNode, boolean, () => void] => {
    const [urls, areURLsLoading] = usePromise<string[]>(Promise.all(tweet.mediaUrlBlobs), [])
    return [urls.map((url) => <img src={url}></img>), areURLsLoading, tweet.view]
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
    }, [ref, ref.current])

    const removeListener = () => {
        observerRef.current?.disconnect()
        observerRef.current = null
    }

    return [isIntersecting, removeListener]
}
