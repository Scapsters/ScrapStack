import { QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import { queryClient } from './trpc'
import { Outlet } from 'react-router-dom'
import { userContext } from './lib/userContext';
import { useState } from 'react'
import { playerContext } from './lib/playerContext';

export default function App() {
    const isBrowser = typeof window !== 'undefined'
    // setting this does not set the user token. This cannot be subscribed to via useSyncExternal storage because it does not fire off listeners in the window where the change originated
    const [userToken, setUserToken] = useState(isBrowser ? window.localStorage.getItem("userToken") ?? "" : "")
    const [adminSecret, setAdminSecret] = useState("")
    const [isMuted, setIsMuted] = useState(true)
    
    // const [allTweets, setAllTweets] = useState<TweetInput[]>([])
    // useEffect(() => {
    //     const getTweets = async () => {
    //         const tweets = await trpcClient.getRandomUnviewedTweets.query({ stackUsername: "Scappy11" })
    //         setAllTweets(prevTweets => {
    //             tweets.forEach(tweet => {
    //                 prevTweets.forEach(prevTweet => {
    //                     if (tweet.tweet_id == prevTweet.tweet_id) console.log(tweet.tweet_id)
    //                 })
    //             })
    //             return [...prevTweets, ...tweets]
    //         })
    //         setTimeout(getTweets, 200)
    //     }
    //     getTweets()
    // }, [setAllTweets])

    return (
        <playerContext.Provider value={{ isMuted, setIsMuted }}>
            <userContext.Provider value={{ userToken, setUserToken, adminSecret, setAdminSecret }}>
                <QueryClientProvider client={queryClient}>
                    {/* <div className="h-100 p-20 w-100 bg-pink-200/40">
                    <p>{allTweets.length}</p>
                        {allTweets.map(tweet => <p>{tweet._id}</p>)}
                    </div> */}
                    <Outlet />
                </QueryClientProvider>
            </userContext.Provider>
        </playerContext.Provider>
    )
}
