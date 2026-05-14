import { useMemo } from "react"
import type { RegisterElement } from "./contexts"

export function useRegistrators(...registrators: RegisterElement[]) {
	// While to fix the issue, you could wrap the dependency (an array literal) in another array literal, 
	// this would then mean that instead of evaluating each element of the array literal (output of useRegistrator), 
	// which is stable, it would evaluate the array literal they form, which is technically unstable.
	// This could be fixed by memoizing the input array, but the point of this function is to not require that

	// eslint-disable-next-line react-hooks/exhaustive-deps
	return useMemo(() => mergeRefs(...registrators), registrators)
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
	return (value: T | null) => {
		for (const ref of refs) {
			if (!ref) continue
			if (typeof ref === 'function') ref(value)
			else ref.current = value
		}
	}
}
