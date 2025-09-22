import { createContext, type SetStateAction } from "react"

export const userContext = createContext<{
    userToken?: string
    setUserToken?: React.Dispatch<SetStateAction<string>>
    adminSecret?: string
    setAdminSecret?: React.Dispatch<SetStateAction<string>>
}>({})