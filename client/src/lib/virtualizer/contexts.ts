import { createContext } from 'react'
import { createUseContext } from '../contexts'
import type { VirtualElementInfo, VirtualElementMap } from './VirtualizerProvider'

export const VirtualizerContext = createContext<{
	virtualElements: VirtualElementMap
	mergeVirtualElementsAtKey: (key: string, element: HTMLElement, virtualElementInfo: Partial<VirtualElementInfo>) => void
} | null>(null)
export const useVirtualizer = createUseContext(VirtualizerContext)

export const VirtualizedItemContext = createContext<{ markAsStable: () => void } | null>(null)
export const useVirtualizedItemContext = createUseContext(VirtualizedItemContext)
