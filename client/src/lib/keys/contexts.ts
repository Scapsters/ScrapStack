import { createContext } from "react"
import { createUseContext } from "../contexts"

export const StackKeyContext = createContext<{ 
    stackKey: string 
} | null>(null)

export const useStackKey = createUseContext(StackKeyContext)

export const BatchKeyContext = createContext<{ 
    batchKey: string 
} | null>(null)

export const useBatchKey = createUseContext(BatchKeyContext)