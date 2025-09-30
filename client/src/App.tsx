import { QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import { API_ROOT, queryClient, TrpcClient, TrpcQueryClient } from './trpc'
import { Outlet } from 'react-router-dom'
import { userContext } from './lib/userContext';
import { useEffect, useState } from 'react'
import { playerContext } from './lib/playerContext';
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../../api/source/api/router'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'

export default function App() {
    const isBrowser = typeof window !== 'undefined'
    
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
