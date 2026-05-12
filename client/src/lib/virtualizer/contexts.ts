import { createContext } from 'react'
import { createUseContext } from '../contexts'
import type { VirtualElementInfo, VirtualElementMap } from './provider'

export type VirtualizerStore = {
	virtualElements: VirtualElementMap
	mergeVirtualElementsAtKey: (
		key: string,
		element: HTMLElement,
		virtualElementInfo: Partial<VirtualElementInfo>
	) => void
}
export const VirtualizerContext = createContext<VirtualizerStore | null>(null)
export const useVirtualizer = createUseContext(VirtualizerContext)

export const VirtualizedItemContext = createContext<{
	markAsStable: () => void
	registerElement: (element: HTMLElement | null) => void
} | null>(null)
export const useVirtualizedItemContext = createUseContext(VirtualizedItemContext)
