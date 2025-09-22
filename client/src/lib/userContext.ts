import { createContext } from "react"

export const userContext = createContext<{
    userToken: string | null
    adminSecret: string | null
}>({
    userToken: null,
    adminSecret: null
})