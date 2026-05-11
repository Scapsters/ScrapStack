import './index.css'
import App from './App.tsx'
import { ClientOnly, ViteReactSSG, type RouteRecord } from 'vite-react-ssg'
import { StackManager } from './Stack.tsx'
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
				element: typeof window !== "undefined" && window.location.hostname == "furryslop.com"
					? <StackSearch />
					: <><TopBar /><LandingPage /></>
			},
			{
				path: 'stacks',
				element: <StackSearch />
			},
			{
				path: 'stacks/:u',
				element: <ClientOnly>{() => <StackManager />}</ClientOnly>,
				getStaticPaths: () => ['Scappy11', "AguaralX"].map(user => `/stacks/${user}`)
			}
		]
	},
]

export const createRoot = ViteReactSSG({ routes })

// import './index.css'
// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import {
// 	createBrowserRouter,
// 	RouterProvider,
// } from 'react-router-dom'

// import App from './App.tsx'
// import { StackManager } from './Stack.tsx'
// import StackSearch from './StackSearch.tsx'
// import { LandingPage } from './LandingPage.tsx'
// import { TopBar } from './components/TopBar.tsx'

// if (typeof document !== 'undefined') {
// 	const router = createBrowserRouter([
// 	{
// 		path: '/',
// 		element: (
// 			<StrictMode>
// 				<App />
// 			</StrictMode>
// 		),
// 		children: [
// 			{
// 				index: true,
// 				element:
// 					window.location.hostname === 'furryslop.com'
// 						? <StackSearch />
// 						: (
// 							<>
// 								<TopBar />
// 								<LandingPage />
// 							</>
// 						),
// 			},
// 			{
// 				path: 'stacks',
// 				element: <StackSearch />,
// 			},
// 			{
// 				path: 'stacks/:u',
// 				element: <StackManager />,
// 			},
// 		],
// 	},
// ])

// 	createRoot(document.getElementById('root')!).render(
// 		<RouterProvider router={router} />
// 	)
// }