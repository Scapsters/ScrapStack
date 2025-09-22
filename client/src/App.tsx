import { QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import { queryClient } from './trpc'
import { Outlet } from 'react-router-dom'
import { userContext } from './lib/userContext';

export default function App() {
    const isBrowser = typeof window !== 'undefined'
    const userToken = isBrowser ? window.localStorage.getItem("userToken") : ""
    const adminSecret = isBrowser ? window.localStorage.getItem("userToken2") : ""
    return (
        <userContext.Provider value={{ userToken, adminSecret }}>
            <QueryClientProvider client={queryClient}>
                <Outlet />
            </QueryClientProvider>
        </userContext.Provider>
    )
}
