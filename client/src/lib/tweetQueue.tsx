import type { trpcClient } from '@/trpc'
import type { TweetSchema } from '../../../api/source/api/schemas'

type TweetQuery = ReturnType<typeof trpcClient.getTweets.query>
export type TweetWithURLs = {
    data: TweetSchema
    mediaUrlResponses: Promise<Response>[]
    mediaUrlBlobs: Promise<string>[]
}

export class TweetQueue {
    size = 3
    batches: Promise<TweetWithURLs[]>[] = []

    firstTweet: TweetQuery
    getNextTweet: () => TweetQuery

    constructor(firstTweet: TweetQuery, getNextTweet: () => TweetQuery) {
        this.firstTweet = firstTweet
        this.getNextTweet = getNextTweet
        this.batches.push(this.extract(firstTweet))
        this.fillQueue()
    }

    dequeue() {
        this.fillQueue()
        return this.batches.shift()
    }

    fillQueue() {
        for (let i = 0; i < this.size - this.batches.length; i++) this.batches.push(this.extract(this.getNextTweet()))
    }

    extract(query: TweetQuery): Promise<TweetWithURLs[]> {
        return query.then((tweets) =>
            tweets.map((tweet) => {
                const mediaUrlResponses = tweet.media_url.map((url) => fetch(url))
                const mediaUrlBlobs = mediaUrlResponses.map((response) =>
                    response.then((response) => response.blob()).then((data) => URL.createObjectURL(data))
                )
                return {
                    data: tweet,
                    mediaUrlResponses,
                    mediaUrlBlobs,
                }
            })
        )
    }

    peek() {
        return this.batches[0]
    }
}
