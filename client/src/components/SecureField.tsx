import { Field, Input, Label } from "@headlessui/react"
import { CopyButton } from "./ConfirmActionButton"
import { useState, type SetStateAction } from "react"
import { GoEye, GoEyeClosed } from "react-icons/go"

export function SecureField({ name, placeholder, value, setValue }: { name: string, placeholder: string, value: string, setValue: React.Dispatch<SetStateAction<string>> }) {
    const [isRevealed, setIsRevealed] = useState(false)
    return (
        <Field className="flex md:justify-between items-center flex-wrap">
            <Label className="label h-min grow w-auto text-left"> {name} </Label>
            <CopyButton size={28} className="shrink" textToCopy={value} />
            <button className="button" onClick={() => setIsRevealed(!isRevealed)}> {isRevealed ? <GoEye size={28} /> : <GoEyeClosed size={28} />} </button>
            <Input placeholder={placeholder} type={isRevealed ? "text" : "password"} value={value} onChange={(e) => setValue(e.target.value)} className="m-1 px-3 py-1.5 input" />
        </Field>
    )
}