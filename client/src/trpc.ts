import { QueryClient } from '@tanstack/react-query'
import type { AppRouter } from '../../api/source/api/router'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { createContext } from 'react'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';

export const API_ROOT = import.meta.env.VITE_API_URL

export const queryClient = new QueryClient()

export const defaultTrpcClient = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: API_ROOT,
            headers() {
                return {
                    authorization: "",
                    usertoken: ""
                }
            },
        }),
    ],
})

export const TrpcQueryClient = createContext<ReturnType<typeof createTRPCOptionsProxy<AppRouter>>>(
    createTRPCOptionsProxy<AppRouter>({
        client: defaultTrpcClient,
        queryClient,
    })
)

export const TrpcClient = createContext<ReturnType<typeof createTRPCClient<AppRouter>>>(defaultTrpcClient)