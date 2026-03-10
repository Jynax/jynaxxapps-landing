import { ThemeProvider } from './context/ThemeContext'
import { ThemePicker } from './components/ThemePicker'
import { Hero } from './components/Hero'
import { ProjectShowcase } from './components/ProjectShowcase'
import { About } from './components/About'
import { Footer } from './components/Footer'
import { useContent } from './hooks/useContent'
import './styles/theme.css'
import './App.css'

function AppContent() {
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
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
