import { StrictMode } from 'react'
import './index.css'
import App from './App.tsx'
import { ViteReactSSG, type RouteRecord } from 'vite-react-ssg'
import { Tweets } from './Tweets.tsx'

const routes: RouteRecord[] = [
  {
    path: '/',
    element: <StrictMode><App /></StrictMode>,
    children: [
      {
        path: '/scappy11',
        element: <Tweets user="scappy11" />
      }, {
        path: '/jungchoi01',
        element: <Tweets user="jungchoi01" />
      }
    ],
  },
]

export const createRoot = ViteReactSSG({ routes })