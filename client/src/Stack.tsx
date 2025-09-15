import { useEffect, useMemo, useState } from "react"
import type { TweetDB, TweetSchema } from "../../api/source/api/schemas"
import { TopBar } from "./LandingPage"
import { trpc, trpcClient } from "./trpc"
import { TweetQueue, type TweetWithURLs } from "./lib/tweetQueue"
import { useParams } from "react-router-dom"

export function Stack() {
    const url = new URL(window.location.href)
    const username = url.pathname.split('/').pop() ?? ""
    
    const params = useParams()
    const entryTweet = params["tweet_id"]

    const [searchFilter, setSearchFilter] = useState<Partial<TweetSchema>>({})
    const [searchSorter, setSearchSorter] = useState<Partial<Record<keyof TweetSchema, 1 | -1>>>({})
    const tweetQueue = useMemo(() => 
        new TweetQueue(
            entryTweet
                ? trpcClient.getTweets.query({ tweetFilter: { tweet_id: entryTweet }, })
                : trpcClient.getRandomTweets.query({ stackUsername: username }),
            searchFilter
                ? () => trpcClient.getTweets.query({ tweetFilter: { stackUsername: username, ...searchFilter }, tweetSorter: searchSorter })
                : () => trpcClient.getRandomTweets.query({ stackUsername: username })
        ), 
        [entryTweet, username, searchFilter, searchSorter]
    )

    const batchPromise = usePromise(tweetQueue.batches[0], [])

    return (<>
        <TopBar centerText={`${username}${username.endsWith("s") ? "'" : "'s"} Stack`}/>
        <p> page for {username} </p>
        {
            batchPromise[0].map(tweet => <Tweet tweet={tweet}></Tweet>)
        }
    </>)
}

function Tweet({ tweet }: { tweet: TweetWithURLs }){
	
	const [images, areUrlsLoading, isTweetDataLoading] = useImage(tweet);

	if (areUrlsLoading || isTweetDataLoading) {
		const urlLoadingMessage = areUrlsLoading ? "Waiting for Twitter's CDN" : ""
		const tweetDataLoadingMessage = isTweetDataLoading ? "Waiting for furryslop server" : ""
		return <>
			<p>{urlLoadingMessage}</p>
			<p>{tweetDataLoadingMessage}</p>
		</>
	}

	if(!images) {
		return <p>Waiting for images...</p>
	}

	return (
		<>
			<div className="posts">{images}</div>
		</>
	);
};

const useImage = (tweet: TweetWithURLs) => {
	// Gather media urls and fetch the images from twitter. Urls don't need to be passed to images since this caches them in the browser.
	const [urlsPromise] = usePromise(tweet.mediaUrlBlobs, []);
	const urlsMemo = useMemo(
		() => (urlsPromise ? Promise.all(urlsPromise) : null),
		[urlsPromise]
	);
	const [urls, areUrlsLoading] = usePromise(urlsMemo, []);

	// Gat tweet data and then construct a set of images

	return [urls?.map(url => <img src={url}></img>), areUrlsLoading];
};

export const usePromise = <T,>(
	promise: Promise<T> | null,
	defaultValue: T | null,
): [T | null, boolean] => {
	const [data, setData] = useState<T | null>(defaultValue);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const awaitData = async () => {
			if (!promise) return
			try {
				setData(await promise);
			} catch (error) {
				console.error("Error fetching data:", error);
			} finally {
				setIsLoading(false);
			}
		};
		awaitData();
	}, [promise]);

	return [data, isLoading];
};
