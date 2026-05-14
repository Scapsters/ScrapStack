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

	// Element
	const [isElementVisible, registerVisibilityElement] = useIsVisible(true)
	
	const [registerVirtualizerElement, elementRef] = useRegistration(element => {
		const updateSize = () =>
			mergeVirtualElementsAtKey(virtualizationKey, element, { size: element.getBoundingClientRect() })

		const observer = new ResizeObserver(updateSize)
		observer.observe(element)
		return () => observer.disconnect()
	})

	const markAsStable = () => {
		const element = elementRef.current
		if (element) mergeVirtualElementsAtKey(virtualizationKey, element, { isStable: true })
	}
	const registerElement = useRegistrators(registerVirtualizerElement, registerVisibilityElement)

	// Virtual Element
	const [isVirtualElementVisible, registerVirtualVisibilityElement, virtualVisibilityElement] = useIsVisible(true)
	const isVirtualElementActive = document.body.contains(virtualVisibilityElement.current)
	
	const [registerVirutalVirtualizerElement] = useRegistration(element =>
		mergeVirtualElementsAtKey(virtualizationKey, element, { virtualElement: element })
	)
	const registerVirtualElement = useRegistrators(registerVirutalVirtualizerElement, registerVirtualVisibilityElement)

	return (
		<VirtualizedItemContext.Provider
			value={{
				markAsStable,
				registerElement,
			}}
		>
			{virtualElements.get(virtualizationKey)?.isStable // Stable
				&& (!isElementVisible && !isVirtualElementVisible) // And neither are visible 
				&& isVirtualElementActive // And if the virtual element is visible, that it is also active
			? (
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
