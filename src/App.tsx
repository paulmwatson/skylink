import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from './home';

function App() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
