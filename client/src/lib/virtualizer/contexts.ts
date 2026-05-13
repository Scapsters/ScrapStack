import { createContext } from 'react'
import { createUseContext, type RegisterElement } from '../contexts'
import type { VirtualElementInfo, VirtualElementMap } from './provider'

export type VirtualizerStore = {
	virtualElements: VirtualElementMap
	mergeVirtualElementsAtKey: (
		key: string,
		element: HTMLElement,
		virtualElementInfo: Partial<VirtualElementInfo>
	) => void
	scrollToElement: (elementKey: string, offset?: number) => void
}
export const VirtualizerContext = createContext<VirtualizerStore | null>(null)
export const useVirtualizer = createUseContext(VirtualizerContext)

export const VirtualizedItemContext = createContext<{
	markAsStable: () => void
	registerElement: RegisterElement
} | null>(null)
export const useVirtualizedItem = createUseContext(VirtualizedItemContext)
