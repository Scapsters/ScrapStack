import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { useIsVisible, usePromise, useTweet } from "./lib/tweetHooks"
import type { TweetWithURLs } from "./lib/tweetQueue"
import { userContext } from "./lib/userContext"
import { ConfirmActionButton, CopyButton } from "./components/ConfirmActionButton"
import { trpcClient } from "./trpc"
import { GoHeart, GoPlus, GoSearch, GoSync, GoTrash } from "react-icons/go"
import { defaultSearchValues } from "./Stack"
import { Link } from "react-router-dom"
import throttle from "lodash/throttle"
import Loader from "./components/Loader"

export function TweetBatch({ batchPromise, view, dataKey, openSearchWith, setOwnHeight, minHeight }: { 
    batchPromise: Promise<TweetWithURLs[]>,
    view: (key: string, isRepeat: boolean) => void,
    dataKey: string
    openSearchWith: (values: typeof defaultSearchValues) => void,
    setOwnHeight: (height: number) => void,
    minHeight: number
}) {
    const [batch, isBatchLoading] = usePromise(batchPromise, [])
    const ref = useRef<HTMLDivElement>(null)
    const [loadedChildren, setLoadedChildren] = useState(new Array<boolean>(batch.length).fill(false))
    useEffect(() => {
        if (loadedChildren.every(c => c)) {
            const current = ref.current
            if (current) {
                const height = current.getBoundingClientRect().height
                if (height !== 1600) //default height
                    setOwnHeight(height)
        }
    }}, [batch.length, loadedChildren, setOwnHeight])

    if (isBatchLoading) return (<Loader />)

    return <div ref={ref} className="w-full" key={dataKey} style={{ minHeight: minHeight + "px" }}>
        {batch.map((tweetWithURLs, index) => 
            <Tweet 
                tweetWithURLs={tweetWithURLs}
                dataKey={dataKey + index}
                view={view} 
                key={tweetWithURLs.data.tweet_id}
                openSearchWith={openSearchWith}
                load={() => setLoadedChildren(c => [...c.slice(0, index), true, ...c.slice(index + 1)])}
            />)
        }
    </div>
}

function Tweet({ tweetWithURLs, dataKey, view, openSearchWith, load }: {
    tweetWithURLs: TweetWithURLs
    dataKey: string
    view: (key: string, isRepeat: boolean) => void
    openSearchWith: (values: typeof defaultSearchValues) => void
    load: () => void
}) {
    const [loadedImages, setLoadedImages] = useState(new Array<boolean>(tweetWithURLs.mediaUrlBlobs.length).fill(false))
    const [images, areUrlsLoading, markAsViewed] = useTweet(tweetWithURLs, (imageIndex: number) => setLoadedImages(loaded => [
        ...loaded.slice(0, imageIndex),
        true,
        ...loaded.slice(imageIndex + 1)
    ]))
    const tweet = tweetWithURLs.data
    const [visiblityRef, setVisibilityRef] = useState<HTMLElement | null>(null)
    const [isVisible, removeListener] = useIsVisible(visiblityRef)
    const viewed = useRef(false)
    const linkToCopy = useMemo(() => {
        const url = new URL(location.href)
        url.search = ""
        url.searchParams.set("tweet_id", tweet.tweet_id)
        return url.toString()
    }, [tweet.tweet_id])
    const linkToSearch = useMemo(() => {
        const url = new URL(location.href)
        url.search = ""
        url.searchParams.set("handle", tweet.handle)
        return url.search
    }, [tweet.handle])

    useEffect(() => {
        if (areUrlsLoading) return
        if (isVisible && !viewed.current) {
            viewed.current = true
            view(dataKey, false)
            markAsViewed()
        }
        throttle(
            () => view(dataKey, true),
            100
        )
    }, [isVisible, markAsViewed, view, removeListener, dataKey, areUrlsLoading])


    const { adminSecret } = useContext(userContext)

    
    const hasLoaded = useRef(false)
    useEffect(() => {
        if (hasLoaded.current || areUrlsLoading) return
        if (loadedImages.every(l => l)) {
            hasLoaded.current = true
            load()
        }
    }, [areUrlsLoading, images.length, load, loadedImages])

    if (areUrlsLoading) return (
        <div key={tweetWithURLs.data.tweet_id} className="h-80 flex flex-col items-center gap-6">
            Images Loading...
            <GoSync size={40} className='-scale-y-100 animate-[spin_1s_linear_infinite_reverse]' />
        </div>
    )

    return (
        <div ref={setVisibilityRef} data-key={dataKey} key={tweetWithURLs.data.tweet_id} className="border-b-1 border-black/10 w-auto py-5">
            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-4">
                    <a href={tweet.tweet_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-2 border-2 border-transparent px-6 bg-white/40 rounded-md w-fit hover:bg-black/5 hover:border-2 hover:border-cyan">
                        <img src={tweet.profile_img} className="rounded-full"></img>
                        <div>
                            <p className="text-black/90">{tweet.user}</p>
                            <p className="text-black/40">{tweet.handle}</p>
                        </div>
                    </a>
                </div>
                <div className="w-4/5 text-center"> {tweet.content} </div>
                <div className="flex gap-2 w-[90dvw] justify-center items-center flex-wrap"> {
                    images
                } </div>
                <div className="w-full flex justify-center relative">
                    {adminSecret &&
                        <ConfirmActionButton
                            className="absolute left-0 p-1"
                            failureMessage='Ban failed. Check authentication?' //TODO: better errors
                            successMessage='Post Banned.'
                            requireConfirmation
                            onClick={async () => {
                                return [await trpcClient.banTweet.mutate(tweet)] satisfies [boolean]
                            }}
                        >
                            <GoTrash className="text-red-700" size={28} />
                        </ConfirmActionButton>
                    }
                    <div className="flex gap-8 p-1">
                        <Link
                            to={linkToSearch}
                            onClick={() => openSearchWith({ ...defaultSearchValues, handle: tweet.handle })}
                            className="button"
                        >
                            <GoSearch size={28} />
                        </Link>
                        <button
                            onClick={() => {

                            }}
                            className="hidden button"
                        >
                            <GoPlus size={28} />
                        </button>
                        <button
                            onClick={() => {

                            }}
                            className="hidden button"
                        >
                            <GoHeart size={28} />
                        </button>
                        <CopyButton size={28} textToCopy={linkToCopy} />
                    </div>
                </div>
            </div>
        </div>
    )
}

