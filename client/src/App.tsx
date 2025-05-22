import { useAsync } from './hooks/asyncUtils'

export const API_ROOT = 'https://v8tnlmgv35.execute-api.us-east-1.amazonaws.com/scapsters-scrapstack-api-gateway'

function App() {
    const [helloData, isLoading] = useAsync<string>('/hello_world')
	if(isLoading) return <p>Loading</p>
	return (<>
		<h1 className="text-red-500">meow</h1>
		<p> {helloData} </p>
    </>)
}

export default App
