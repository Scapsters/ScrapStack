import { QueryClient } from '@tanstack/react-query'
import type { AppRouter } from '../../api/source/api/router'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import './App.css'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'

export const API_ROOT = import.meta.env.VITE_API_URL

export const queryClient = new QueryClient()
export const trpcClient = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: API_ROOT,
            headers: {
                authorization: `Bearer ${
                    (typeof sessionStorage != 'undefined' && sessionStorage.getItem('userToken2')) || ''
                }`,
            },
        }),
    ],
})
export const trpc = createTRPCOptionsProxy<AppRouter>({
    client: trpcClient,
    queryClient,
})
