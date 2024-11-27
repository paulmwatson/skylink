import './App.css'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


function App() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <Card>
        <CardHeader>
          <CardTitle>Skylink</CardTitle>
          <CardDescription>An inverted social network viewer for Bluesky: putting links first.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default App
