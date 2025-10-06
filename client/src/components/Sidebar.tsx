import { useEffect, useRef, type ReactNode, type SetStateAction } from "react"
import { GoChevronLeft, GoGear } from "react-icons/go"

export function SideBar({ isOpen, setIsOpen, children }: { isOpen: boolean, setIsOpen: React.Dispatch<SetStateAction<boolean>>, children: ReactNode }) {
    const bodyRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = bodyRef.current
        if (!el) return

        const handleTouchMove = (e: TouchEvent) => {
            const canScroll = el.scrollHeight > el.clientHeight
            if (!canScroll) e.preventDefault()
        }

        el.addEventListener("touchmove", handleTouchMove, { passive: false })
        return () => el.removeEventListener("touchmove", handleTouchMove)
    }, [])

    return (
        <div
            className={`
                flex flex-col-reverse items-end fixed -top-10 sm:top-10 z-10 transition-all duration-100
                ${isOpen
                    ? "left-0"
                    : "-left-1/1 sm:-left-120"}    
            `}
        >
            <div
                className="w-screen sm:overflow-clip sm:w-120 bg-white border-2 border-cyan-dark border-l-0 sm:rounded-r-lg z-1 h-[calc(100dvh-80px)] overflow-y-auto sm:h-auto sm:max-h-[80dvh] overscroll-contain"
                ref={bodyRef}
            >
                {children}
            </div>
            <div className="relative right-0 z-12 left-15 top-25 h-min w-min">
                <div className="relative bg-white border-2 border-cyan-dark border-l-0 rounded-r-lg sm:right-[2px]">
                    <button
                        className="p-2 rounded-r-lg"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <GoGear
                            size="42"
                            className={`
                                p-1 rounded-full transition-transform duration-300 ease-out 
                                ${isOpen ? "text-dark rotate-360" : "text-cyan-dark rotate-0"} 
                                hover:text-cyan-dark hover:bg-black/10
                            `}
                        />
                    </button>
                </div>
            </div>
            <div className="relative z-12 top-30 w-min sm:invisible visible">
                <button
                    className="rounded-full p-2"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <GoChevronLeft
                        size="42"
                        className={`
                            p-1 rounded-full transition-transform duration-300 ease-out 
                            ${isOpen ? "text-dark rotate-360" : "text-cyan-dark rotate-0"} 
                            hover:text-cyan-dark hover:bg-black/10
                        `}
                    />
                </button>
            </div>
        </div>
    )
}
