import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { DashboardSnippets } from '@/components/DashboardSnippets'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-8">
        {/* Header with theme toggle */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Theme Test</h1>
          <ThemeToggle />
        </div>

        {/* Content area */}
        <div className="grid gap-6">
          {/* Button showcase */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Buttons</h2>
            <div className="flex gap-2 flex-wrap">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="accent" size="lg">Accent</Button>
              <Button variant="warning" size="lg">Warning</Button>
              <Button variant="success" size="lg">Success</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          <DashboardSnippets />

          {/* Card showcase */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Card Title</h3>
                <p className="text-muted-foreground">
                  This is a card with custom theme colors. It should adapt to light and dark modes.
                </p>
              </div>
              <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Another Card</h3>
                <p className="text-muted-foreground">
                  Notice how the background, text, and border colors change with the theme.
                </p>
              </div>
            </div>
          </div>

          {/* Color showcase */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Color Palette</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-primary text-primary-foreground">
                Primary
              </div>
              <div className="p-4 rounded-lg bg-secondary text-secondary-foreground">
                Secondary
              </div>
              <div className="p-4 rounded-lg bg-muted text-muted-foreground">
                Muted
              </div>
              <div className="p-4 rounded-lg bg-accent text-accent-foreground">
                Accent
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
