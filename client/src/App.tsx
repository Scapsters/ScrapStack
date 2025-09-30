import { QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import { queryClient } from './trpc'
import { Outlet } from 'react-router-dom'
import { userContext } from './lib/userContext';
import { useState } from 'react'
import { playerContext } from './lib/playerContext';

export default function App() {
    const isBrowser = typeof window !== 'undefined'
    const [userToken, setUserToken] = useState(isBrowser ? window.localStorage.getItem("userToken") ?? "" : "")
    const [adminSecret, setAdminSecret] = useState("")
    const [isMuted, setIsMuted] = useState(true)
    return (
        <playerContext.Provider value={{ isMuted, setIsMuted }}>
            <userContext.Provider value={{ userToken, setUserToken, adminSecret, setAdminSecret }}>
                <QueryClientProvider client={queryClient}>
                    <Outlet />
                </QueryClientProvider>
            </userContext.Provider>
        </playerContext.Provider>
    )
}
