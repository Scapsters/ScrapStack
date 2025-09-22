import { useMemo, useState } from 'react'
import { Input } from '@headlessui/react'
import { trpc } from './trpc'
import { useQuery } from '@tanstack/react-query'
import FuzzySearch from 'fuzzy-search'
import { Link } from 'react-router-dom'
import { TopBar } from './components/TopBar'

export default function StackSearch() {
    const [search, setSearch] = useState('')

    const { data: stacks, error } = useQuery(trpc.getStacks.queryOptions({}))
    const searchedStacks = useMemo(
        () => (
            (
                stacks
                && search
                && new FuzzySearch(stacks, ['twitterHandle', '_id']).search(search))
            ) || (
                stacks
                && stacks.sort((a, b) => a.postCount - b.postCount)
            ) || [],
        [search, stacks]
    )
    
    return (<>
        <TopBar />
        <div className="flex justify-center w-full">
            <div className="flex flex-col items-center gap-10 mt-5 w-175">
                <Input
                    placeholder="Search Stacks"
                    onChange={(event) => setSearch(event.target.value)}
                    className="p-1 px-1.5 border-2 border-dark/40 rounded-md w-full"
                />
                {error ? (
                    <p>There was an error fetching stacks. Please refresh the page.</p>
                ) : (
                    searchedStacks.map((stack) => (
                        <Link to={`/stacks/${stack.twitterHandle}`} className="flex justify-between items-center p-2 px-15 border-1 border-dark/20 rounded-md w-3/4 h-20 text-dark hover:bg-cyan-light/50 hover:border-2">
                            <p>{stack.twitterHandle}</p>
                            <p>{stack.postCount}</p>
                        </Link>
                    ))
                )}
            </div>
        </div>
    </>)
}