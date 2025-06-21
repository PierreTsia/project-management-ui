import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">
          Vite + React + Tailwind
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-center space-x-4 mb-6">
            <a href="https://vite.dev" target="_blank">
              <img src={viteLogo} className="h-16 w-16" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="h-16 w-16 animate-spin" alt="React logo" />
            </a>
          </div>
          
          <div className="text-center">
            <button 
              onClick={() => setCount((count) => count + 1)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
            >
              count is {count}
            </button>
            
            <p className="text-red-500 text-lg font-semibold">
              This text should be red if Tailwind is working!
            </p>
            
            <p className="text-gray-600 mt-4">
              Edit <code className="bg-gray-200 px-2 py-1 rounded">src/App.tsx</code> and save to test HMR
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
