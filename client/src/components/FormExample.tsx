import { useForm } from "react-hook-form"
import { Button, Description, Field, Input, Label } from '@headlessui/react';

function FormExample() {
    
    const { register } = useForm({})

    return (
        <>
            <form
                className="flex flex-col items-start gap-2 p-5"
            >
                <Field>
                    <Label className="font-medium text-white text-sm/6">Meow Name</Label>
                    <Description className="text-sm/6 text-white/50">mrrrp meeow</Description>
                    <Input
                        type="text"
                        {...register('name')}
                        className={`
                            mt-1 rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white
                            focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25
                        `}  
                    />
                </Field>
                <Field className="mt-2">
                    <Label className="font-medium text-white text-sm/6">Meow Value</Label>
                    <Description className="text-sm/6 text-white/50">Eigenmeownd coeffeicient of your Meow</Description>
                    <Input
                        type="number"
                        {...register('value', { valueAsNumber: true })}
                        className={`
                            mt-1 rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white
                            focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25
                        `}
                    />
                </Field>
                <Button
                    type="submit"
                    className={`
                        rounded-lg border-none bg-green-500/25 px-3 py-1.5 mt-6
                        data-focus:outline-2 data-focus:-outline-offset-2  data-focus:bg-green-500/45
                        hover:outline-2 hover:-outline-offset-2  hover:bg-green-500/45 hover:cursor-pointer
                        active:translate-y-0.5 active:bg-green-500/20
                    `}
                >
                    Create Meow
                </Button>
            </form>
        </>
    )
}
