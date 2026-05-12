import type { ReactNode } from 'react'
import { StackKeyContext } from './contexts'

export function StackKeyProvider({ stackKey, children }: { stackKey: string; children: ReactNode }) {
	return (
		<StackKeyContext.Provider
			value={{
				stackKey,
			}}
		>
			{children}
		</StackKeyContext.Provider>
	)
}
