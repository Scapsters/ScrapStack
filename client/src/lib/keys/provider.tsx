import type { ReactNode } from 'react'
import { BatchKeyContext, StackKeyContext } from './contexts'

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

export function BatchKeyProvider({ batchKey, children }: { batchKey: string; children: ReactNode }) {
	return (
		<BatchKeyContext.Provider
			value={{
				batchKey,
			}}
		>
			{children}
		</BatchKeyContext.Provider>
	)
}
