import { createContext, type ReactNode } from "react"
import { createUseContext } from "../contexts"

export const VirtualizerContext = createContext<{
    virtualizedElement: ReactNode
} | null>(null)

export const useVirtualizer = createUseContext(VirtualizerContext)