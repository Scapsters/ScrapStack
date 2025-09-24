import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react"
import { TRPCClientError } from "@trpc/client"
import { useCallback, useRef, useState, type ReactNode } from "react"
import { GoCheck, GoCopy, GoX } from "react-icons/go"

export function ConfirmActionButton({ onClick, successMessage, failureMessage, requireConfirmation, children, ...props }: {
    onClick: () => Promise<[boolean, string?]>,
    successMessage?: string,
    failureMessage?: string,
    requireConfirmation?: boolean,
    children: ReactNode,
} & React.HtmlHTMLAttributes<HTMLElement>
) {
    const [status, setStatus] = useState<string | ReactNode>("Not Started...")
    const isTakingAction = useRef(false)
    const closingTimeout = useRef<NodeJS.Timeout | null>(null)

    const takeAction = useCallback(
        async function takeAction(close: () => void) {
            isTakingAction.current = true
            void new Promise<boolean>(resolve => {
                if (requireConfirmation)
                    setStatus(
                        <div className="flex flex-col items-center">
                            <p>Are you sure?</p>
                            <div className="flex">
                                <button className="button" onClick={() => resolve(true)}><GoCheck size={28}></GoCheck></button>
                                <button className="button" onClick={() => resolve(false)}><GoX size={28}></GoX></button>
                            </div>
                        </div>
                    )
                else resolve(true)
            }).then((doContinue) => {
                const closeLater = () => {
                    closingTimeout.current = setTimeout(() => {
                        isTakingAction.current = false
                        close()
                    }, 800)
                }
                if (!doContinue) {
                    setStatus("Action cancelled.")
                    closeLater()
                } else {
                    setStatus("Loading...")
                    onClick().then(ok => {
                        setStatus(ok ? successMessage || "Success!" : failureMessage || "Failure.")
                        closeLater()
                    }).catch(err => {
                        if (err instanceof TRPCClientError) setStatus(err.message)
                        else setStatus(err)
                    })
                }
            })
        }, [failureMessage, onClick, requireConfirmation, successMessage])

    return (
        <Popover
            className={props.className ?? ""}
        >
            {({ open }) => {
                return <>
                    <PopoverButton
                        className={"button data-active:bg-cyan-light!"}
                        onClick={() => {
                            isTakingAction.current = false
                            if (closingTimeout.current) {
                                clearTimeout(closingTimeout.current)
                            }
                        }}
                    >
                        {children}
                    </PopoverButton>
                    <PopoverPanel transition anchor="top">
                        {({ close }) => {
                            if (open && !isTakingAction.current) takeAction(close)
                            return (
                                <div className="flex flex-col items-center mb-1">
                                    <div className="p-2 px-6 w-max bg-white rounded-md border-2 border-cyan-dark z-14">{status}</div>
                                    <div className="relative z-14">
                                        <div className="top-1 w-0 h-0 z-12
                                            border-l-10 border-l-transparent
                                            border-t-10 border-t-transparent
                                            border-r-10 border-r-transparent">
                                        </div>
                                        <div className="absolute -left-[2px] -top-[1px] w-0 h-0 z-12
                                            border-l-12 border-l-transparent
                                            border-t-12 border-t-cyan-dark
                                            border-r-12 border-r-transparent">
                                        </div>
                                        <div className="absolute -top-0.5 w-0 h-0 z-12
                                            border-l-10 border-l-transparent
                                            border-t-10 border-t-white
                                            border-r-10 border-r-transparent">
                                        </div>
                                    </div>
                                </div>
                            )
                        }}
                    </PopoverPanel>
                </>
            }}
        </Popover>
    )
}

export function CopyButton({ size, textToCopy, ...props }: { size: number, textToCopy: string } & React.HtmlHTMLAttributes<HTMLElement>) {
    return (
        <ConfirmActionButton
            {...props}
            successMessage='Copied!'
            failureMessage='Unable to copy. Check browser permissions.'
            onClick={async () => {
                await navigator.clipboard.writeText(textToCopy)
                return [true] satisfies [boolean]
            }}
        ><GoCopy size={size} className="text-black active:stroke-black" />
        </ConfirmActionButton>
    )
}