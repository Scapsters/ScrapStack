import { useCallback, type ReactNode } from "react"
import { useBatchKey } from "../keys/contexts"
import { ScrollRestorationItemContext, useScrollRestoration } from "./contexts"
import type { RegisterElement } from "../contexts"

export function ScrollRestorationItemProvider({ children }: { children: ReactNode }) {
    const { batchKey: scrollKey } = useBatchKey()
    const { registerElementAtKey } = useScrollRestoration()

    const registerElement: RegisterElement = useCallback(element => registerElementAtKey(element, scrollKey), [registerElementAtKey, scrollKey])

    return (
        <ScrollRestorationItemContext value={{ registerElement }}>
            {children}
        </ScrollRestorationItemContext>
    )
}