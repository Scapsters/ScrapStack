import { useMemo, useState } from "react"
import { TopBar } from "./LandingPage"
import { Input } from '@headlessui/react'
import { trpc } from "./trpc"
import { useQuery } from "@tanstack/react-query"
import FuzzySearch from 'fuzzy-search';
import { StackDB } from '../../api/source/schemas';

export default function StackSearch() {
    const [search, setSearch] = useState("")
    
    const { data, error } = useQuery(trpc.getStacks.queryOptions())
    const searchedStacks = useMemo(
        () => data && new FuzzySearch(data, [StackDB]), 
        [stacks]
    )
        
    return (<>
        <TopBar />
        <div className="flex flex-col w-full h-100 bg-red align-center">
            <Input name="Search Stacks"/>
        </div>
    </>)
}