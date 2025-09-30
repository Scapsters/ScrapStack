import { GoSync } from "react-icons/go"

export default function Loader() {
    return (
        <div className="h-80 flex flex-col items-center gap-6">
            Scrap Data Loading...
            <GoSync size={40} className='-scale-y-100 animate-[spin_1s_linear_infinite_reverse]' />
        </div>
    )
}