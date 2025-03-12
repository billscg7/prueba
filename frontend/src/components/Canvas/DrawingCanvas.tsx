import React, { useRef, useEffect, useState } from 'react';
import { useViewportStore } from '@/store/viewportStore';
import { useGridStore } from '@/store/gridStore';
import { useToolsStore } from '@/store/toolsStore';
import { useElementsStore } from '@/store/elementsStore';
import { useGesture } from '@use-gesture/react';
import { Point } from '@/types/geometry';
import { throttle, applyOrthoConstraint } from '@/utils/helpers';
import GridRenderer from './GridRenderer';
import ElementsRenderer from './ElementsRenderer';
import StatusBar from '../UI/StatusBar';
import NorthIndicator from './NorthIndicator';
import './DrawingCanvas.scss';

const DrawingCanvas: React.FC = () => {
    // Referencias
    const canvasRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    // Estado local
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [mousePosition, setMousePosition] = useState<Point>({ x: 0, y: 0 });
    const [cursorPosition, setCursorPosition] = useState<Point>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    // Stores
    const { viewport, pan, zoom, setViewport, screenToWorld } = useViewportStore();
    const { settings: gridSettings, snapPoint } = useGridStore();
    const {
        activeTool, toolData, setToolState, updateToolData, isOrthoMode
    } = useToolsStore();
    const { addElement, selectElement, deselectAll } = useElementsStore();

    // Actualizar dimensiones del canvas cuando cambia el tamaño de la ventana
    useEffect(() => {
        const updateDimensions = () => {
            if (canvasRef.current) {
                const { width, height } = canvasRef.current.getBoundingClientRect();
                setDimensions({ width, height });
                setViewport({ width, height });
            }
        };

        updateDimensions();

        // Usar ResizeObserver para detectar cambios de tamaño del contenedor
        const resizeObserver = new ResizeObserver(throttle(updateDimensions, 100));

        if (canvasRef.current) {
            resizeObserver.observe(canvasRef.current);
        }

        // También escuchar eventos de cambio de tamaño de ventana
        window.addEventListener('resize', updateDimensions);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateDimensions);
        };
    }, [setViewport]);

    // Manejar movimiento del ratón
    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        // Posición del ratón en coordenadas de pantalla
        const screenPoint: Point = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };

        // Convertir a coordenadas del mundo
        const worldPoint = screenToWorld(screenPoint);

        // Aplicar snap a la cuadrícula si está activado
        const snappedPoint = gridSettings.snapToGrid
            ? snapPoint(worldPoint.x, worldPoint.y)
            : worldPoint;

        // Actualizar estados
        setMousePosition(worldPoint);
        setCursorPosition(snappedPoint);

        // Si la herramienta actual es de dibujo y estamos en modo ortogonal
        // y estamos dibujando, aplicar restricción ortogonal
        if (
            ['line', 'rectangle'].includes(activeTool) &&
            toolData[activeTool].state === 'drawing' &&
            isOrthoMode
        ) {
            let startPoint: Point | undefined;

            if (activeTool === 'line') {
                startPoint = (toolData.line as any).startPoint;
            } else if (activeTool === 'rectangle') {
                startPoint = (toolData.rectangle as any).startPoint;
            }

            if (startPoint) {
                const orthoPoint = applyOrthoConstraint(startPoint, snappedPoint);
                setCursorPosition(orthoPoint);
            }
        }
    };

    // Funciones auxiliares para manejar herramientas específicas
    const handleLineToolClick = () => {
        const lineData = toolData.line as any;

        if (lineData.state === 'idle' || lineData.state === 'active') {
            // Primer clic: establecer punto inicial
            updateToolData('line', {
                startPoint: cursorPosition,
                state: 'drawing'
            });
        } else if (lineData.state === 'drawing') {
            // Segundo clic: crear la línea
            if (lineData.startPoint) {
                addElement({
                    type: 'line',
                    layerId: 'default',
                    geometry: {
                        start: lineData.startPoint,
                        end: cursorPosition
                    },
                    selected: false,
                    locked: false,
                    style: {
                        strokeColor: '#000000',
                        strokeWidth: 1,
                        lineType: 'solid',
                        fillColor: 'none',
                        fillOpacity: 0.5,
                    },
                    metadata: {},
                });

                // Resetear para permitir dibujar otra línea inmediatamente
                updateToolData('line', {
                    startPoint: undefined,
                    endPoint: undefined,
                    state: 'active'
                });
            }
        }
    };

    const handlePolylineToolClick = () => {
        const polylineData = toolData.polyline as any;

        if (polylineData.state === 'idle') {
            // Primer punto de la polilínea
            updateToolData('polyline', {
                points: [cursorPosition],
                currentPoint: cursorPosition,
                state: 'drawing'
            });
        } else if (polylineData.state === 'drawing') {
            // Añadir punto a la polilínea
            updateToolData('polyline', {
                points: [...polylineData.points, cursorPosition],
                currentPoint: cursorPosition
            });
        }
    };

    const handleRectangleToolClick = () => {
        const rectData = toolData.rectangle as any;

        if (rectData.state === 'idle' || rectData.state === 'active') {
            // Primer clic: establecer punto inicial
            updateToolData('rectangle', {
                startPoint: cursorPosition,
                state: 'drawing'
            });
        } else if (rectData.state === 'drawing') {
            // Segundo clic: crear el rectángulo
            if (rectData.startPoint) {
                const topLeft = {
                    x: Math.min(rectData.startPoint.x, cursorPosition.x),
                    y: Math.min(rectData.startPoint.y, cursorPosition.y)
                };

                const width = Math.abs(cursorPosition.x - rectData.startPoint.x);
                const height = Math.abs(cursorPosition.y - rectData.startPoint.y);

                addElement({
                    type: 'rectangle',
                    layerId: 'default',
                    geometry: {
                        topLeft,
                        width,
                        height,
                        rotation: 0
                    },
                    selected: false,
                    locked: false,
                    style: {
                        strokeColor: '#000000',
                        strokeWidth: 1,
                        lineType: 'solid',
                        fillColor: 'none',
                        fillOpacity: 0.5,
                    },
                    metadata: {},
                });

                // Resetear para permitir dibujar otro rectángulo inmediatamente
                updateToolData('rectangle', {
                    startPoint: undefined,
                    endPoint: undefined,
                    state: 'active'
                });
            }
        }
    };

    const handleCircleToolClick = () => {
        const circleData = toolData.circle as any;

        if (circleData.state === 'idle' || circleData.state === 'active') {
            // Primer clic: establecer el centro
            updateToolData('circle', {
                center: cursorPosition,
                state: 'drawing'
            });
        } else if (circleData.state === 'drawing') {
            // Segundo clic: determinar el radio y crear el círculo
            if (circleData.center) {
                const dx = cursorPosition.x - circleData.center.x;
                const dy = cursorPosition.y - circleData.center.y;
                const radius = Math.sqrt(dx * dx + dy * dy);

                addElement({
                    type: 'circle',
                    layerId: 'default',
                    geometry: {
                        center: circleData.center,
                        radius
                    },
                    selected: false,
                    locked: false,
                    style: {
                        strokeColor: '#000000',
                        strokeWidth: 1,
                        lineType: 'solid',
                        fillColor: 'none',
                        fillOpacity: 0.5,
                    },
                    metadata: {},
                });

                // Resetear para permitir dibujar otro círculo inmediatamente
                updateToolData('circle', {
                    center: undefined,
                    radius: undefined,
                    state: 'active'
                });
            }
        }
    };

    const handleTextToolClick = () => {
        // Implementación básica del texto
        // En una implementación real, aquí se abriría un diálogo para ingresar el texto
        const textContent = prompt('Ingrese el texto:');

        if (textContent) {
            addElement({
                type: 'text',
                layerId: 'default',
                geometry: {
                    position: cursorPosition,
                    content: textContent,
                    fontSize: 14,
                    fontFamily: 'Arial',
                    rotation: 0,
                    horizontalAlign: 'left',
                    verticalAlign: 'middle'
                },
                selected: false,
                locked: false,
                style: {
                    strokeColor: 'none',
                    strokeWidth: 0,
                    lineType: 'solid',
                    fillColor: '#000000',
                    fillOpacity: 1,
                },
                metadata: {},
            });
        }
    };

    // Configurar gestos de interacción (pan, zoom, etc.)
    const bind = useGesture(
        {
            // Arrastre (pan cuando la herramienta es 'pan' o se mantiene la tecla espaciadora)
            onDrag: ({ delta: [dx, dy], first, last }) => {
                if (activeTool === 'pan') {
                    if (first) setIsDragging(true);
                    if (last) setIsDragging(false);

                    pan(dx, dy);
                } else if (activeTool === 'select') {
                    // Lógica para selección por arrastre
                    const data = toolData.select;

                    if (first) {
                        updateToolData('select', {
                            startPoint: cursorPosition,
                            state: 'drawing'
                        });
                    } else {
                        updateToolData('select', {
                            endPoint: cursorPosition
                        });
                    }

                    if (last) {
                        setToolState('idle');

                        // Aquí implementar lógica para seleccionar elementos dentro del rectángulo
                        // ...
                    }
                }
            },

            // Zoom con rueda del ratón
            onWheel: ({ delta: [_, dy], event }) => {
                if (event) {
                    event.preventDefault();

                    const rect = canvasRef.current?.getBoundingClientRect();
                    if (!rect) return;

                    const center = {
                        x: event.clientX - rect.left,
                        y: event.clientY - rect.top,
                    };

                    // Factor de zoom: menor que 1 para zoom out, mayor que 1 para zoom in
                    const zoomFactor = Math.pow(0.999, dy);
                    zoom(zoomFactor, center);
                }
            },

            // Clic simple
            onClick: ({ event }) => {
                if (event) {
                    event.preventDefault();

                    // En modo selección, deseleccionar todo primero si no se presiona Shift
                    if (activeTool === 'select' && !event.shiftKey) {
                        deselectAll();
                    }

                    // Manejar comportamientos específicos por herramienta
                    switch (activeTool) {
                        case 'line':
                            handleLineToolClick();
                            break;
                        case 'polyline':
                            handlePolylineToolClick();
                            break;
                        case 'rectangle':
                            handleRectangleToolClick();
                            break;
                        case 'circle':
                            handleCircleToolClick();
                            break;
                        case 'text':
                            handleTextToolClick();
                            break;
                        default:
                            break;
                    }
                }
            },

            // Doble clic
            onDoubleClick: ({ event }) => {
                if (event) {
                    event.preventDefault();

                    // Finalizar polilínea en modo polilínea
                    if (activeTool === 'polyline') {
                        const polylineData = toolData.polyline as any;
                        if (polylineData.points.length >= 2) {
                            // Crear elemento polilínea
                            addElement({
                                type: 'polyline',
                                layerId: 'default',
                                geometry: {
                                    points: [...polylineData.points],
                                    closed: false
                                },
                                selected: false,
                                locked: false,
                                style: {
                                    strokeColor: '#000000',
                                    strokeWidth: 1,
                                    lineType: 'solid',
                                    fillColor: 'none',
                                    fillOpacity: 0.5,
                                },
                                metadata: {},
                            });

                            // Resetear la herramienta
                            updateToolData('polyline', {
                                points: [],
                                currentPoint: undefined,
                                state: 'idle'
                            });
                        }
                    }
                }
            },
        },
        {
            drag: { filterTaps: true },
            wheel: { preventDefault: true }
        }
    );

    // Renderiza las guías temporales mientras se dibuja
    const renderGuides = () => {
        switch (activeTool) {
            case 'line': {
                const lineData = toolData.line as any;
                if (lineData.state === 'drawing' && lineData.startPoint) {
                    return (
                        <line
                            x1={lineData.startPoint.x}
                            y1={lineData.startPoint.y}
                            x2={cursorPosition.x}
                            y2={cursorPosition.y}
                            stroke="#999999"
                            strokeWidth={1}
                            strokeDasharray="5,5"
                        />
                    );
                }
                break;
            }
            case 'polyline': {
                const polylineData = toolData.polyline as any;
                if (polylineData.state === 'drawing' && polylineData.points.length > 0) {
                    const lastPoint = polylineData.points[polylineData.points.length - 1];
                    return (
                        <>
                            <line
                                x1={lastPoint.x}
                                y1={lastPoint.y}
                                x2={cursorPosition.x}
                                y2={cursorPosition.y}
                                stroke="#999999"
                                strokeWidth={1}
                                strokeDasharray="5,5"
                            />
                            {polylineData.points.map((point: Point, index: number) => (
                                <circle
                                    key={index}
                                    cx={point.x}
                                    cy={point.y}
                                    r={3}
                                    fill="#ff0000"
                                />
                            ))}
                        </>
                    );
                }
                break;
            }
            case 'rectangle': {
                const rectData = toolData.rectangle as any;
                if (rectData.state === 'drawing' && rectData.startPoint) {
                    const x = Math.min(rectData.startPoint.x, cursorPosition.x);
                    const y = Math.min(rectData.startPoint.y, cursorPosition.y);
                    const width = Math.abs(cursorPosition.x - rectData.startPoint.x);
                    const height = Math.abs(cursorPosition.y - rectData.startPoint.y);

                    return (
                        <rect
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            stroke="#999999"
                            strokeWidth={1}
                            strokeDasharray="5,5"
                            fill="none"
                        />
                    );
                }
                break;
            }
            case 'circle': {
                const circleData = toolData.circle as any;
                if (circleData.state === 'drawing' && circleData.center) {
                    const dx = cursorPosition.x - circleData.center.x;
                    const dy = cursorPosition.y - circleData.center.y;
                    const radius = Math.sqrt(dx * dx + dy * dy);

                    return (
                        <circle
                            cx={circleData.center.x}
                            cy={circleData.center.y}
                            r={radius}
                            stroke="#999999"
                            strokeWidth={1}
                            strokeDasharray="5,5"
                            fill="none"
                        />
                    );
                }
                break;
            }
            case 'select': {
                const selectData = toolData.select as any;
                if (selectData.state === 'drawing' && selectData.startPoint && selectData.endPoint) {
                    const x = Math.min(selectData.startPoint.x, selectData.endPoint.x);
                    const y = Math.min(selectData.startPoint.y, selectData.endPoint.y);
                    const width = Math.abs(selectData.endPoint.x - selectData.startPoint.x);
                    const height = Math.abs(selectData.endPoint.y - selectData.startPoint.y);

                    return (
                        <rect
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            stroke="#0066cc"
                            strokeWidth={1}
                            strokeDasharray="5,5"
                            fill="#0066cc"
                            fillOpacity={0.1}
                        />
                    );
                }
                break;
            }
            default:
                return null;
        }

        return null;
    };

    // Renderizar el cursor según la herramienta activa
    const renderCursor = () => {
        if (activeTool === 'pan') return null;

        return (
            <g>
                <line
                    x1={cursorPosition.x - 5}
                    y1={cursorPosition.y}
                    x2={cursorPosition.x + 5}
                    y2={cursorPosition.y}
                    stroke="#FF0000"
                    strokeWidth={1}
                />
                <line
                    x1={cursorPosition.x}
                    y1={cursorPosition.y - 5}
                    x2={cursorPosition.x}
                    y2={cursorPosition.y + 5}
                    stroke="#FF0000"
                    strokeWidth={1}
                />
            </g>
        );
    };

    return (
        <div className="drawing-canvas-container">
            <div
                ref={canvasRef}
                className={`drawing-canvas ${isDragging ? 'dragging' : ''} ${activeTool}`}
                onMouseMove={handleMouseMove}
                {...bind()}
            >
                <svg
                    ref={svgRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    className="drawing-svg"
                >
                    <g>
                        {/* Grid */}
                        <GridRenderer />

                        {/* Elements */}
                        <ElementsRenderer />

                        {/* Temporary Guides */}
                        {renderGuides()}

                        {/* Cursor */}
                        {renderCursor()}

                        {/* North Indicator */}
                        <NorthIndicator />
                    </g>
                </svg>
            </div>

            {/* Status Bar with coordinates */}
            <StatusBar
                cursorPosition={cursorPosition}
                mousePosition={mousePosition}
                activeTool={activeTool}
                isOrthoMode={isOrthoMode}
                isSnapEnabled={gridSettings.snapToGrid}
            />
        </div>
    );
};

export default DrawingCanvas