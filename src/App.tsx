import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";

import TopPage from './top';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/top" element={<TopPage />} />
      </Routes>
      <footer className="p-5 text-right text-xs">
        <a href="https://github.com/paulmwatson/skylink" target="_blank">
          github.com/paulmwatson/skylink
        </a>
      </footer>
    </BrowserRouter>
  )
}

export default App
