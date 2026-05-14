import { useState, useRef } from 'react'
import { useRegistration } from './contexts'

// https://dev.to/bcncodeschool/detecting-if-an-element-is-in-view-with-react-5b60
export function useIsVisible(loose?: boolean) {
	const [isVisible, setIsVisible] = useState(false)
	const observerRef = useRef<IntersectionObserver | null>(null)

	const [registerElement] = useRegistration(element => {
		const observer = createVisibilityObserver(([entry]) => {
			if (entry.isIntersecting !== isVisible) setIsVisible(entry.isIntersecting)
		}, loose)

		observer.observe(element)
		observerRef.current = observer
		return () => {
			observer.disconnect()
			observerRef.current = null
		}
	})

	const removeListener = () => {
		observerRef.current?.disconnect()
		observerRef.current = null
	}

	return [isVisible, registerElement, removeListener] as const
}

export function createVisibilityObserver(callback: IntersectionObserverCallback, loose?: boolean) {
	return new IntersectionObserver(callback, {
		root: null, // viewport
		rootMargin: loose ? '200px 0px' : '-50% 0px -50% 0px', // loose includes anywhere on screen + space above top and bottm, while not strict leaves only a horizontal strip at mid-screen
		threshold: 0, // trigger as soon as it touches that strip
	})
}
