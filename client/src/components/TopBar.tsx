import { useEffect, useRef, useState } from "react"
import { GoSearch } from "react-icons/go"
import { Link } from "react-router-dom"

export function TopBar({ centerText, className }: { centerText?: string, className?: string }) {
    return (
        <div className={`bg-cyan border-b-10 border-b-cyan-light h-20 text-light ${className}`}>
            <div className="flex justify-between items-center px-5 sm:px-10 gap-2 h-full">
                <>
                    <Link className="text-lg sm:text-2xl button text-left hover:underline cursor-pointer" to="/">
                        <img src="/favicon.ico" className="size-8"></img>
                    </Link>
                    <Link className="hidden md:block text-lg sm:text-2xl text-left hover:underline cursor-pointer" to="/">
                        Scrapstack
                    </Link>
                    <p className="text-left md:text-center grow">{centerText}</p>
                    <Link className="text-md button gap-2 text-right sm:text-xl hover:underline cursor-pointer flex" to="/stacks">
                        <div className="flex gap-2 items-center">
                            <GoSearch size={24}/>
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