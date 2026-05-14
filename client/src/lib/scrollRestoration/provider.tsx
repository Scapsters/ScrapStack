import { useCallback, useRef, type ReactNode } from 'react'
import { ScrollRestorationContext, type ScrollRestorationStore } from './contexts'
import { useStackKey } from '../keys/contexts'
import { createVisibilityObserver } from '../useIsVisible'

export function ScrollRestorationProvider(props: { children: ReactNode }) {
	const { stackKey } = useStackKey()

	const scrolls = useRef<Map<string, ScrollRestorationStore>>(new Map())

	const cleanupRef = useRef<() => void>(null)
	const registerElementAtKey = useCallback((element: HTMLElement | null, elementKey: string) => {
		cleanupRef.current?.()
		cleanupRef.current = null

		if (!element) return

		const observer = createVisibilityObserver(([entry]) => {
			if (entry.isIntersecting)
				scrolls.current.set(stackKey, { elementKey, offset: entry.boundingClientRect.top, registerElementAtKey  })
		})

		observer.observe(element)
		cleanupRef.current = () => observer.disconnect()
	}, [stackKey])

	return (
		<ScrollRestorationContext.Provider
			value={{ ...(scrolls.current.get(stackKey) ?? { elementKey: '', offset: 0 }), registerElementAtKey }}
		>
			{props.children}
		</ScrollRestorationContext.Provider>
	)
}
