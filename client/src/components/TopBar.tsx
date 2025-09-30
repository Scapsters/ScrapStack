import { useEffect, useRef, useState } from "react"
import { GoSearch } from "react-icons/go"
import { Link } from "react-router-dom"

export function TopBar({ centerText, className }: { centerText?: string, className?: string }) {
    return (
        <div className={`bg-cyan border-b-10 border-b-cyan-light h-20 text-light ${className}`}>
            <div className="flex justify-between items-center px-5 sm:px-10 gap-2 h-full">
                <>
                    <Link className="flex button gap-2 text-lg sm:text-2xl text-left w-50 cursor-pointer" to="/">
                        <div>
                            <img src="/favicon.ico" className="size-8"></img>
                        </div>
                        <div className="hidden sm:block">
                            Scrapstack
                        </div>
                    </Link>
                    <p className="text-center grow">{centerText}</p>
                    <Link className="text-md gap-2 text-right sm:text-xl w-50 cursor-pointer flex flex-row-reverse" to="/stacks">
                        <div className="flex items-center gap-2 button">
                            <GoSearch size={24} />
                            <p>Stacks</p>
                        </div>
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