import { useState } from 'react'
import './App.scss'
import DrawingCanvas from './components/Canvas/DrawingCanvas'
import Toolbar from './components/UI/Toolbar'
import { useElementsStore } from './store/elementsStore'
import { nlpService } from './services/api'

function App() {
  const [command, setCommand] = useState('');
  const [projectId, setProjectId] = useState(1); // Por ahora hardcodeado
  const { addElement } = useElementsStore();

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    try {
      const response = await nlpService.processCommand(command, projectId);

      if (response.recognized) {
        // Procesar la acción según el tipo
        switch (response.action) {
          case 'create_line':
            addElement({
              type: 'line',
              layerId: 'default',
              geometry: {
                start: response.params.start,
                end: response.params.end
              },
              style: {
                strokeColor: '#000000',
                strokeWidth: 1,
                lineType: 'solid',
                fillColor: 'none',
                fillOpacity: 0.5,
              },
            });
            break;
          case 'create_rectangle':
            addElement({
              type: 'rectangle',
              layerId: 'default',
              geometry: {
                topLeft: response.params.topLeft,
                width: response.params.width,
                height: response.params.height,
                rotation: 0
              },
              style: {
                strokeColor: '#000000',
                strokeWidth: 1,
                lineType: 'solid',
                fillColor: 'none',
                fillOpacity: 0.5,
              },
            });
            break;
          default:
            console.warn('Acción no implementada:', response.action);
        }
      } else {
        console.error('Error en el comando:', response.error);
        // Aquí podrías mostrar un mensaje al usuario
      }

      // Limpiar el comando
      setCommand('');
    } catch (error) {
      console.error('Error al procesar el comando:', error);
    }
  };

  return (
    <>
      <div className="app-container">
        <div className="app-header">
          <h1>CAD-NLP</h1>
          <form className="command-input" onSubmit={handleCommandSubmit}>
            <input
              type="text"
              placeholder="Ingrese un comando (ejemplo: 'crear línea de 1,1 a 3,3')"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
            />
          </form>
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