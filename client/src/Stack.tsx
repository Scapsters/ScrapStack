import { useMemo, useRef, useState } from 'react'
import type { TweetSchema } from '../../api/source/api/schemas'
import { TopBar } from './LandingPage'
import { trpcClient } from './trpc'
import { TweetQueue, type TweetWithURLs } from './lib/tweetQueue'
import { useParams } from 'react-router-dom'
import { useTweet, useIsVisible, usePromise } from './lib/tweetHooks'

export function Stack() {
    const username = useMemo(() => new URL(window.location.href).pathname.split('/').pop() ?? '', [])

    const params = useParams()
    const entryTweet = useMemo(() => params['tweet_id'], []) // Don't redefine on url change

    //@ts-expect-error wefwef
    const [searchFilter, setSearchFilter] = useState<Partial<TweetSchema> | null>(null)
    //@ts-expect-error wefwf
    const [searchSorter, setSearchSorter] = useState<Partial<Record<keyof TweetSchema, 1 | -1>> | null>(null)
    const [batches, setBatches] = useState<Promise<TweetWithURLs[]>[]>([])

    const defaultQuery = useMemo(() => trpcClient.getRandomUnviewedTweets.query({ stackUsername: username }), [username])
    const tweetQueue = useMemo(
        () =>
            new TweetQueue(
                setBatches,
                entryTweet
                    ? trpcClient.getTweets.query({ tweetFilter: { tweet_id: entryTweet } })
                    : defaultQuery,
                searchFilter
                    ? () =>
                          trpcClient.getTweets.query({
                              tweetFilter: { stackUsername: username, ...searchFilter },
                              tweetSorter: searchSorter ? searchSorter : undefined,
                          })
                    : () => defaultQuery
            ),
        [entryTweet, defaultQuery, searchFilter, username, searchSorter]
    )

    console.log(batches.length)
    return (
        <>
            <TopBar centerText={`${username}${username.endsWith('s') ? "'" : "'s"} Stack`} />
            <p> page for {username} </p>
            <div className="flex flex-col items-center gap-5">
                {batches.map((batch) => (
                    <TweetBatch batchPromise={batch} queue={tweetQueue}></TweetBatch>
                ))}
            </div>
        </>
    )
}

function TweetBatch({ batchPromise, queue }: { batchPromise: Promise<TweetWithURLs[]>, queue: TweetQueue }) {
    const [batch, isBatchLoading] = usePromise(batchPromise, [])
    if (isBatchLoading) return <div className="h-80">Tweet Data Loading</div>
    return batch.map((tweetWithURLs) => <Tweet tweetWithURLs={tweetWithURLs} queue={queue}></Tweet>)
}

function Tweet({ tweetWithURLs, queue }: { tweetWithURLs: TweetWithURLs; queue: TweetQueue }) {
    const [images, areUrlsLoading, markAsViewed] = useTweet(tweetWithURLs)
    const visiblityRef = useRef(null)
    const [isVisible, removeListener] = useIsVisible(visiblityRef)
    const viewed = useRef(false)
    
    if (isVisible && !viewed.current) {
        removeListener()
        viewed.current = true
        queue.view()
        markAsViewed()
    }

    if (areUrlsLoading) return <div className="h-80"> "Loading images" </div>
    
    return <div ref={visiblityRef}>{images}</div>
}

