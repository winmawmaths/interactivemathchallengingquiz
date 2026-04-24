import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Lobby } from './pages/Lobby'
import { Play } from './pages/Play'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/play/:level" element={<Play />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
