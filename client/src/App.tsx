import { QueryClientProvider } from '@tanstack/react-query'
import { Outlet } from 'react-router-dom'
import { userContext } from './lib/userContext';
import { useState } from 'react'
import { playerContext } from './lib/playerContext';
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '../../api/source/api/router'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { API_ROOT, TrpcClient, TrpcQueryClient, queryClient } from './trpc';

export default function App() {
    const isBrowser = typeof window !== 'undefined'
    // setting this does not set the user token in storage. This cannot be subscribed to via useSyncExternal storage because it does not fire off listeners in the window where the change originated
    const [userToken, setUserToken] = useState(isBrowser ? window.localStorage.getItem("userToken") ?? crypto.randomUUID() : "")
    const [adminSecret, setAdminSecret] = useState("")
    const [isMuted, setIsMuted] = useState(true)

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
        queryClient
    })

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
