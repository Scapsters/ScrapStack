import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"

export function TopBar({ centerText }: { centerText?: string }) {
    return (
        <div className="bg-cyan border-b-10 border-b-cyan-light h-20 text-light">
            <div className="flex justify-between items-center px-5 sm:px-10 h-full">
                <>
                    <Link className="text-lg sm:text-2xl hover:underline cursor-pointer" to="/">
                        Scrapstack
                    </Link>
                    <p>{centerText}</p>
                    <Link className="text-md sm:text-xl hover:underline cursor-pointer" to="/stacks">
                        Search Stacks
                    </Link>
                </>
            </div>
        </div>
    )
}

export function ScrollAwareTopBar({ centerText }: { centerText?: string }) {
    const bar = useRef<HTMLDivElement | null>(null)
    const [yOffset, setYOffset] = useState(0)

    const lastScroll = useRef(0)
    const currentScroll = useRef(0)
    useEffect(() => {
        if (typeof window == 'undefined') return
        const handleScroll = () => {
            if (!bar.current) return

            lastScroll.current = currentScroll.current
            currentScroll.current = window.scrollY

            const deltaScroll = currentScroll.current - lastScroll.current
                setYOffset(prevOffset => 
                    Math.max(-160,
                        Math.min(0, 
                            prevOffset - deltaScroll
                )))
        }
        window.document.addEventListener("scroll", handleScroll)
        return () => window.document.removeEventListener("scroll", handleScroll)
    })
    return (
        <div className="fixed w-full z-10" style={{ top: yOffset + "px" }} ref={bar}>
            <TopBar centerText={centerText} />
        </div>
    )
}