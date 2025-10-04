import { QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import { API_ROOT, queryClient, TrpcClient, TrpcQueryClient } from './trpc'
import { Outlet } from 'react-router-dom'
import { userContext } from './lib/userContext';
import { useEffect, useState } from 'react'
import { playerContext } from './lib/playerContext';

export default function App() {
    const isBrowser = typeof window !== 'undefined'
    // setting this does not set the user token. This cannot be subscribed to via useSyncExternal storage because it does not fire off listeners in the window where the change originated
    const [userToken, setUserToken] = useState(isBrowser ? window.localStorage.getItem("userToken") ?? "" : "")
    const [adminSecret, setAdminSecret] = useState("")
    const [isMuted, setIsMuted] = useState(true)
    
    const [userToken, setUserToken] = useState(isBrowser ? window.localStorage.getItem("userToken") ?? "" : "")
    useEffect(() => {
        if (isBrowser) window.localStorage.setItem("userToken", userToken) 
    }, [isBrowser, userToken])

    const [adminSecret, setAdminSecret] = useState("")

    const trpcClient = createTRPCClient<AppRouter>({
        links: [
            httpBatchLink({
                url: API_ROOT,
                headers() {
                    return {
                        authorization: `Bearer ${adminSecret}`,
                        usertoken: userToken
                    }
                },
            }),
        ],
    })
    const trpc = createTRPCOptionsProxy<AppRouter>({
        client: trpcClient,
        queryClient,
    })

    const [isMuted, setIsMuted] = useState(true)

    return (
        <playerContext.Provider value={{ isMuted, setIsMuted }}>
            <userContext.Provider value={{ userToken, setUserToken, adminSecret, setAdminSecret }}>
                <QueryClientProvider client={queryClient}>
                    <TrpcQueryClient.Provider value={trpc}>
                        <TrpcClient.Provider value={trpcClient}>
                            <Outlet />
                        </TrpcClient.Provider>
                    </TrpcQueryClient.Provider>
                </QueryClientProvider>
            </userContext.Provider>
        </playerContext.Provider>
    )
}
