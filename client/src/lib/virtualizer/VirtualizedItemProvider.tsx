import { type ReactNode } from 'react'
import { useVirtualizer, VirtualizedItemContext } from './contexts'
import type { VirtualElementInfo } from './provider'
import { useIsVisible } from '../useIsVisible'
import { useBatchKey } from '../keys/contexts'
import { useRegistration, type RegisterElement } from '../contexts'
import { useRegistrators } from '../refs'

export function VirtualizedItemProvider({ children }: { children: ReactNode }) {
	const { virtualElements, mergeVirtualElementsAtKey } = useVirtualizer()
	const { batchKey: virtualizationKey } = useBatchKey()

	const [registerVirtualizerElement, elementRef] = useRegistration(element => {
		const updateSize = () => {
			// const previousSize = virtualElements.get(virtualizationKey)?.size
			// const currentSize = element.getBoundingClientRect()
			// const didChange = previousSize?.height !== currentSize.height || previousSize?.width !== currentSize.width
			// if (didChange)
			mergeVirtualElementsAtKey(virtualizationKey, element, { size: element.getBoundingClientRect() })
		}

		const observer = new ResizeObserver(updateSize)
		observer.observe(element)
		return () => observer.disconnect()
	})

	const markAsStable = () => {
		const element = elementRef.current
		if (element) mergeVirtualElementsAtKey(virtualizationKey, element, { isStable: true })
	}

	const [registerVirutalVirtualizerElement] = useRegistration(element =>
		mergeVirtualElementsAtKey(virtualizationKey, element, { virtualElement: element })
	)

	const [isElementVisible, registerVisibilityElement] = useIsVisible(true)
	const [isVirtualElementVisible, registerVirtualVisibilityElement] = useIsVisible(true)

	const registerElement = useRegistrators(registerVirtualizerElement, registerVisibilityElement)
	const registerVirtualElement = useRegistrators(registerVirutalVirtualizerElement, registerVirtualVisibilityElement) 

	return (
		<VirtualizedItemContext.Provider
			value={{
				markAsStable,
				registerElement,
			}}
		>
			{virtualElements.get(virtualizationKey)?.isStable && !isElementVisible && !isVirtualElementVisible ? (
				<Virtualized
					virtualElementInfo={virtualElements.get(virtualizationKey)}
					registerElement={registerVirtualElement}
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
