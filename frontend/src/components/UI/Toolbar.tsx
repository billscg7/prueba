import React from 'react';
import { useToolsStore, ToolType } from '@/store/toolsStore';
import { useGridStore } from '@/store/gridStore';
import './Toolbar.scss';

/**
 * Componente de barra de herramientas
 */
const Toolbar: React.FC = () => {
    const { activeTool, setActiveTool, isOrthoMode, toggleOrthoMode } = useToolsStore();
    const { settings, toggleVisibility, toggleSnap, toggleAxes } = useGridStore();

    // Herramientas disponibles
    const tools: { id: ToolType; label: string; icon: string }[] = [
        { id: 'select', label: 'Seleccionar', icon: '🔍' },
        { id: 'pan', label: 'Mover Vista', icon: '✋' },
        { id: 'line', label: 'Línea', icon: '━' },
        { id: 'polyline', label: 'Polilínea', icon: '┌┐' },
        { id: 'rectangle', label: 'Rectángulo', icon: '□' },
        { id: 'circle', label: 'Círculo', icon: '○' },
        { id: 'arc', label: 'Arco', icon: '◠' },
        { id: 'text', label: 'Texto', icon: 'T' },
    ];

    const toggleGridVisibility = () => {
        console.log('Before toggle - Grid visible:', settings.visible);
        toggleVisibility();
        console.log('After toggle - Grid visible:', settings.visible);
    }


    return (
        <div className="toolbar">
            <div className="tools-group">
                <h3>Herramientas</h3>
                <div className="button-group">
                    {tools.map((tool) => (
                        <button
                            key={tool.id}
                            className={`tool-button ${activeTool === tool.id ? 'active' : ''}`}
                            onClick={() => setActiveTool(tool.id)}
                            title={tool.label}
                        >
                            <span className="icon">{tool.icon}</span>
                            <span className="label">{tool.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="tools-group">
                <h3>Vista</h3>
                <div className="button-group">
                    <button
                        className={`toggle-button ${settings.visible ? 'active' : ''}`}
                        onClick={() => toggleVisibility()}
                        title="Mostrar/Ocultar Cuadrícula"
                    >
                        <span className="icon">≡</span>
                        <span className="label">Cuadrícula</span>
                    </button>

                    <button
                        className={`toggle-button ${settings.snapToGrid ? 'active' : ''}`}
                        onClick={() => toggleSnap()}
                        title="Activar/Desactivar Snap a Cuadrícula"
                    >
                        <span className="icon">⌖</span>
                        <span className="label">Snap</span>
                    </button>

                    <button
                        className={`toggle-button ${settings.showAxes ? 'active' : ''}`}
                        onClick={() => toggleAxes()}
                        title="Mostrar/Ocultar Ejes"
                    >
                        <span className="icon">⊹</span>
                        <span className="label">Ejes</span>
                    </button>

                    <button
                        className={`toggle-button ${isOrthoMode ? 'active' : ''}`}
                        onClick={() => toggleOrthoMode()}
                        title="Activar/Desactivar Modo Ortogonal"
                    >
                        <span className="icon">⊥</span>
                        <span className="label">Orto</span>
                    </button>
                </div>
            </div>

            <div className="tools-group">
                <h3>Acciones</h3>
                <div className="button-group">
                    <button
                        className="action-button"
                        onClick={() => console.log('Guardar proyecto')}
                        title="Guardar Proyecto"
                    >
                        <span className="icon">💾</span>
                        <span className="label">Guardar</span>
                    </button>

                    <button
                        className="action-button"
                        onClick={() => console.log('Exportar')}
                        title="Exportar"
                    >
                        <span className="icon">⬇️</span>
                        <span className="label">Exportar</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Toolbar;