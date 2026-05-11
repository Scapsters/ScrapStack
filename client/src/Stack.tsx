import { useContext, useMemo, useRef } from 'react'
import { useTweetQueue } from './lib/tweetQueue'
import { useLocation, useSearchParams } from 'react-router-dom'
import { ScrollAwareTopBar, TopBar } from './components/TopBar'
import Loader from './components/Loader'
import { TrpcClient } from '@/trpc'
import { getFilterFromParams, getSorterFromParams } from './formConsts'
import { TweetBatch } from './Tweet'
import { TweetSearch, type TweetSearchParams } from './TweetSearch'
import { TweetCacheProvider } from './lib/tweetCache/provider'
import { useTweetCache } from './lib/tweetCache/context'

export function StackManager() {
	const location = useLocation()
	const stackUsername = location.pathname.split('/').pop() ?? ''

	const [params] = useSearchParams()
	const tweetFilter = { stackUsername, ...getFilterFromParams(params) }
	const tweetSorter = getSorterFromParams(params)
	const firstTweetId = params.get('tweet_id')
	const stackProps = { tweetFilter, tweetSorter, firstTweetId }
	const stackKey = JSON.stringify(stackProps)

	return (
		<>
			<TweetSearch {...stackProps} />
			<TweetCacheProvider stackKey={stackKey}>
				<Stack key={stackKey} {...stackProps} />
			</TweetCacheProvider>
		</>
	)
}

export function Stack({
	tweetFilter,
	tweetSorter,
	firstTweetId,
}: TweetSearchParams & {
	firstTweetId: string | null
}) {
	const trpcClient = useContext(TrpcClient)

	const location = useLocation()
	const stackUsername = location.pathname.split('/').pop() ?? ''

	// While changes to the filter, sorter, and first tweet will cause component remounts and seem to make this useMemo unneccesary,
	// changes to the tweet cache or other rerenders will cause component re-evaluations, making the functions' values unstable.
	const [getFirstTweet, getNextTweet] = useMemo(() => {
		const getFirstTweet = firstTweetId
			? () => trpcClient.getTweets.query({ tweetFilter: { tweet_id: firstTweetId } })
			: null

		const isQueryingRandom = Object.keys(tweetFilter).length === 1 && !tweetSorter
		const getNextTweet = (page: number) =>
			isQueryingRandom
				? trpcClient.getRandomUnviewedTweets.query({ stackUsername: stackUsername })
				: trpcClient.getTweets.query({ tweetFilter, tweetSorter, page })

		return [getFirstTweet, getNextTweet]
	}, [firstTweetId, stackUsername, trpcClient, tweetFilter, tweetSorter])

	
	const ref = useRef<HTMLDivElement>(null)
	const isLoading = useTweetQueue(getFirstTweet, getNextTweet, ref)
	const { tweetBatches } = useTweetCache()
	
	const centerText = `${stackUsername}${stackUsername.endsWith('s') ? "'" : "'s"} Stack`

	return (
		<div ref={ref}>
			<ScrollAwareTopBar centerText={centerText} />
			<TopBar centerText={centerText} className={typeof window === 'undefined' ? 'visible' : 'invisible'} />
			<div className="flex justify-center pt-4">
				<div className="flex flex-col items-center gap-5 w-9/10 lg:w-275">
					{isLoading ? (
						<Loader />
					) : tweetBatches.length > 0 ? (
						tweetBatches.map(batch => <TweetBatch batch={batch} />)
					) : (
						<p>No Scraps found. Please try a different search.</p>
					)}
				</div>
			</div>
		</div>
	)
}
