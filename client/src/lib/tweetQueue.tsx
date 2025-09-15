import type { TweetSchema } from '../../../api/source/api/schemas'
import { trpcClient } from '../trpc';

type TweetQuery = ReturnType<typeof trpcClient.getTweets.query>
export type TweetWithURLs = {
    data: TweetSchema
    mediaUrlBlobs: Promise<string>[]
    view: () => void
}

export class TweetQueue {
    maxLead = 3
    totalBatches = 0
    batchSize = 20 //TODO: make is not hardcode
    tweetsViewed = 0

    setBatches: React.Dispatch<React.SetStateAction<Promise<TweetWithURLs[]>[]>>
    firstTweet: TweetQuery
    getNextTweet: () => TweetQuery

    constructor(setBatches: React.Dispatch<React.SetStateAction<Promise<TweetWithURLs[]>[]>>, firstTweet: TweetQuery, getNextTweet: () => TweetQuery) {
        this.setBatches = setBatches
        this.firstTweet = firstTweet
        this.getNextTweet = getNextTweet
        this.setBatches(batches => [...batches, this.extract(firstTweet)])
        this.fillQueue()
    }

    fillQueue() {
        const totalBatchesViewed = Math.floor(this.tweetsViewed / this.batchSize)
        const batchesLeft = this.totalBatches - totalBatchesViewed
        const batchesToGet = this.maxLead - batchesLeft
        for (let i = 0; i < batchesToGet; i++) {
            console.log("ading more")
            this.setBatches(batches => [...batches, this.extract(this.getNextTweet())])
            this.totalBatches++
        }}

    async extract(query: TweetQuery): Promise<TweetWithURLs[]> {
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
    }

    view() {
        this.tweetsViewed++
        this.fillQueue()
    }
}
