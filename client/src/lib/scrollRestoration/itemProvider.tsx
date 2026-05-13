import { type ReactNode } from "react"
import { useBatchKey } from "../keys/contexts"
import { ScrollRestorationItemContext, useScrollRestoration } from "./contexts"
import type { RegisterElement } from "../contexts"

export function ScrollRestorationItemProvider({ children }: { children: ReactNode }) {
    const { batchKey: scrollKey } = useBatchKey()
    const { registerElementAtKey } = useScrollRestoration()

    const registerElement: RegisterElement = element => registerElementAtKey(element, scrollKey)

    return (
        <ScrollRestorationItemContext value={{ registerElement }}>
            {children}
        </ScrollRestorationItemContext>
    )
}