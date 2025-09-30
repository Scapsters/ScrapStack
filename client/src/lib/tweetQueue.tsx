import { useCallback, useEffect, useRef, useState, type JSX, type RefObject, type SetStateAction } from 'react'
import type { TweetClient } from '../../../api/source/api/schemas'
import { trpcClient } from '../trpc'
import { TweetBatch } from '../Tweet'
import type { defaultSearchValues } from '../Stack'
import throttle from 'lodash/throttle'

type TweetQuery = ReturnType<typeof trpcClient.getTweets.query>
export type TweetWithURLs = {
    data: TweetClient
    mediaUrlBlobs: Promise<string>[] | string
}

export function useTweetQueue(
    getNextTweet: (batchIndex: number) => TweetQuery,
    openSearchWith: (values: typeof defaultSearchValues) => void,
    scrollTop: number,
    queryName: string,
    stackRef: RefObject<HTMLDivElement | null>,
    setDoTweetsExist: React.Dispatch<SetStateAction<boolean>>,
    firstTweet?: () => TweetQuery,
) {
    const [isLoading, setIsLoading] = useState(true)
    const [cache, setCache] = useState<Cache>({ [queryName]: getEmptyCache() })

    // Promise handling
    const extract = useCallback(async (query: TweetQuery, callback: () => void) => {
        return query.then((tweets) =>
            tweets.map((tweet) => {
                const mediaUrlResponses = tweet.media_url.map((url) =>
                    url.includes("m3u8") || url.includes("mp4")
                        ? new Promise<string>(resolve => resolve(url))
                        : fetch(url).then((response) => response.blob()).then((data) => URL.createObjectURL(data))
                )

                return {
                    data: tweet,
                    mediaUrlBlobs: mediaUrlResponses,
                    view: () => trpcClient.markTweet.mutate([tweet])
                }
            })
        ).then(tweets => {
            callback()
            return tweets
        })
    }, [])

    // Scroll restoration refs
    const targetLastViewed = useRef<string | null>(null)
    const appliedLastViewed = useRef<string | null>(null)
    const restoring = useRef(false)

    // Reset when switching queues
    useEffect(() => {
        const lastViewed = cache[queryName]?.currentlyViewing ?? null

        targetLastViewed.current = lastViewed
        appliedLastViewed.current = null
        restoring.current = !!lastViewed
    }, [queryName])

    useEffect(() => {
        if (!restoring.current || !targetLastViewed.current) return

        let rafId: number
        const tryScroll = () => {
            const key = targetLastViewed.current
            if (!key) return

            const element = document.querySelector(`[data-key="${CSS.escape(key)}"]`)
            if (element) {
                element.scrollIntoView({ behavior: "instant", block: "center" })
                appliedLastViewed.current = key
                restoring.current = false
                return
            }

            rafId = requestAnimationFrame(tryScroll)
        }

        tryScroll()
        return () => cancelAnimationFrame(rafId)
    }, [queryName, cache[queryName]?.currentlyViewing])


    // View tracking
    const view = useCallback((batchIndex: number) =>
        (key: string, isRepeat: boolean) => {
            setCache(prev => ({
                ...prev,
                [queryName]: {
                    ...prev[queryName],
                    currentlyViewing: key,
                    currentBatchIndex: batchIndex,
                    ...(isRepeat ? {} : { tweetsViewed: prev[queryName].tweetsViewed + 1 }),
                },
            }))
        },
        [queryName, setCache]
    )

    // Promise handling stuff
    const makeTweetBatches = useCallback((promise: ReturnType<typeof extract>, batchIndex: number) => {
        const setOwnHeight = (height: number, isLoaded: boolean) => {
            setCache(cache => ({
                ...cache,
                [queryName]: {
                    ...cache[queryName],
                    heights: [
                        ...cache[queryName].heights.slice(0, batchIndex),
                        height,
                        ...cache[queryName].heights.slice(batchIndex + 1)
                    ],
                    ...(isLoaded
                        ? { 
                            unloadedBatchIndices: [
                                ...cache[queryName].unloadedBatchIndices.slice(0, batchIndex),
                                ...cache[queryName].unloadedBatchIndices.slice(batchIndex + 1),
                            ]
                        }
                        : {}
                    )
                }
            }))
        }
        const key = queryName + batchIndex
        return {
            key,
            dataKey: key,
            batchPromise: promise,
            view: view(batchIndex),
            openSearchWith,
            setOwnHeight,
            minHeight: 0
        }
    }, [openSearchWith, queryName, view])

    const handleScroll = useCallback(throttle(() => {
        setCache(cache => ({
            ...cache,
            [queryName]: {
                ...cache[queryName],
                scrollHeight: window.scrollY
            }
        }))
    }, 500), [setCache, cache])

    useEffect(() => {
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [handleScroll])

    // Fetching stuff
    const submittedFirstTweet = useRef(false)
    useEffect(() => {
        const fetchFirstTweet = async () => {
            await Promise.resolve()
            if (firstTweet && !submittedFirstTweet.current) {
                const currentCache = cache[queryName] ?? getEmptyCache()
                const currentBatches = currentCache.batches

                setIsLoading(true)
                const batchPromise = extract(firstTweet(), () => setIsLoading(false))

                currentBatches.push(makeTweetBatches(batchPromise, currentBatches.length))
                setCache(cache => ({
                    ...cache,
                    [queryName]: {
                        ...currentCache,
                        batches: currentBatches,
                        totalBatches: currentBatches.length,
                    }
                }))
                submittedFirstTweet.current = true
            }
        }
        fetchFirstTweet()
    }, [cache, extract, firstTweet, makeTweetBatches, queryName])

    const lastFetch = useRef(0)
    useEffect(() => {
        const fetchTweets = async () => {
            await Promise.resolve()
            if (Date.now() - lastFetch.current > 100) { // throttle mainly for page load
                const stack = stackRef.current
                if (stack) {
                    const distanceToBottom = stack.getBoundingClientRect().bottom
                    if (distanceToBottom < 6000) {
                        const currentCache = cache[queryName] ?? getEmptyCache()
                        const currentBatches = currentCache.batches

                        console.log(currentCache.totalBatches)
                        if (currentBatches.length == 0) setIsLoading(true)
                        const batchPromise = extract(getNextTweet(currentBatches.length), () => setIsLoading(false))

                        setCache(cache => ({
                            ...cache,
                            [queryName]: {
                                ...currentCache,
                                batches: [...currentBatches, makeTweetBatches(batchPromise, currentBatches.length)],
                                totalBatches: currentBatches.length + 1,
                            }
                        }))
                        lastFetch.current = Date.now()
                    }
                }
            }
        }
        fetchTweets()
    }, [cache, extract, getNextTweet, makeTweetBatches, queryName, stackRef])

    cache[queryName]?.batches[0]?.batchPromise.then(result => {
        if (result.length == 0) setDoTweetsExist(false)
    })
    useEffect(() =>
        setDoTweetsExist(true),
        [queryName]
    )

    return [
        virtualizeBatches(cache[queryName], scrollTop), // LETS GO virtualization
        isLoading,
        setIsLoading
    ] as const
    //return [cache[queryName]?.batches ?? getEmptyCache().batches, isLoading] as const
}

type Cache = {
    [cacheName: string]: {
        heights: number[]
        batches: Parameters<typeof TweetBatch>[0][]
        unloadedBatchIndices: number[]
        totalBatches: number
        tweetsViewed: number
        scrollHeight: number
        currentlyViewing: string
        currentBatchIndex: number
    }
}
function getEmptyCache() {
    return { batches: [], heights: [], scrollHeight: 0, totalBatches: 0, tweetsViewed: 0, lastViewed: "", currentBatchIndex: 0, unloadedBatchIndices: [], currentlyViewing: "" }
}

function virtualizeBatches(cache?: Cache[string], scrollTop?: number): JSX.Element[] {
    if (!cache || scrollTop == undefined) return [] satisfies JSX.Element[]
    let totalHeight = 0
    let startIndex = 0
    for (const height of cache.heights) {
        totalHeight += height
        const distanceFromTop = scrollTop - totalHeight
        if (distanceFromTop > 1500) {
            startIndex++
            continue
        }
        break
    }
    const endIndex = Math.min(cache.batches.length, startIndex + 4)
    // TODO: do this as one single .map pass
    const visibleBatches = [
        ...cache.heights.slice(0, startIndex).map((height, index) => <div style={{ height: height + "px" }} key={"spacer top" + index}></div>),
        ...cache.batches.slice(startIndex, endIndex).map((batch, index) => spreadIntoTweetBatch({ ...batch, minHeight: cache.heights[startIndex + index] })),
        ...cache.heights.slice(endIndex).map((height, index) => <div style={{ height: height + "px" }} key={"spacer bottom" + index}></div>)
    ]
    const unloadedBatchesInjection = visibleBatches.map((element, index) =>
        cache.unloadedBatchIndices.includes(index)
            ? spreadIntoTweetBatch(cache.batches[index])
            : element
    )
    const scrollRestoreTarget = cache.batches[cache.currentBatchIndex]
    if (!scrollRestoreTarget) return unloadedBatchesInjection
    const scrollRestoreTargetInjected = [
        ...unloadedBatchesInjection.slice(0, cache.currentBatchIndex),
        spreadIntoTweetBatch(scrollRestoreTarget),
        ...unloadedBatchesInjection.slice(cache.currentBatchIndex + 1)
    ]
    return scrollRestoreTargetInjected
}

//AI wrote this i font feel like using it
// function renderBatches(cache: Cache[string]) {
//     return cache.heights.map((height, index) => {
//         const batch = cache.batches[index];
//         const isUnloaded = cache.unloadedBatchIndices.includes(index);
//         const isScrollRestore = index === cache.currentBatchIndex;

//         // Always render unloaded batches
//         if (isUnloaded) {
//             return spreadIntoTweetBatch(batch);
//         }

//         // Always render scroll-restore batch
//         if (isScrollRestore) {
//             return (
//                 <TweetBatch
//                     key={"batch-" + index}
//                     batchPromise={batch.batchPromise}
//                     dataKey={batch.dataKey}
//                     openSearchWith={batch.openSearchWith}
//                     setOwnHeight={batch.setOwnHeight}
//                     view={batch.view}
//                     minHeight={batch.minHeight}
//                 />
//             );
//         }

//         if (index < cache.startIndex || index >= cache.endIndex) {
//             return <div style={{ height: height + "px" }} key={"spacer-" + index} />;
//         }
//         // Normal visible batch
//         return spreadIntoTweetBatch({ ...batch, minHeight: height });
//     });
// }

function spreadIntoTweetBatch(batch: Parameters<typeof TweetBatch>[0]) {
    return <TweetBatch
        batchPromise={batch.batchPromise}
        dataKey={batch.dataKey}
        openSearchWith={batch.openSearchWith}
        setOwnHeight={batch.setOwnHeight}
        view={batch.view}
        minHeight={batch.minHeight}
    />
}