import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { ScrollRestorationContext } from './contexts'
import { useStackKey } from '../stackKey/contexts'

export function ScrollRestorationProvider(props: { children: ReactNode }) {
	const { stackKey } = useStackKey()
	
	const scrolls = useRef<Map<string, number>>(new Map())
	const setScroll = useCallback((scrollY: number) => scrolls.current.set(stackKey, scrollY), [stackKey])

	useEffect(() => {
        window.scrollTo({ top: scrolls.current.get(stackKey) ?? 0 })

		const updateScroll = () => setScroll(window.scrollY)

		window.addEventListener('scroll', updateScroll)
		return () => window.removeEventListener('scroll', updateScroll)
	}, [stackKey, setScroll])

	return (
		<ScrollRestorationContext.Provider value={{ scroll: scrolls.current.get(stackKey) }}>
			{props.children}
		</ScrollRestorationContext.Provider>
	)
}
