import { useCallback, useContext, useMemo, useState } from 'react'
import { trpcClient } from './trpc'
import { useTweetQueue } from './lib/tweetQueue'
import { useLocation, useSearchParams } from 'react-router-dom'
import { ScrollAwareTopBar, TopBar } from './components/TopBar'
import { SideBar } from './components/Sidebar'
import { useForm } from 'react-hook-form'
import { Field, Input, Label, Radio, RadioGroup } from '@headlessui/react'
import { userContext } from './lib/userContext'
import { SecureField } from './components/SecureField'
import type { TweetSchema } from '../../api/source/api/schemas'
import { GoSync } from 'react-icons/go'

export const defaultSearchValues = {
    content: "",
    handle: "",
    tags: "",
}

export function Stack() {
    const location = useLocation()
    const username = useMemo(() => location.pathname.split('/').pop() ?? '', [location])
    const centerText = `${username}${username.endsWith('s') ? "'" : "'s"} Stack`

    const { userToken, setUserToken, adminSecret, setAdminSecret } = useContext(userContext)

    // Params stuff
    const [params, setParams] = useSearchParams()
    const entryTweet = useMemo(() => params.get("tweet_id"), [params])
    const searchFilter = useMemo(() => ({
        content: params.get("content") || undefined,
        handle: params.get("handle") || undefined,
        tags: params.get("tags") || undefined,
    }), [params])
    const searchSorter = useMemo(() => {
        const sortByParam = params.get("sort_by") || "Default" satisfies keyof TweetSchema | "Default"
        const sortDirectionParam = parseInt(params.get("sort_direction") ?? "")
        return sortByParam != "Default" && sortDirectionParam
            ? { [sortByParam]: sortDirectionParam }
            : undefined
    }, [params])

    // Queue stuff
    const isQueryingRandom = Object.values(searchFilter).every(item => item === undefined) && !searchSorter
    const getNextTweet = useCallback((batchIndex: number) => {
        if (!isQueryingRandom) {
            return trpcClient.getTweets.query({
                tweetFilter: { stackUsername: username, ...searchFilter },
                tweetSorter: searchSorter,
                page: batchIndex
            })
        } else {
            return trpcClient.getRandomUnviewedTweets.query({ stackUsername: username })
        }
    }, [isQueryingRandom, searchFilter, searchSorter, username])
    const getEntryTweet = useMemo(() => 
        entryTweet
            ? (() => trpcClient.getTweets.query({ tweetFilter: { tweet_id: entryTweet ?? undefined } }))
            : undefined
    , [entryTweet])

    // Form stuff
    const {
        getValues: getFormValues,
        reset: resetForm,
        register
    } = useForm<typeof defaultSearchValues>({ defaultValues: searchFilter })
    const [formSortBy, setFormSortBy] = useState<keyof TweetSchema | "Default">("Default")
    const [formSortDirection, setFormSortDirection] = useState<1 | -1>(1)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [handleStyle, setHandleStyle] = useState("")
    const openSearchWith = useCallback((values: typeof defaultSearchValues) => {
        setParams(values)
        resetForm(values)
        setIsSettingsOpen(true)
        setTimeout(() => setHandleStyle("bg-cyan-light!"), 300)
        setTimeout(() => setHandleStyle(""), 800)
    }, [resetForm, setParams])
    const submitForm = useCallback(() => {
        const formData = getFormValues()
        setParams({
            ...formData,
            sort_by: formSortBy,
            sort_direction: String(formSortDirection)
        })
    }, [formSortBy, formSortDirection, getFormValues, setParams])

    const [tweetBatches, isLoading] = useTweetQueue(getNextTweet, openSearchWith, getEntryTweet, isQueryingRandom ? "Random" : undefined,)

    if (!setUserToken || !setAdminSecret || !userToken) return (
        <div className="w-full text-center mt-10">
            Context Loading... This shouldn't happen, please clear your browsers cache, cookies, and local storage if the issue persists.
        </div>
    )

    return (
        <div>
            <ScrollAwareTopBar centerText={centerText} />
            <TopBar centerText={centerText} className={typeof window === "undefined" ? "visible" : "invisible"}/>
            <SideBar isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen}>
                <form
                    className={`relative rounded-lg m-2 py-2`} 
                    onSubmit={(e) => {
                        e.preventDefault()
                        submitForm()
                    }}
                >
                    <div className={`absolute flex items-center justify-center w-full h-full rounded-lg ${isLoading ? "bg-black/20 z-40" : "invisible -z-10"}`}>
                        <GoSync size={40} className='-scale-y-100 animate-[spin_1s_linear_infinite_reverse]' />
                    </div>
                    <div className="flex flex-col gap-2 m-4">
                        <p className="font-bold text-cyan-dark text-lg">Search</p>
                        <Field className="hidden flex justify-between items-center">
                            <Label className="label h-min">Content</Label>
                            <Input placeholder="simple text search..." type="text" {...register('content')} className="m-1 px-3 py-1.5 input" />
                        </Field>
                        <Field className="flex justify-between items-center">
                            <Label className="label h-min">Artist Handle</Label>
                            <Input placeholder="@artist" type="text" {...register('handle')} className={`m-1 px-3 py-1.5 input transition-colors duration-100 ease-out ${handleStyle}`} />
                        </Field>
                        <Field className="hidden flex justify-between items-center">
                            <Label className="label h-min">Tags</Label>
                            <Input placeholder="tag1, tag2.." type="text" {...register('tags')} className="m-1 px-3 py-1.5 input" />
                        </Field>
                        <p className="font-bold text-cyan-dark text-lg mt-6">Sort</p>
                        <div className="flex justify-around mr-6 w-full text-center">
                            <RadioGroup
                                value={formSortBy}
                                onChange={setFormSortBy}
                                className="m-1 px-3 py-1.5 flex flex-col"
                            >
                                <Field className="m-1"> <Radio value={"date_time" satisfies keyof TweetSchema} className="radio-option"> Date Posted </Radio> </Field>
                                <Field className="mt-3 m-1"> <Radio value={"Default"} className="radio-option"> Default </Radio> </Field>
                            </RadioGroup>
                            <RadioGroup
                                value={formSortDirection}
                                onChange={setFormSortDirection}
                                className="m-1 px-3 py-1.5 flex flex-col"
                                disabled={formSortBy === "Default"}
                            >
                                <Field className="m-1"> <Radio value={1} className="radio-option"> Ascending </Radio> </Field>
                                <Field className="mt-3 m-1"> <Radio value={-1} className="radio-option"> Descending </Radio> </Field>
                            </RadioGroup>
                        </div>
                    </div>
                    <div className="flex justify-center w-full">
                        <button className="bg-black/10 px-6! button" type="submit"> Search </button>
                    </div>
                </form>
                <div className="bg-cyan-dark h-0.5 w-4/5 mt-8 mx-10"></div>
                <div className="flex flex-col gap-2 m-6">
                    <p className="font-bold text-cyan-dark text-lg">Account</p>
                    <SecureField name="User Token" placeholder="abc-123..." value={userToken} setValue={setUserToken} />
                    <p className="text-sm mx-4 text-black/80">User Tokens track viewed posts and are stored in your browser's local storage.</p>
                    <SecureField name="Access Token" placeholder="shh..." value={adminSecret ?? ""} setValue={setAdminSecret} />
                    <p className="text-sm mx-4 text-black/80">Access tokens are for administrator actions, and are not stored.</p>
                </div>
            </SideBar>
            <div className="flex justify-center pt-4">
                <div className="flex flex-col items-center gap-5 w-275">
                    {tweetBatches}
                </div>
            </div>
        </div>
    )
}
