import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './components/home/HomePage'
import { RadicacionPage } from './pages/RadicacionPage'
import { SeguimientoPage } from './pages/SeguimientoPage'
import { AdminPage } from './pages/AdminPage'
import { HeatmapPage } from './pages/HeatmapPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/radicar" element={<RadicacionPage />} />
        <Route path="/seguimiento" element={<SeguimientoPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/requests" element={<AdminPage />} />
        <Route path="/admin/heatmap" element={<HeatmapPage />} />
        <Route path="/admin/settings" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
