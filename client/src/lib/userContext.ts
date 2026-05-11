import { createContext, useContext, type Dispatch, type SetStateAction } from 'react'

export const userContext = createContext<{
	userToken?: string
	setUserToken: Dispatch<SetStateAction<string>>
	adminSecret?: string
	setAdminSecret: Dispatch<SetStateAction<string>>
} | null>(null)

export function useUserContext() {
	const ctx = useContext(userContext)
	if (!ctx) throw new Error('User context is undefined.')
	return ctx
}
