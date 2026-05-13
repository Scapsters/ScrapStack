import { type ReactNode } from 'react'
import { useVirtualizer, VirtualizedItemContext } from './contexts'
import type { VirtualElementInfo } from './provider'
import { useIsVisible } from '../useIsVisible'
import { useBatchKey } from '../keys/contexts'
import { useRegistration, type RegisterElement } from '../contexts'

export function VirtualizedItemProvider({ children }: { children: ReactNode }) {
	const { virtualElements, mergeVirtualElementsAtKey } = useVirtualizer()
	const { batchKey: virtualizationKey } = useBatchKey()

	const [registerElement, elementRef] = useRegistration(element => {
		const updateSize = () => {
			const didChange = virtualElements.get(virtualizationKey)?.size === element.getBoundingClientRect()
			if (didChange) mergeVirtualElementsAtKey(virtualizationKey, element, { size: element.getBoundingClientRect() })
		}

		const observer = new ResizeObserver(updateSize)
		observer.observe(element)
		return () => observer.disconnect()
	})

	const markAsStable = () => {
		const element = elementRef.current
		if (element) mergeVirtualElementsAtKey(virtualizationKey, element, { isStable: true })
	}

	const [registerVirutalElement, virtualRef] = useRegistration(element =>
		mergeVirtualElementsAtKey(virtualizationKey, element, { virtualElement: element })
	)

	const [isElementVisible] = useIsVisible(elementRef, true)
	const [isVirtualElementVisible] = useIsVisible(virtualRef, true)
	console.log(isVirtualElementVisible, virtualRef.current)

	return (
		<VirtualizedItemContext.Provider value={{ markAsStable, registerElement }}>
			{virtualElements.get(virtualizationKey)?.isStable && !isElementVisible && !isVirtualElementVisible ? (
				<Virtualized
					virtualElementInfo={virtualElements.get(virtualizationKey)}
					registerElement={registerVirutalElement}
				/>
			) : (
				children
			)}
		</VirtualizedItemContext.Provider>
	)
}

function Virtualized({
	virtualElementInfo,
	registerElement,
}: {
	virtualElementInfo?: VirtualElementInfo
	registerElement: RegisterElement
}) {
	if (!virtualElementInfo) throw new Error(`Could not find virtual element info for an element.`)
	return (
		<div
			ref={registerElement}
			style={{ height: virtualElementInfo.size.height, width: virtualElementInfo.size.width }}
		></div>
	)
}
