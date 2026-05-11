import { createContext, type SetStateAction } from "react"

export const playerContext = createContext<{ 
    isMuted?: boolean
    setIsMuted?: React.Dispatch<SetStateAction<boolean>>
}>({})