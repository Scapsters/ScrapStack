import { useMemo, useState } from "react"
import { TopBar } from "./LandingPage"
import { Field, Input } from '@headlessui/react'
import { trpc } from "./trpc"
import { useQuery } from "@tanstack/react-query"
import FuzzySearch from 'fuzzy-search';

export default function StackSearch() {
    const [search, setSearch] = useState("")
    
    const { data: stacks, error } = useQuery(trpc.getStacks.queryOptions())
    const searchedStacks = useMemo(
        () => (stacks && new FuzzySearch(stacks, ['twitterHandle', "_id"]).search(search)) ?? [], 
        [search, stacks]
    )
        
    return (<>
        <TopBar />
        <div className="flex flex-col w-full h-100 align-center">
            <Input placeholder="Search Stacks" className="border-2 w-200 border-dark/40"/>
        </div>
    </>)
}