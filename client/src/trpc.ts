import { QueryClient } from '@tanstack/react-query'
import type { AppRouter } from '../../api/source/api'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import './App.css'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'

export const API_ROOT = 'https://7kmjvblyk7kqm2fyxkcvgcjvq40fsxxl.lambda-url.us-east-1.on.aws/'

export const queryClient = new QueryClient()
const trpcClient = createTRPCClient<AppRouter>({
    links: [httpBatchLink({ url: API_ROOT })]
})
export const trpc = createTRPCOptionsProxy<AppRouter>({
    client: trpcClient,
    queryClient
})
