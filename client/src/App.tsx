import { useState } from 'react'
import { Switch } from '@headlessui/react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'

export const API_ROOT = 'https://v8tnlmgv35.execute-api.us-east-1.amazonaws.com/scapsters-scrapstack-api-gateway'

export const queryClient = new QueryClient()

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <HelloSwitch />
        </QueryClientProvider>
    )
}

function HelloSwitch() {
    const [switchEnabled, setSwitchEnabled] = useState(false)

    const { isPending, error, data } = useQuery({
        queryKey: ['hello-world-key'],
        queryFn: () => fetch(API_ROOT + '/hello-world').then((res) => res.json()),
    })

    if (isPending) return 'Loading...'

    if (error) return 'An error has occured: ' + error.message

    return (
        <>
            <h1 className="text-red-500">meow</h1>
            <Switch
                checked={switchEnabled}
                onChange={setSwitchEnabled}
                className={
					`${switchEnabled ? 'bg-emerald-400' : 'bg-gray-600'}
					relative inline-flex h-6 w-11 items-center rounded-full`
				}
            >
                <span className="sr-only">Enable notifications</span>
                <span
                    className={`${
                        switchEnabled ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
            </Switch>
            <p> {data.message} </p>
        </>
    )
}
