import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Page() {
  return (
    <div className="h-screen flex items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>Skylink</CardTitle>
          <CardDescription>An inverted social network viewer for Bluesky: putting links first.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}