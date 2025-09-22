import { useEffect, useState, type ReactNode, type SetStateAction } from "react"
import { GoGear } from "react-icons/go"

export function SideBar({ isOpen, setIsOpen, children }: { isOpen: boolean, setIsOpen: React.Dispatch<SetStateAction<boolean>>, children: ReactNode }) {
    const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const offset = screenWidth < 640 ? -screenWidth : -480;
    
    return (
        <div 
            className="fixed top-15 sm:top-30 flex -left-100 z-10 transition-all duration-100" 
            style={{ left: isOpen ? 0 : offset + "px" }}
        >
            <div className="w-screen sm:w-120 bg-white border-2 border-cyan-dark border-r-white sm:border-r-cyan-dark border-l-0 sm:rounded-r-lg z-1 h-[80dvh] overflow-y-auto sm:h-auto sm:max-h-[80dvh] overscroll-contain">
                {children}
            </div>
            <div className="relative top-10 z-12">
                <div className="relative bg-white border-2 border-cyan-dark border-l-0 rounded-r-lg sm:right-[2px]">
                    <button
                        className="p-2 rounded-r-lg"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <GoGear 
                            size="42"
                            className={`
                                p-1 rounded-full transition-transform duration-300 ease-out 
                                ${isOpen ? "text-dark rotate-360": "text-cyan-dark rotate-0"} 
                                hover:text-cyan-dark hover:bg-black/10
                            `}
                        />
                    </button>
                </div>
            </div>
            <div className="relative z-12 -top-[58px] right-42 sm:invisible visible">
                <div className="relative bg-white border-2 border-cyan-dark border-b-0 rounded-t-lg right-[2px]">
                    <button
                        className="p-2 rounded-r-lg"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <GoGear 
                            size="42"
                            className={`
                                p-1 rounded-full transition-transform duration-300 ease-out 
                                ${isOpen ? "text-dark rotate-360": "text-cyan-dark rotate-0"} 
                                hover:text-cyan-dark hover:bg-black/10
                            `}
                        />
                    </button>
                </div>
            </div>
        </div>
    )
}
