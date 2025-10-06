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

    const lastScroll = useRef(0)
    const scrollInCurrentDirection = useRef(0)
    useEffect(() => {
        if (typeof window == 'undefined') return
        let ticking = false
        
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const deltaScroll = window.scrollY - lastScroll.current

                    if (deltaScroll > 0 && scrollInCurrentDirection.current > 100) bar.current!.style.top = '-160px'
                    else bar.current!.style.top = '0px'
                    
                    // If signs match, add. If they dont, reset
                    scrollInCurrentDirection.current = scrollInCurrentDirection.current * deltaScroll > 0
                        ? scrollInCurrentDirection.current + deltaScroll
                        : deltaScroll

                    lastScroll.current = window.scrollY
                    ticking = false
                })
                ticking = true
            }
        }
        window.document.addEventListener("scroll", handleScroll)
        return () => window.document.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div className="fixed w-full z-10 transition-all duration-400 top-0" ref={bar}>
            <TopBar centerText={centerText} />
        </div>
    )
}