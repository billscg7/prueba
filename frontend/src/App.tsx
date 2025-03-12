import './App.scss'
import DrawingCanvas from './components/Canvas/DrawingCanvas'
import Toolbar from './components/UI/Toolbar'

function App() {
  return (
    <>
      <div className="app-container">
        <div className="app-header">
          <h1>CAD-NLP</h1>
          <div className="command-input">
            <input
              type="text"
              placeholder="Ingrese un comando (ejemplo: 'crear línea de 2m en posición 1,1')"
            />
          </div>
        </div>

        <div className="app-content">
          <Toolbar />
          <div className="canvas-container">
            <DrawingCanvas />
          </div>
        </div>
      </div>
    </>
  )
}

export default App
