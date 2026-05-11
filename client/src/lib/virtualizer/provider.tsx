import type { ReactNode } from 'react'
import { VirtualizerContext } from './context'

export function VirtualizerProvider({ children }: { children: ReactNode }) {
	return <VirtualizerContext.Provider value={}>{children}</VirtualizerContext.Provider>
}
