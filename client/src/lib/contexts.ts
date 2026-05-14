import { useCallback, useContext, useRef } from 'react'

export function createUseContext<T>(Ctx: React.Context<T>) {
	return () => {
		const ctx = useContext(Ctx)
		if (!ctx) throw new Error(`Context ${Ctx} is undefined`)
		return ctx
	}
}

export type RegisterElement = (element: HTMLElement | null) => void

export function useRegistration(onRegister: (element: HTMLElement) => (() => void) | null | void) {
	const onRegisterRef = useRef(onRegister)
    onRegisterRef.current = onRegister

    const copyRef = useRef<HTMLElement>(null)
    const cleanupRef = useRef<(() => void) | null | void>(null)
	const registerElement = useCallback((element: HTMLElement | null) => {
		cleanupRef.current?.()
        cleanupRef.current = null
        
        copyRef.current = element
		
        if (!element) return

		cleanupRef.current = onRegisterRef.current(element)
	}, [])

	return [registerElement, copyRef] as const
}
