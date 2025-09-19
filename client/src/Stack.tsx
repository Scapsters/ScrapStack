import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { TweetSchema } from '../../api/source/api/schemas'
import { TopBar } from './LandingPage'
import { trpcClient } from './trpc'
import { type TweetWithURLs, useTweetQueue } from './lib/tweetQueue';
import { useLocation, useSearchParams } from 'react-router-dom'
import { useTweet, useIsVisible, usePromise } from './lib/tweetHooks'
import { GoChevronRight, GoCopy } from "react-icons/go";

export function Stack() {
    const location = useLocation()
    const username = useMemo(() => location.pathname.split('/').pop() ?? '', [location])

    const [params] = useSearchParams()
    const entryTweet = useRef(params.get("tweet_id"))

    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [searchFilter, setSearchFilter] = useState<Partial<TweetSchema> | null>(null)
    const [searchSorter, setSearchSorter] = useState<Partial<Record<keyof TweetSchema, 1 | -1>> | null>(null)
    const [batches, setBatches] = useState<Promise<TweetWithURLs[]>[]>([])

    const defaultQuery = useCallback(() => trpcClient.getRandomUnviewedTweets.query({ stackUsername: username }), [username])
    const [view, fillQueue] = useTweetQueue(
        setBatches,
        searchFilter
            ? () =>
                trpcClient.getTweets.query({
                    tweetFilter: { stackUsername: username, ...searchFilter },
                    tweetSorter: searchSorter ? searchSorter : undefined,
                })
            : defaultQuery
    )
    useEffect(() => {
        if (searchFilter || searchSorter) 
            return 
        void fillQueue(
            entryTweet.current
            ? () => trpcClient.getTweets.query({ tweetFilter: { tweet_id: entryTweet.current } })
            : defaultQuery
        )
    }, [defaultQuery, entryTweet, searchFilter, searchSorter, fillQueue])

    const tweetBatches = useMemo(() => batches.map((batch, index) => (
        <TweetBatch key={index} batchPromise={batch} view={view}></TweetBatch>
    )), [batches, view])
    
    return (
        <div className="">
            <TopBar centerText={`${username}${username.endsWith('s') ? "'" : "'s"} Stack`} />
            <div className="absolute top-50 flex">
                <div className="w-100 bg-pink-50">

                <textarea onChange={(e) => setSearchFilter(JSON.parse(e.target.value))}></textarea>
                <textarea onChange={(e) => setSearchSorter(JSON.parse(e.target.value))}></textarea>
                <button 
                    className="button"
                    onClick={() => {
                        setSearchFilter({})
                    }}
                >
                    Search
                </button>
                </div>
                <div className="relative w-10 h-10 top-10 bg-red-500">
                    <button 
                        className="button"
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    >
                        <GoChevronRight size="28" className="right-10"/>
                    </button>
                </div>
            </div>
            <div className="flex justify-center pt-4">
                <div className="flex flex-col items-center gap-5  w-275">
                    {tweetBatches}
                </div>
            </div>
        </div>
    )
}

function TweetBatch({ batchPromise, view }: { batchPromise: Promise<TweetWithURLs[]>, view: () => void }) {
    const [batch, isBatchLoading] = usePromise(batchPromise, [])
    if (isBatchLoading) return <div className="h-80">Tweet Data Loading</div>
    return batch.map((tweetWithURLs) => <Tweet tweetWithURLs={tweetWithURLs} view={view} key={tweetWithURLs.data.tweet_id}></Tweet>)
}

function Tweet({ tweetWithURLs, view }: { tweetWithURLs: TweetWithURLs; view: () => void }) {
    const [images, areUrlsLoading, markAsViewed] = useTweet(tweetWithURLs)
    const tweet = tweetWithURLs.data
    const visiblityRef = useRef(null)
    const [isVisible, removeListener] = useIsVisible(visiblityRef)
    const viewed = useRef(false)

    useEffect(() => {
        if (isVisible && !viewed.current) {
            removeListener()
            viewed.current = true
            view()
            markAsViewed()
        }
    }, [isVisible, markAsViewed, view, removeListener])

    if (areUrlsLoading) return <div className="h-80"> "Loading images" </div>

    return <div ref={visiblityRef} className="border-b-1 border-black/10 w-full pb-5">
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center">
                <div className="w-10"></div>
                <a href={tweet.tweet_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-2 border-2 border-transparent px-6 bg-white/40 rounded-lg w-fit hover:bg-black/5 hover:border-2 hover:border-cyan">
                    <img src={tweet.profile_img} className="rounded-full"></img>
                    <div>
                        <p className="text-black/90">{tweet.user}</p>
                        <p className="text-black/40">{tweet.handle}</p>
                    </div>
                </a>
                <button
                    className="button"
                    onClick={() => navigator.clipboard.writeText(window.location.origin + window.location.pathname + "?tweet_id=" + tweet.tweet_id)}
                ><GoCopy size="28" className="text-black active:stroke-black"/>
                </button>
            </div>
            <div className="">
                {tweet.content}
            </div>
            <div className="flex gap-2 w-dvw justify-center items-center">
                {
                    images.map((image, index) => <div key={index}>
                        {image}
                    </div>)
                }
            </div>
        </div>
    </div>
}

