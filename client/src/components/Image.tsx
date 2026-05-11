import { useEffect, useRef, useState } from "react"

export default function Image({ ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { onLoad?: () => void }) {
    const [fullscreen, setFullscreen] = useState(false)

    const imageRef = useRef<HTMLImageElement>(null)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const current = ref.current
        if (!current) return

        const blockScroll = (e: Event) => { 
            if (fullscreen) e.preventDefault()
        }

        current.addEventListener("wheel", blockScroll)
        return () => current.removeEventListener("wheel", blockScroll)
    }, [fullscreen])

    return (
        <div
            ref={ref}
            onClick={() => setFullscreen(!fullscreen)}
        >
            <div className={fullscreen
                ? `z-40 fixed top-0 left-0 w-screen h-[300dvh] bg-black/20`
                : `hidden`
            }>
            </div>
            <img
                ref={imageRef}
                {...props}
                className={`${fullscreen
                    ? "z-50 fixed max-h-screen max-w-screen top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2"
                    : "min-w-0 max-w-[90dvw] lg:max-w-[40dvw] max-h-full rounded-lg border border-black/10"
                    }`}
            />
        </div>)
}