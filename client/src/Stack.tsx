import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { TweetSchema } from '../../api/source/api/schemas'
import { TopBar } from './LandingPage'
import { trpcClient } from './trpc'
import { TweetQueue, type TweetWithURLs } from './lib/tweetQueue'
import { useSearchParams } from 'react-router-dom'
import { useTweet, useIsVisible, usePromise } from './lib/tweetHooks'
import { GoCopy } from "react-icons/go";

export function Stack() {
    const username = useMemo(() => new URL(window.location.href).pathname.split('/').pop() ?? '', [])

    const [params] = useSearchParams()
    const entryTweet = useMemo(() => params.get("tweet_id"), []) // Don't redefine on url change

    //@ts-expect-error wefwef
    const [searchFilter, setSearchFilter] = useState<Partial<TweetSchema> | null>(null)
    //@ts-expect-error wefwf
    const [searchSorter, setSearchSorter] = useState<Partial<Record<keyof TweetSchema, 1 | -1>> | null>(null)
    const [batches, setBatches] = useState<Promise<TweetWithURLs[]>[]>([])

    console.log("entry", entryTweet)
    const defaultQuery = useCallback(() => trpcClient.getRandomUnviewedTweets.query({ stackUsername: username }), [username])
    const tweetQueue = useMemo(
        () =>
            new TweetQueue(
                setBatches,
                entryTweet
                    ? () => trpcClient.getTweets.query({ tweetFilter: { tweet_id: entryTweet } })
                    : defaultQuery,
                searchFilter
                    ? () =>
                        trpcClient.getTweets.query({
                            tweetFilter: { stackUsername: username, ...searchFilter },
                            tweetSorter: searchSorter ? searchSorter : undefined,
                        })
                    : defaultQuery
            ),
        [entryTweet, defaultQuery, searchFilter, username, searchSorter]
    )

    console.log(batches.length)
    return (
        <div className="bg-slate-950 text-white">
            <TopBar centerText={`${username}${username.endsWith('s') ? "'" : "'s"} Stack`} />
            <div className="absolute top-50 bg-pink-50">
                <textarea onChange={(e) => setSearchFilter(JSON.parse(e.target.value))}></textarea>
                <textarea onChange={(e) => setSearchSorter(JSON.parse(e.target.value))}></textarea>
                <button onClick={() => setBatches([])}>Search</button>
            </div>
            <div className="flex justify-center pt-4">

                <div className="flex flex-col items-center gap-5  w-275">
                    {batches.map((batch) => (
                        <TweetBatch batchPromise={batch} queue={tweetQueue}></TweetBatch>
                    ))}
                </div>
            </div>
        </div>
    )
}

function TweetBatch({ batchPromise, queue }: { batchPromise: Promise<TweetWithURLs[]>, queue: TweetQueue }) {
    const [batch, isBatchLoading] = usePromise(batchPromise, [])
    if (isBatchLoading) return <div className="h-80">Tweet Data Loading</div>
    return batch.map((tweetWithURLs) => <Tweet tweetWithURLs={tweetWithURLs} queue={queue}></Tweet>)
}

function Tweet({ tweetWithURLs, queue }: { tweetWithURLs: TweetWithURLs; queue: TweetQueue }) {
    const [images, areUrlsLoading, markAsViewed] = useTweet(tweetWithURLs)
    const tweet = tweetWithURLs.data
    const visiblityRef = useRef(null)
    const [isVisible, removeListener] = useIsVisible(visiblityRef)
    const viewed = useRef(false)

    useEffect(() => {
        if (isVisible && !viewed.current) {
            removeListener()
            viewed.current = true
            queue.view()
            markAsViewed()
        }
    }, [isVisible, markAsViewed, queue, removeListener])

    if (areUrlsLoading) return <div className="h-80"> "Loading images" </div>

    return <div ref={visiblityRef} className="border-b-1 border-black/10 w-full pb-5">

        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center">

                <a href={tweet.tweet_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-2 border-2 border-transparent px-6 bg-white/30 rounded-lg w-fit hover:bg-black/5 hover:border-2 hover:border-cyan">
                    <img src={tweet.profile_img} className="rounded-full"></img>
                    <div>
                        <p>{tweet.user}</p>
                        <p className="text-black/40">{tweet.handle}</p>
                    </div>
                </a>
                <button 
                    className="ml-4 rounded-lg border-2 border-transparent hover:bg-black/10 p-1 hover:border-cyan h-min active:bg-cyan-light" 
                    onClick={() => navigator.clipboard.writeText(window.location.origin + window.location.pathname + "?tweet_id=" + tweet.tweet_id)}
                ><GoCopy size="28" className="hover:stroke-white active:stroke-black"/>
                </button>
            </div>
            <div className="">
                {tweet.content}
            </div>
            <div className="flex gap-2 w-dvw justify-center items-center">

                {
                    images.map(image => <>
                        {image}
                    </>)
                }
            </div>
        </div>
    </div>
}

