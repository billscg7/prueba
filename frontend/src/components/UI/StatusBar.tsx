import React from 'react';
import { Point } from '@/types/geometry';
import { ToolType } from '@/store/toolsStore';
import { formatNumber } from '@/utils/helpers';
import { useViewportStore } from '@/store/viewportStore';
import './StatusBar.scss';

interface StatusBarProps {
    /** Posición del cursor después de aplicar snap a la cuadrícula */
    cursorPosition: Point;
    /** Posición real del mouse sin snap */
    mousePosition: Point;
    /** Herramienta activa */
    activeTool: ToolType;
    /** Modo ortogonal activado */
    isOrthoMode: boolean;
    /** Snap a la cuadrícula activado */
    isSnapEnabled: boolean;
}

/**
 * Barra de estado que muestra información útil al usuario
 * Se posiciona en la parte inferior de la pantalla
 */
const StatusBar: React.FC<StatusBarProps> = ({
    cursorPosition,
    mousePosition,
    activeTool,
    isOrthoMode,
    isSnapEnabled,
}) => {
    const { viewport } = useViewportStore();

    // Formatear coordenadas para mostrar
    const formatCoord = (value: number) => formatNumber(value, 2);

    // Obtener nombre descriptivo de la herramienta
    const getToolName = (tool: ToolType): string => {
        switch (tool) {
            case 'select': return 'Selección';
            case 'pan': return 'Mover vista';
            case 'line': return 'Línea';
            case 'polyline': return 'Polilínea';
            case 'rectangle': return 'Rectángulo';
            case 'circle': return 'Círculo';
            case 'arc': return 'Arco';
            case 'text': return 'Texto';
            default: return tool;
        }
    };

    return (
        <div className="status-bar">
            {/* Coordenadas del cursor */}
            <div className="status-item coordinates">
                <span className="label">Posición:</span>
                <span className="value">
                    X: {formatCoord(cursorPosition.x)}, Y: {formatCoord(cursorPosition.y)}
                </span>
            </div>

            {/* Herramienta activa */}
            <div className="status-item tool">
                <span className="label">Herramienta:</span>
                <span className="value">
                    {getToolName(activeTool)}
                </span>
            </div>

            {/* Zoom actual */}
            <div className="status-item zoom">
                <span className="label">Zoom:</span>
                <span className="value">
                    {formatNumber(viewport.scale * 100, 0)}%
                </span>
            </div>

            {/* Indicadores de modo */}
            <div className="status-item modes">
                <span className={`indicator ${isOrthoMode ? 'active' : ''}`} title="Modo ortogonal">
                    ORTO
                </span>
                <span className={`indicator ${isSnapEnabled ? 'active' : ''}`} title="Snap a la cuadrícula">
                    SNAP
                </span>
            </div>

            {/* Rotación actual */}
            <div className="status-item rotation">
                <span className="label">Rotación:</span>
                <span className="value">
                    {formatNumber(viewport.rotation * (180 / Math.PI), 1)}°
                </span>
            </div>
        </div>
    );
};

export default StatusBar;