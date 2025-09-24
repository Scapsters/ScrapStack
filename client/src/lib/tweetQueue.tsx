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
    const [batches, setBatches] = useState<JSX.Element[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [getCache, setCache] = useCache()

    const maxLead = 2
    const batchSize = 20 //TODO: make is not hardcode
    const totalBatches = useRef(0)
    const tweetsViewed = useRef(0)

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

    const fillQueue = useCallback(async () => {
        const view = () => {
            tweetsViewed.current++
            fillQueue()
        }

        const makeTweetBatches = (promises: Promise<TweetWithURLs[]>[]) => promises.map((batch, index) => {
            const cache = getCache(queryName)
            const setOwnHeight = (height: number) => { cache.heights[index] = height }
            return <TweetBatch key={index} batchPromise={batch} view={view} openSearchWith={openSearchWith} setOwnHeight={setOwnHeight} />
        })

        if (firstTweet) {
            setIsLoading(true)
            const firstBatch = extract(firstTweet())
            setBatches(batches => [...batches, ...makeTweetBatches([firstBatch])])
            await firstBatch
            setIsLoading(false)
        }

        const totalBatchesViewed = Math.floor(tweetsViewed.current / batchSize)
        const batchesLeft = totalBatches.current - totalBatchesViewed
        const batchesToGet = maxLead - batchesLeft
        for (let i = 0; i < batchesToGet; i++) {
            if (totalBatches.current == 0) setIsLoading(true)

            const batchPromise = extract(getNextTweet(totalBatches.current))
            const nextBatch = makeTweetBatches([batchPromise])
            setBatches(batches => [...batches, ...nextBatch])
            totalBatches.current++
            const cache = getCache(queryName)
            setCache(queryName, {
                ...cache,
                batches: [...cache.batches, ...nextBatch],
                totalBatches: totalBatches.current,
                tweetsViewed: tweetsViewed.current,
            })

            await batchPromise
            setIsLoading(false)
        }
    }, [extract, firstTweet, getCache, getNextTweet, openSearchWith, queryName, setCache])

    useEffect(() => {
        const foundCache = getCache(queryName)
        if (foundCache.batches.length > 0) {
            console.log("setting", foundCache.scrollHeight)
            setBatches(foundCache.batches)
            tweetsViewed.current = foundCache.tweetsViewed
            totalBatches.current = foundCache.totalBatches
            window.scrollTo({ top: foundCache.scrollHeight })
        } else {
            setBatches([])
            window.scrollTo({ top: 0 })
        }
        tweetsViewed.current = 0
        totalBatches.current = 0
        fillQueue()
    }, [fillQueue, getCache, queryName])

    const [visible, setVisible] = useState<JSX.Element[]>(() => virtualizeBatches(getCache(queryName), scrollTop))

    const handleScroll = useCallback(throttle(() => {
        const cache = getCache(queryName)
        setCache(queryName, {
            ...cache,
            scrollHeight: window.scrollY
        })
        setVisible(virtualizeBatches(getCache(queryName), scrollTop))
    }, 2750), [getCache, setCache, setVisible])
    
    useEffect(() => {
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [getCache, handleScroll, queryName, scrollTop, setCache])

    return [virtualizeBatches(getCache(queryName), scrollTop), isLoading] as const
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

function useCache() {
    const cache = useRef<Cache>({})
    const getCache = useCallback((queueName: string) => {
        const foundCache = cache.current[queueName]
        if (foundCache === undefined) {
            cache.current[queueName] = {
                batches: [],
                tweetsViewed: 0,
                totalBatches: 0,
                scrollHeight: 0,
                heights: []
            }
        }
        return cache.current[queueName]
    }, [])
    const setCache = useCallback((queueName: string, info: Cache[string]) => {
        cache.current[queueName] = info
    }, [])
    return [getCache, setCache] as const
}

function virtualizeBatches(cache: Cache[string], scrollTop: number) {
    let targetHeight = 0
    let totalHeight = 0
    let startIndex = 0

    for (const height of cache.heights) {
        console.log(totalHeight, scrollTop, totalHeight + height)
        if (totalHeight + height < scrollTop + 2000) {
            targetHeight += height
            startIndex++
        }
        totalHeight += height
    }

    const endIndex = Math.min(cache.batches.length, startIndex + 1)
    const visibleBatches = [
        <div style={{ height: targetHeight + "px" }} key="spacer"></div>,
        ...cache.batches.slice(startIndex, endIndex)
    ]

    return visibleBatches
}