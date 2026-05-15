import { Suspense, lazy } from 'react'
import './data/jxData' // registers window.__JX__ for e2e; redundant once a component imports jxData by name
import { useHashRoute } from './hooks/useHashRoute'
import { LiveShell } from './shell/LiveShell'

const Admin = lazy(() => import('./pages/Admin').then(m => ({ default: m.Admin })))

export default function App() {
  const route = useHashRoute()
  if (route === '#/admin') {
    return <Suspense fallback={null}><Admin /></Suspense>
  }
  return <LiveShell />
}
