import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { TweetSchema } from '../../api/source/api/schemas'
import { trpcClient } from './trpc'
import { type TweetWithURLs, useTweetQueue } from './lib/tweetQueue'
import { useLocation, useSearchParams } from 'react-router-dom'
import { useTweet, useIsVisible, usePromise } from './lib/tweetHooks'
import { GoHeart, GoPlus, GoSearch, GoTrash } from "react-icons/go"
import { ScrollAwareTopBar, TopBar } from './components/TopBar'
import { SideBar } from './components/Sidebar'
import { ConfirmActionButton, CopyButton } from './components/ConfirmActionButton'
import { userContext } from './lib/userContext'
import { useForm } from 'react-hook-form'
import { Field, Input, Label, Radio, RadioGroup } from '@headlessui/react'

export function Stack() {
    const location = useLocation()
    const username = useMemo(() => location.pathname.split('/').pop() ?? '', [location])
    const centerText = `${username}${username.endsWith('s') ? "'" : "'s"} Stack`

    const [params] = useSearchParams()
    const entryTweet = useRef(params.get("tweet_id"))

    const { userToken, adminSecret } = useContext(userContext)

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
                    tweetSorter: searchSorter ?? undefined,
                })
            : defaultQuery
    )
    useEffect(() => {
        if (searchFilter || searchSorter)
            return
        void fillQueue(
            entryTweet.current
                ? () => trpcClient.getTweets.query({ tweetFilter: { tweet_id: entryTweet.current ?? undefined } })
                : defaultQuery
        )
    }, [defaultQuery, entryTweet, searchFilter, searchSorter, fillQueue])

    const tweetBatches = useMemo(() => batches.map((batch, index) => (
        <TweetBatch key={index} batchPromise={batch} view={view}></TweetBatch>
    )), [batches, view])

    const {
        getValues,
        register
    } = useForm({
        defaultValues: {
            content: "",
            handle: "",
            tags: "",
        }
    })
    const [sortBy, setSortBy] = useState("Default")
    const [sortDirection, setSortDirection] = useState<1 | -1>(1)

    return (
        <div>
            <ScrollAwareTopBar centerText={centerText} />
            <TopBar centerText={centerText} />
            <SideBar>
                <div className="flex flex-col gap-2 m-6">
                    <p className="font-bold text-cyan-dark text-lg">Filter</p>
                    <Field className="flex justify-between items-center">
                        <Label className="label h-min">Content</Label>
                        <Input placeholder="simple text search..." type="text" {...register('content')} className="m-1 px-3 py-1.5 input" />
                    </Field>
                    <Field className="flex justify-between items-center">
                        <Label className="label h-min">Artist Handle</Label>
                        <Input placeholder="@artist" type="text" {...register('handle')} className="m-1 px-3 py-1.5 input" />
                    </Field>
                    <Field className="flex justify-between items-center">
                        <Label className="label h-min">Tags</Label>
                        <Input placeholder="tag1, tag2.." type="text" {...register('tags')} className="m-1 px-3 py-1.5 input" />
                    </Field>
                    <p className="font-bold text-cyan-dark text-lg  mt-6">Sort</p>
                    <div className="flex justify-between mx-6">
                        <RadioGroup
                            value={sortBy}
                            onChange={setSortBy}
                            className="m-1 px-3 py-1.5"
                        >
                            <Field className="m-1">
                                <Radio value={"DatePosted"} className="radio-option"> Date Posted </Radio>
                            </Field>
                            <Field className="mt-5 m-1">
                                <Radio value={"Default"} className="radio-option"> Default </Radio>
                            </Field>
                        </RadioGroup>
                        <RadioGroup
                            value={sortDirection}
                            onChange={setSortDirection}
                            className="m-1 px-3 py-1.5"
                            disabled={sortBy === "Default"}
                        >
                            <Field className="m-1">
                                <Radio value={1} className="radio-option"> Ascending </Radio>
                            </Field>
                            <Field className="mt-5 m-1">
                                <Radio value={-1} className="radio-option"> Descending </Radio>
                            </Field>
                        </RadioGroup>
                    </div>
                </div>
                <div className="flex justify-center w-full mb-4">
                    <button
                        className="button"
                        onClick={() => {
                            const formData = getValues()
                            setSearchFilter({
                                content: formData.content,
                                handle: formData.handle,
                                tagSet: [{ owner: userToken ?? "", tags: formData.tags.split(",") }]
                            })
                            setSearchSorter(sortBy == "Default"
                                ? {}
                                : sortBy == "DatePosted"
                                    ? { date_time: sortDirection }
                                    : {}
                            )
                        }}
                    >
                        Search
                    </button>
                </div>
            </SideBar>
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

    const { userToken, adminSecret } = useContext(userContext)

    if (areUrlsLoading) return <div className="h-80"> "Loading images" </div>

    return (
        <div ref={visiblityRef} className="border-b-1 border-black/10 w-full pb-5">
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
                        <button
                            onClick={() => {

                            }}
                            className="button"
                        >
                            <GoSearch size={28} />
                        </button>
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
                        <CopyButton size={28} textToCopy={window.location.origin + window.location.pathname + "?tweet_id=" + tweet.tweet_id} />
                    </div>
                </div>
            </div>
        </div>
    )
}

