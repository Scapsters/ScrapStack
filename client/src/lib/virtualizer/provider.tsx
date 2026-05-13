import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { VirtualizerContext } from './contexts'
import { useStackKey } from '../keys/contexts'

export type VirtualElementInfo = {
	element: HTMLElement
	virtualElement: HTMLElement
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
			virtualElement: element,
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

	const scrollToElement = useCallback(
		(elementKey: string) => {
			const virtualElementMap = virtualElementMaps.get(stackKey)
			if (!virtualElementMap) return

			const virtualElementInfo = virtualElementMap.get(elementKey)
			if (!virtualElementInfo) return

			const scrollIntoView =
				virtualElementInfo.element.scrollIntoView || virtualElementInfo.virtualElement.scrollIntoView
			scrollIntoView({ behavior: 'instant' })
		},
		[stackKey, virtualElementMaps]
	)

	return (
		<VirtualizerContext.Provider
			value={{
				virtualElements: virtualElementMaps.get(stackKey) ?? new Map(),
				mergeVirtualElementsAtKey,
				scrollToElement,
			}}
		>
			{children}
		</VirtualizerContext.Provider>
	)
}
