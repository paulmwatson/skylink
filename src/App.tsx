import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from './home';
import TopPage from './top';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/top" element={<TopPage />} />
      </Routes>
      <footer className="border-t-2 pt-4 mt-2 text-right text-xs">
        <a href="https://github.com/paulmwatson/skylink">
          github.com/paulmwatson/skylink
        </a>
      </footer>
    </BrowserRouter>
  )
}

export default App
