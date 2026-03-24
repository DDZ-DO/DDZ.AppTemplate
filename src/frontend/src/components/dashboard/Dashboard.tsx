import { MessageSquare } from 'lucide-react'

export function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-1 mb-6">Willkommen bei DDZ __AppName__</p>

      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Das Dashboard wird hier aufgebaut.</p>
      </div>
    </div>
  )
}
