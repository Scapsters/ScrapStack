import { useMemo, useState, type ReactNode } from 'react'
import { VirtualizerContext } from './contexts'

export type VirtualElementInfo = {
	element: HTMLElement
	isStable: boolean
	size: DOMRect
}

export type VirtualElementMap = Map<string, VirtualElementInfo>

export function VirtualizerProvider({ children }: { children: ReactNode }) {
	const [virtualElements, setVirtualElements] = useState<VirtualElementMap>(new Map())

	const mergeVirtualElementsAtKey = useMemo(() => {
		const getFallbackVirtualizerElement = (element: HTMLElement) => ({
			element,
			size: element.getBoundingClientRect(),
			isStable: false,
		})
		return (key: string, element: HTMLElement, virtualElementInfo: Partial<VirtualElementInfo>) =>
			setVirtualElements(prev =>
				new Map(prev).set(key, {
					...getFallbackVirtualizerElement(element),
					...prev.get(key),
					...virtualElementInfo,
				})
			)
	}, [])

	return (
		<VirtualizerContext.Provider value={{ virtualElements, mergeVirtualElementsAtKey }}>
			{children}
		</VirtualizerContext.Provider>
	)
}
