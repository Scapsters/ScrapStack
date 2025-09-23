import { useCallback, useEffect, useRef, useState } from 'react'
import type { TweetSchema } from '../../../api/source/api/schemas'
import { trpcClient } from '../trpc'

type TweetQuery = ReturnType<typeof trpcClient.getTweets.query>
export type TweetWithURLs = {
    data: TweetSchema
    mediaUrlBlobs: Promise<string>[]
}

export function useTweetQueue(getNextTweet: (batchIndex: number) => TweetQuery, firstTweet?: () => TweetQuery) {
    const [batches, setBatches] = useState<Promise<TweetWithURLs[]>[]>([])

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
        if (firstTweet) {
            const firstBatch = extract(firstTweet())
            setBatches(batches => [...batches, firstBatch])
            await firstBatch
        }

        const totalBatchesViewed = Math.floor(tweetsViewed.current / batchSize)
        const batchesLeft = totalBatches.current - totalBatchesViewed
        const batchesToGet = maxLead - batchesLeft
        for (let i = 0; i < batchesToGet; i++) {
            console.log("before", totalBatches.current)
            const nextBatch = extract(getNextTweet(totalBatches.current))
            console.log("im batching it")
            setBatches(batches => [...batches, nextBatch])
            await nextBatch
            totalBatches.current++
        }
    }, [extract, firstTweet, getNextTweet])

    const view = useCallback(() => {
        tweetsViewed.current++
        fillQueue()
    }, [fillQueue])

    useEffect(() => {
        window.scrollY = 0
        setBatches([])
        tweetsViewed.current = 0
        totalBatches.current = 0
        fillQueue()
    }, [fillQueue])

    return [batches, view] as const
}
