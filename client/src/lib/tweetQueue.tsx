import { useCallback, useEffect, useRef, useState, type JSX } from 'react'
import type { TweetSchema } from '../../../api/source/api/schemas'
import { trpcClient } from '../trpc'
import { TweetBatch } from '../Tweet'
import type { defaultSearchValues } from '@/Stack'

type TweetQuery = ReturnType<typeof trpcClient.getTweets.query>
export type TweetWithURLs = {
    data: TweetSchema
    mediaUrlBlobs: Promise<string>[]
}

export function useTweetQueue(
    getNextTweet: (batchIndex: number) => TweetQuery,
    openSearchWith: (values: typeof defaultSearchValues) => void,
    firstTweet?: () => TweetQuery,
    queryName?: string
) {
    const [batches, setBatches] = useState<JSX.Element[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const batchCaches = useRef<{
        [cacheName: string]: {
            batches: JSX.Element[]
            totalBatches: number
            tweetsViewed: number
            scrollHeight: number
        }
    }>({})

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

        const makeTweetBatches = (promises: Promise<TweetWithURLs[]>[]) => promises.map((batch, index) => (
            <TweetBatch key={index} batchPromise={batch} view={view} openSearchWith={openSearchWith}></TweetBatch>
        ))

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
            if (queryName) {
                // Lazy initialize
                if (batchCaches.current[queryName] === undefined) {
                    batchCaches.current[queryName] = {
                        batches: [],
                        tweetsViewed: 0,
                        totalBatches: 0,
                        scrollHeight: 0,
                    }
                }
                // Cache
                batchCaches.current[queryName] = {
                    ...batchCaches.current[queryName],
                    batches: [...batchCaches.current[queryName].batches, ...nextBatch],
                    totalBatches: totalBatches.current,
                    tweetsViewed: tweetsViewed.current,
                }
            }
            await batchPromise
            setIsLoading(false)
        }
    }, [extract, firstTweet, getNextTweet, openSearchWith, queryName])

    useEffect(() => {
        const cache = queryName && batchCaches.current[queryName]
        if (cache) {
            console.log("setting", cache.scrollHeight)
            setBatches(cache.batches)
            tweetsViewed.current = cache.tweetsViewed
            totalBatches.current = cache.totalBatches
            window.scrollTo({ top: cache.scrollHeight })
        } else {
            setBatches([])
            window.scrollTo({ top: 0 })
        }
        tweetsViewed.current = 0
        totalBatches.current = 0
        fillQueue()
    }, [fillQueue, queryName])

    useEffect(() => {
        const handleScroll = () => {
            
            if (queryName && batchCaches.current[queryName]) {
                console.log("getting", window.scrollY)
                batchCaches.current[queryName].scrollHeight = window.scrollY
            }
        }
        addEventListener('scroll', handleScroll)
        return () => removeEventListener('scroll', handleScroll)
    }, [queryName])

    return [batches, isLoading] as const
}
