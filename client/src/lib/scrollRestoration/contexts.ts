import { createUseContext, type RegisterElement } from '../contexts'
import { createContext } from 'react'

export type ScrollRestorationStore = {
	elementKey: string
	offset: number,
	registerElementAtKey: (element: HTMLElement | null, elementKey: string) => void
}
export const ScrollRestorationContext = createContext<ScrollRestorationStore | null>(null)
export const useScrollRestoration = createUseContext(ScrollRestorationContext)

export type ScrollRestorationItemStore = {
	registerElement: RegisterElement
}
export const ScrollRestorationItemContext = createContext<ScrollRestorationItemStore | null>(null)
export const useScrollRestorationItem = createUseContext(ScrollRestorationItemContext)
