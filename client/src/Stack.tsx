import { useEffect, useMemo, useRef, useState } from 'react'
import type { TweetSchema } from '../../api/source/api/schemas'
import { TopBar } from './LandingPage'
import { trpcClient } from './trpc'
import { TweetQueue, type TweetWithURLs } from './lib/tweetQueue'
import { useParams } from 'react-router-dom'

export function Stack() {
    const username = useMemo(() => new URL(window.location.href).pathname.split('/').pop() ?? '', [])

    const params = useParams()
    const entryTweet = useMemo(() => params['tweet_id'], []) // Don't redefine on url change

    //@ts-expect-error wefwef
    const [searchFilter, setSearchFilter] = useState<Partial<TweetSchema> | null>(null)
    //@ts-expect-error wefwf
    const [searchSorter, setSearchSorter] = useState<Partial<Record<keyof TweetSchema, 1 | -1>> | null>(null)
    const [batches, setBatches] = useState<Promise<TweetWithURLs[]>[]>([])
    const tweetQueue = useMemo(
        () =>
            new TweetQueue(
                setBatches,
                entryTweet
                    ? trpcClient.getTweets.query({ tweetFilter: { tweet_id: entryTweet } })
                    : trpcClient.getRandomTweets.query({ stackUsername: username }),
                searchFilter
                    ? () =>
                          trpcClient.getTweets.query({
                              tweetFilter: { stackUsername: username, ...searchFilter },
                              tweetSorter: searchSorter ? searchSorter : undefined,
                          })
                    : () => trpcClient.getRandomTweets.query({ stackUsername: username })
            ),
        [entryTweet, username, searchFilter, searchSorter, setBatches]
    )

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
    const [images, areUrlsLoading] = useImage(tweetWithURLs)
    const visiblityRef = useRef(null)
    const [isVisible, removeListener] = useIsVisible(visiblityRef)
    const viewed = useRef(false)
    
    if (isVisible && !viewed.current) {
        console.log(isVisible)
        removeListener()
        viewed.current = true
        queue.view()
    }

    if (areUrlsLoading) return <div className="h-80"> "Loading images" </div>
    
    return <div ref={visiblityRef}>{images}</div>
}

const useImage = (tweet: TweetWithURLs): [React.ReactNode, boolean] => {
    const [urls, areURLsLoading] = usePromise<string[]>(Promise.all(tweet.mediaUrlBlobs), [])
    return [urls.map((url) => <img src={url}></img>), areURLsLoading]
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

function useIsVisible(ref: React.RefObject<HTMLElement | null>): [boolean, () => void] {
    const [isIntersecting, setIntersecting] = useState(false)
    const observerRef = useRef<IntersectionObserver | null>(null)

    useEffect(() => {
        if (!ref?.current) {
			return

		}

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
