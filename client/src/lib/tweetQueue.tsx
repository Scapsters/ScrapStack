import { useCallback, useEffect, useRef, useState, type JSX } from 'react'
import type { TweetSchema } from '../../../api/source/api/schemas'
import { trpcClient } from '../trpc'
import { TweetBatch } from '../Tweet'
import type { defaultSearchValues } from '../Stack'
import throttle from 'lodash/throttle'

type TweetQuery = ReturnType<typeof trpcClient.getTweets.query>
export type TweetWithURLs = {
    data: TweetSchema
    mediaUrlBlobs: Promise<string>[]
}

export function useTweetQueue(
    getNextTweet: (batchIndex: number) => TweetQuery,
    openSearchWith: (values: typeof defaultSearchValues) => void,
    scrollTop: number,
    queryName: string,
    firstTweet?: () => TweetQuery,
) {
    const [isLoading, setIsLoading] = useState(false)
    const [cache, setCache] = useState<Cache>({
        [queryName]: {
            batches: [], heights: [], scrollHeight: 0, totalBatches: 0, tweetsViewed: 0
        }
    })

    const maxLead = 2
    const batchSize = 5 //TODO: make is not hardcode

    const extract = useCallback(async (query: TweetQuery): Promise<TweetWithURLs[]> => {
        return query.then((tweets) =>
            tweets.map((tweet) => {
                const mediaUrlResponses = tweet.media_url.map((url) => fetch(url))
                const mediaUrlBlobs = mediaUrlResponses.map((response) =>
                    response.then((response) => response.blob()).then((data) => URL.createObjectURL(data))
                )
                return {
                    data: tweet,
                    mediaUrlBlobs,
                    view: () => trpcClient.markTweet.mutate([tweet])
                }
            })
        )
    }, [])

    const view = useCallback(() => {
        setCache(cache => ({
            ...cache,
            [queryName]: {
                ...cache[queryName],
                tweetsViewed: cache[queryName].tweetsViewed + 1
            }
        }))
    }, [queryName])

    const makeTweetBatches = useCallback((promises: Promise<TweetWithURLs[]>[], batchIndex: number) => promises.map((batch, index) => {
        const setOwnHeight = (height: number) => {
            setCache(cache => ({
                ...cache,
                [queryName]: {
                    ...cache[queryName],
                    heights: [
                        ...cache[queryName].heights.slice(0, batchIndex),
                        height,
                        ...cache[queryName].heights.slice(batchIndex + 1)
                    ]
                }
            }))
        }
        return <TweetBatch key={queryName + batchIndex + index} batchPromise={batch} view={view} openSearchWith={openSearchWith} setOwnHeight={setOwnHeight} />
    }), [openSearchWith, queryName, view])

    const totalBatchesViewed = cache[queryName].tweetsViewed / batchSize
    const batchesLeft = cache[queryName].totalBatches - totalBatchesViewed
    const batchesToGet = maxLead - batchesLeft
    console.log("queuenums", totalBatchesViewed, cache[queryName].totalBatches, batchesToGet)
    
    const currentBatches = cache[queryName].batches
    for (let i = 0; i < batchesToGet; i++) {
        if (cache[queryName].totalBatches == 0) setIsLoading(true)
        const batchPromise = extract(getNextTweet(currentBatches.length - 1))
        currentBatches.push(...makeTweetBatches([batchPromise], currentBatches.length - 1))
        setIsLoading(false)
    }
    if (batchesToGet > 0) {
        setCache(cache => ({
            ...cache,
            [queryName]: {
                ...cache[queryName],
                batches: currentBatches,
                totalBatches: currentBatches.length,
            }
        }))
    }

    const handleScroll = useCallback(throttle(() => {
        setCache(cache => ({
            ...cache,
            [queryName]: {
                ...cache[queryName],
                scrollHeight: window.scrollY
            }
        }))
    }, 500), [setCache, cache])

    useEffect(() => {
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [handleScroll])

    const debouncedVirtualized = useRef<ReturnType<typeof virtualizeBatches> | null>(null)
    const lastTimeVirtualized = useRef(0)
    if (Date.now() - lastTimeVirtualized.current > 500) {
        debouncedVirtualized.current = virtualizeBatches(cache[queryName], scrollTop)
        lastTimeVirtualized.current = Date.now()
    }

    return [debouncedVirtualized.current!, isLoading] as const // Always instantiated above
}

type Cache = {
    [cacheName: string]: {
        heights: number[]
        batches: JSX.Element[]
        totalBatches: number
        tweetsViewed: number
        scrollHeight: number
    }
}

function virtualizeBatches(cache?: Cache[string], scrollTop?: number) {
    if (!cache || scrollTop == undefined) return []
    let totalHeight = 0
    let startIndex = 0
    console.log(cache.heights)
    for (const height of cache.heights) {
        if (totalHeight + height < scrollTop - 500) {
            startIndex++
        }
        totalHeight += height
    }

    const endIndex = Math.min(cache.batches.length, startIndex + 3)
    console.log(startIndex)
    const visibleBatches = [
        <div style={{ height: cache.heights.slice(0, startIndex).reduce((prev, curr) => prev + curr, 0) + "px" }} key="spacer top"></div>,
        ...cache.batches.slice(startIndex, endIndex),
        <div style={{ height: cache.heights.slice(endIndex).reduce((prev, curr) => prev + curr, 0) + "px" }} key="spacer bottom"></div>
    ]

    return visibleBatches
}