import { useContext, useEffect, useMemo, useRef } from 'react'
import { useIsVisible, useTweet } from './lib/tweetHooks'
import type { TweetWithBlobs } from './lib/tweetQueue'
import { useUserContext } from './lib/userContext'
import { ConfirmActionButton, CopyButton } from './components/ConfirmActionButton'
import { GoHeart, GoPlus, GoSearch, GoSync, GoTrash } from 'react-icons/go'
import { Link } from 'react-router-dom'
import { TrpcClient } from './trpc'

export function TweetBatch(props: { batch: TweetWithBlobs[] }) {
	return (
		<>
			{props.batch.map(tweetWithURLs => (
				<Tweet key={tweetWithURLs.data.tweet_id} tweetWithURLs={tweetWithURLs} />
			))}
		</>
	)
}

export function Tweet(props: { tweetWithURLs: TweetWithBlobs }) {
	const trpcClient = useContext(TrpcClient)

	const tweet = props.tweetWithURLs.data
	const [mediaElements, isLoading, markAsViewed] = useTweet(props.tweetWithURLs)

	const linkToCopy = useMemo(() => {
		const url = new URL(location.href)
		url.search = ''
		url.searchParams.set('tweet_id', tweet.tweet_id)
		return url.toString()
	}, [tweet.tweet_id])
	const linkToSearch = useMemo(() => {
		const url = new URL(location.href)
		url.search = ''
		url.searchParams.set('handle', tweet.handle)
		return url.search
	}, [tweet.handle])

	const visibilityRef = useRef<HTMLDivElement>(null)
	const [isVisible, removeListener] = useIsVisible(visibilityRef)
	useEffect(() => {
		if (isLoading) return
		if (isVisible) {
			markAsViewed()
			removeListener()
		}
	}, [isLoading, isVisible, markAsViewed, removeListener])

	const { adminSecret } = useUserContext()

	if (isLoading)
		return (
			<div key={props.tweetWithURLs.data.tweet_id} className="h-80 flex flex-col items-center gap-6">
				Images Loading...
				<GoSync size={40} className="-scale-y-100 animate-[spin_1s_linear_infinite_reverse]" />
			</div>
		)

	return (
		<div
			ref={visibilityRef}
			key={props.tweetWithURLs.data.tweet_id}
			className="border-b-1 border-black/10 w-auto py-5"
		>
			<div className="flex flex-col items-center gap-2">
				<div className="flex items-center gap-4">
					<a
						href={tweet.tweet_link}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-4 p-2 border-2 border-transparent px-6 bg-white/40 rounded-md w-fit hover:bg-black/5 hover:border-2 hover:border-cyan"
					>
						<img src={tweet.profile_img} className="rounded-full"></img>
						<div>
							<p className="text-black/90">{tweet.user}</p>
							<p className="text-black/40">{tweet.handle}</p>
						</div>
					</a>
				</div>
				<div className="w-4/5 text-center"> {tweet.content} </div>
				<div className="flex gap-2 w-[90dvw] justify-center items-center flex-wrap"> {mediaElements} </div>
				<div className="w-full flex justify-center relative">
					{adminSecret && (
						<ConfirmActionButton
							className="absolute left-0 p-1"
							failureMessage="Ban failed. Check authentication?" //TODO: better errors
							successMessage="Post Banned."
							requireConfirmation
							onClick={() => trpcClient.banTweet.mutate(tweet)}
						>
							<GoTrash className="text-red-700" size={28} />
						</ConfirmActionButton>
					)}
					<div className="flex gap-8 p-1">
						<Link to={linkToSearch} className="button">
							<GoSearch size={28} />
						</Link>
						<button onClick={() => {}} className="hidden button">
							<GoPlus size={28} />
						</button>
						<button onClick={() => {}} className="hidden button">
							<GoHeart size={28} />
						</button>
						<CopyButton size={28} textToCopy={linkToCopy} />
					</div>
				</div>
			</div>
		</div>
	)
}
