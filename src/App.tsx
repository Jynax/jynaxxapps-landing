import { ThemeProvider } from './context/ThemeContext'
import { ThemePicker } from './components/ThemePicker'
import { Hero } from './components/Hero'
import { ProjectShowcase } from './components/ProjectShowcase'
import { About } from './components/About'
import { Footer } from './components/Footer'
import { Admin } from './pages/Admin'
import { useContent } from './hooks/useContent'
import { useHashRoute } from './hooks/useHashRoute'
import './styles/theme.css'
import './styles/admin.css'
import './App.css'

function Site() {
  const { content } = useContent()

  return (
    <div className="app">
      <header className="app-header">
        <ThemePicker />
      </header>
      <main>
        <Hero hero={content.hero} />
        <ProjectShowcase projects={content.projects} />
        <About about={content.about} />
      </main>
      <Footer footer={content.footer} />
    </div>
  )
}

function App() {
  const route = useHashRoute()
  const isAdmin = route === '#/admin'

  return (
    <ThemeProvider>
      {isAdmin ? <Admin /> : <Site />}
    </ThemeProvider>
  )
}

export default App
