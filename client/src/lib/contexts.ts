import { useContext } from "react"

export function createUseContext<T>(Ctx: React.Context<T>) {
    return () => {
        const ctx = useContext(Ctx)
        if (!ctx) throw new Error(`Context ${Ctx} is undefined`)
            return ctx
    }
}