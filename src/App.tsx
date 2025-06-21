import { Button } from '@/components/ui/button'

function App() {
  console.log('Button component:', Button);
  
  return (
    <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Button Test</h1>
        <Button>Click me</Button>
        <Button variant="secondary" className="ml-2">Secondary</Button>
        <Button variant="destructive" className="ml-2">Destructive</Button>
        
        {/* Fallback button to test if basic rendering works */}
        <div className="mt-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Fallback Button
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
