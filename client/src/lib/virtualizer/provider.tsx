import { useMemo, useState, type ReactNode } from 'react'
import { VirtualizerContext } from './contexts'
import { useStackKey } from '../stackKey/contexts'

export type VirtualElementInfo = {
	element: HTMLElement
	isStable: boolean
	size: DOMRect
}

export type VirtualElementMap = Map<string, VirtualElementInfo>

export function VirtualizerProvider({ children }: { children: ReactNode }) {
	const [virtualElementMaps, setVirtualElementMaps] = useState<Map<string, VirtualElementMap>>(new Map())
	const { stackKey } = useStackKey()

	const mergeVirtualElementsAtKey = useMemo(() => {
		const getFallbackVirtualizerElement = (element: HTMLElement) => ({
			element,
			size: element.getBoundingClientRect(),
			isStable: false,
		})
		return (key: string, element: HTMLElement, virtualElementInfo: Partial<VirtualElementInfo>) =>
			setVirtualElementMaps(prev =>
				new Map(prev).set(
					stackKey,
					new Map(prev.get(stackKey)).set(key, {
						...getFallbackVirtualizerElement(element),
						...prev.get(stackKey)?.get(key),
						...virtualElementInfo,
					})
				)
			)
	}, [stackKey])

	return (
		<VirtualizerContext.Provider value={{ virtualElements: virtualElementMaps.get(stackKey) ?? new Map(), mergeVirtualElementsAtKey }}>
			{children}
		</VirtualizerContext.Provider>
	)
}
