import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { useIsVisible, usePromise, useTweet } from "./lib/tweetHooks"
import type { TweetWithURLs } from "./lib/tweetQueue"
import { userContext } from "./lib/userContext"
import { ConfirmActionButton, CopyButton } from "./components/ConfirmActionButton"
import { trpcClient } from "./trpc"
import { GoHeart, GoPlus, GoSearch, GoSync, GoTrash } from "react-icons/go"
import { defaultSearchValues } from "./Stack"
import { Link } from "react-router-dom"

export function TweetBatch({ batchPromise, view, openSearchWith }: { batchPromise: Promise<TweetWithURLs[]>, view: () => void, openSearchWith: (values: typeof defaultSearchValues) => void }) {
    const [batch, isBatchLoading] = usePromise(batchPromise, [])
    if (isBatchLoading) return (
        <div className="h-80 flex flex-col items-center gap-6">
            Scrap Data Loading...
            <GoSync size={40} className='-scale-y-100 animate-[spin_1s_linear_infinite_reverse]' />
        </div>
    )
    return batch.map((tweetWithURLs) => <Tweet tweetWithURLs={tweetWithURLs} view={view} key={tweetWithURLs.data.tweet_id} openSearchWith={openSearchWith}></Tweet>)
}

function Tweet({ tweetWithURLs, view, openSearchWith }: { tweetWithURLs: TweetWithURLs; view: () => void, openSearchWith: (values: typeof defaultSearchValues) => void }) {
    const [images, areUrlsLoading, markAsViewed] = useTweet(tweetWithURLs)
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
        if (isVisible && !viewed.current) {
            removeListener()
            viewed.current = true
            view()
            markAsViewed()
        }
    }, [isVisible, markAsViewed, view, removeListener])

    const { adminSecret } = useContext(userContext)

    if (areUrlsLoading) return (
        <div className="h-80 flex flex-col items-center gap-6">
            Images Loading...
            <GoSync size={40} className='-scale-y-100 animate-[spin_1s_linear_infinite_reverse]' />
        </div>
    )

    return (
        <div ref={setVisibilityRef} className="border-b-1 border-black/10 w-full pb-5">
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
                <div className="flex gap-2 w-dvw justify-center items-center"> {
                    images.map((image, index) => <div key={index}> {image} </div>)
                } </div>
                <div className="w-full flex justify-center relative">
                    {adminSecret &&
                        <ConfirmActionButton
                            className="absolute left-0 p-1"
                            failureMessage='Ban failed. Check authentication?' //TODO: better errors
                            successMessage='Post Banned.'
                            requireConfirmation
                            onClick={() => {
                                return trpcClient.banTweet.mutate(tweet)
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
                            className="button"
                        >
                            <GoPlus size={28} />
                        </button>
                        <button
                            onClick={() => {

                            }}
                            className="button"
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

