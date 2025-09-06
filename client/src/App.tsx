import { QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import { queryClient } from './trpc'
import LandingPage, { TopBar } from './LandingPage'


export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <TopBar />
            <LandingPage />
        </QueryClientProvider>
    )
}



