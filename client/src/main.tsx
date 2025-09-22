import './index.css'
import App from './App.tsx'
import { ClientOnly, ViteReactSSG, type RouteRecord } from 'vite-react-ssg'
import { Stack } from './Stack.tsx'
import StackSearch from './StackSearch.tsx'
import { LandingPage } from './LandingPage.tsx'
import { TopBar } from './components/TopBar.tsx'
import { StrictMode } from 'react'

const routes: RouteRecord[] = [
	{
		path: '/',
		element: <StrictMode><App /></StrictMode>,
		children: [
			{
				index: true,
				element: <><TopBar /><LandingPage /></>
			},
			{
				path: 'stacks',
				element: <StackSearch />
			},
			{
				path: 'stacks/:u',
				element: <ClientOnly>{() => <Stack />}</ClientOnly>,
				getStaticPaths: () => ['Scappy11'].map(user => `/stacks/${user}`)
			}
		]
	},
]

export const createRoot = ViteReactSSG({ routes })
