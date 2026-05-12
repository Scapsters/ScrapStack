import { useRef, type ReactNode } from 'react'
import { useVirtualizer, VirtualizedItemContext } from './contexts'
import { useIsVisible } from '../tweetHooks'
import type { VirtualElementInfo } from './provider'

export function VirtualizedItemProvider({
	virtualizationKey,
	children,
}: {
	virtualizationKey: string
	children: ReactNode
}) {
	const { virtualElements, mergeVirtualElementsAtKey } = useVirtualizer()

	const batchRef = useRef<HTMLDivElement>(null)

	const markAsStable = () => {
		const batch = batchRef.current
		if (batch) mergeVirtualElementsAtKey(virtualizationKey, batch, { isStable: true })
	}

	const cleanupRef = useRef<() => void>(null)
	const registerElement = (element: HTMLElement | null) => {
		cleanupRef.current?.()
		cleanupRef.current = null

		if (!element) return

		const updateSize = () =>
			mergeVirtualElementsAtKey(virtualizationKey, element, { size: element.getBoundingClientRect() })

		const observer = new ResizeObserver(updateSize)
		observer.observe(element)
		cleanupRef.current = () => observer.disconnect()
	}

	const [isVisible] = useIsVisible(batchRef, true)

	return (
		<div
			ref={batchRef}
			className="flex flex-col gap-5"
		>
			<VirtualizedItemContext.Provider value={{ markAsStable, registerElement }}>
				{virtualElements.get(virtualizationKey)?.isStable && !isVisible ? (
					<Virtualized virtualElementInfo={virtualElements.get(virtualizationKey)} />
				) : (
					children
				)}
			</VirtualizedItemContext.Provider>
		</div>
	)
}

function Virtualized({ virtualElementInfo }: { virtualElementInfo?: VirtualElementInfo }) {
	if (!virtualElementInfo) throw new Error(`Could not find virtual element info for an element.`)
	return <div style={{ height: virtualElementInfo.size.height, width: virtualElementInfo.size.width }}></div>
}
