import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './theme'
import { Layout } from './components'
import { Dashboard } from './pages/Dashboard'
import { Workflow } from './pages/Workflow'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="workflow/:id" element={<Workflow />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
