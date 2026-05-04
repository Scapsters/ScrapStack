import { useContext, useRef } from 'react'
import { useNewTweetQueue } from './lib/tweetQueue'
import { useLocation, useSearchParams } from 'react-router-dom'
import { ScrollAwareTopBar, TopBar } from './components/TopBar'
import { userContext } from './lib/userContext'
import Loader from './components/Loader'
import { TrpcClient } from '@/trpc'
import { getFilterFromParams, getSorterFromParams } from './formConsts'
import { NewTweetBatch } from './Tweet'
import { TweetSearch } from './TweetSearch'

export function Stack() {
	const trpcClient = useContext(TrpcClient)
	const { setUserToken, setAdminSecret } = useContext(userContext)
	const location = useLocation()

	const stackUsername = location.pathname.split('/').pop() ?? ''

	const [params] = useSearchParams()
	const tweetFilter = { stackUsername, ...getFilterFromParams(params) }
	const tweetSorter = getSorterFromParams(params)

	const firstTweetId = params.get('tweet_id')
	const getFirstTweet = firstTweetId
		? () => trpcClient.getTweets.query({ tweetFilter: { tweet_id: firstTweetId } })
		: null

	// Queue
	const isQueryingRandom = Object.keys(tweetFilter).length === 0 && !tweetSorter
	const getNextTweet = (page: number) =>
		isQueryingRandom
			? trpcClient.getRandomUnviewedTweets.query({ stackUsername: stackUsername })
			: trpcClient.getTweets.query({ tweetFilter, tweetSorter, page })

	const ref = useRef<HTMLDivElement>(null)
	const tweetBatches = useNewTweetQueue(getFirstTweet, getNextTweet, ref)
	const isLoading = tweetBatches.length === 0

	if (!setUserToken || !setAdminSecret)
		return (
			<div className="w-full text-center mt-10">
				<div className="w-80">
					Context had a problem loading. please refresh the page, then clear your browsers cache, cookies, and
					local storage if the issue persists.
				</div>
			</div>
		)

	const centerText = `${stackUsername}${stackUsername.endsWith('s') ? "'" : "'s"} Stack`

	return (
		<div ref={ref}>
			<ScrollAwareTopBar centerText={centerText} />
			<TopBar centerText={centerText} className={typeof window === 'undefined' ? 'visible' : 'invisible'} />
			<TweetSearch tweetFilter={tweetFilter} isLoading={isLoading} />
			<div className="flex justify-center pt-4">
				<div className="flex flex-col items-center gap-5 w-9/10 lg:w-275">
					{isLoading ? (
						<Loader />
					) : tweetBatches.length > 0 ? (
						tweetBatches.map(batch => <NewTweetBatch batch={batch} />)
					) : (
						<p>No Scraps found. Please try a different search.</p>
					)}
				</div>
			</div>
		</div>
	)
}
