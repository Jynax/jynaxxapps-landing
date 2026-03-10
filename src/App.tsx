import { ThemeProvider } from './context/ThemeContext'
import { ThemePicker } from './components/ThemePicker'
import { Hero } from './components/Hero'
import { ProjectShowcase } from './components/ProjectShowcase'
import { About } from './components/About'
import { Footer } from './components/Footer'
import './styles/theme.css'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <header className="app-header">
          <ThemePicker />
        </header>
        <main>
          <Hero />
          <ProjectShowcase />
          <About />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default App
