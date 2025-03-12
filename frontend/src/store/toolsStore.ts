import { create } from 'zustand';
import { Point } from '@/types/geometry';

/**
 * Tipos de herramientas disponibles
 */
export type ToolType =
    | 'select'      // Selección
    | 'pan'         // Desplazamiento
    | 'line'        // Línea
    | 'polyline'    // Polilínea
    | 'rectangle'   // Rectángulo
    | 'circle'      // Círculo
    | 'arc'         // Arco
    | 'text';       // Texto

/**
 * Estados posibles para una herramienta
 */
export type ToolState =
    | 'idle'        // Inactivo, esperando interacción
    | 'active'      // Activo, esperando punto inicial
    | 'drawing'     // Dibujando, esperando punto final
    | 'editing';    // Editando un elemento existente

/**
 * Estado común de una herramienta
 */
interface BaseToolData {
    state: ToolState;
}

/**
 * Datos específicos para la herramienta de selección
 */
interface SelectToolData extends BaseToolData {
    startPoint?: Point;
    endPoint?: Point;
    dragMode: boolean;
}

/**
 * Datos específicos para la herramienta de desplazamiento
 */
interface PanToolData extends BaseToolData {
    lastPoint?: Point;
}

/**
 * Datos específicos para la herramienta de línea
 */
interface LineToolData extends BaseToolData {
    startPoint?: Point;
    endPoint?: Point;
}

/**
 * Datos específicos para la herramienta de polilínea
 */
interface PolylineToolData extends BaseToolData {
    points: Point[];
    currentPoint?: Point;
    closed: boolean;
}

/**
 * Datos específicos para la herramienta de rectángulo
 */
interface RectangleToolData extends BaseToolData {
    startPoint?: Point;
    endPoint?: Point;
    aspectRatio?: number; // Para restringir proporciones
}

/**
 * Datos específicos para la herramienta de círculo
 */
interface CircleToolData extends BaseToolData {
    center?: Point;
    radius?: number;
}

/**
 * Datos específicos para la herramienta de arco
 */
interface ArcToolData extends BaseToolData {
    center?: Point;
    radius?: number;
    startAngle?: number;
    endAngle?: number;
}

/**
 * Datos específicos para la herramienta de texto
 */
interface TextToolData extends BaseToolData {
    position?: Point;
    content: string;
}

/**
 * Unión de todos los tipos de datos de herramientas
 */
type ToolData =
    | SelectToolData
    | PanToolData
    | LineToolData
    | PolylineToolData
    | RectangleToolData
    | CircleToolData
    | ArcToolData
    | TextToolData;

interface ToolsState {
    activeTool: ToolType;
    toolData: Record<ToolType, ToolData>;

    // Administración de herramientas
    setActiveTool: (tool: ToolType) => void;
    resetActiveTool: () => void;
    updateToolData: <T extends ToolType>(tool: T, updates: Partial<ToolData>) => void;

    // Estados de herramientas específicas
    getToolData: <T extends ToolType>(tool: T) => ToolData;
    setToolState: (state: ToolState) => void;

    // Configuración global
    isOrthoMode: boolean;
    toggleOrthoMode: () => void;
}

/**
 * Datos iniciales para cada herramienta
 */
const initialToolData: Record<ToolType, ToolData> = {
    select: { state: 'idle', dragMode: false },
    pan: { state: 'idle' },
    line: { state: 'idle' },
    polyline: { state: 'idle', points: [], closed: false },
    rectangle: { state: 'idle' },
    circle: { state: 'idle' },
    arc: { state: 'idle' },
    text: { state: 'idle', content: '' },
};

/**
 * Store para la gestión de herramientas de edición
 */
export const useToolsStore = create<ToolsState>((set, get) => ({
    activeTool: 'select',
    toolData: initialToolData,
    isOrthoMode: false,

    /**
     * Establece la herramienta activa
     */
    setActiveTool: (tool) => {
        // Resetear el estado de la herramienta actual antes de cambiar
        const currentTool = get().activeTool;
        if (currentTool !== tool) {
            get().resetActiveTool();
        }

        set({ activeTool: tool });
    },

    /**
     * Restablece la herramienta activa a su estado inicial
     */
    resetActiveTool: () => {
        const activeTool = get().activeTool;

        set((state) => ({
            toolData: {
                ...state.toolData,
                [activeTool]: initialToolData[activeTool],
            },
        }));
    },

    /**
     * Actualiza los datos de una herramienta específica
     */
    updateToolData: (tool, updates) => {
        set((state) => ({
            toolData: {
                ...state.toolData,
                [tool]: {
                    ...state.toolData[tool],
                    ...updates,
                },
            },
        }));
    },

    /**
     * Obtiene los datos de una herramienta específica
     */
    getToolData: <T extends ToolType>(tool: T) => {
        return get().toolData[tool];
    },

    /**
     * Establece el estado de la herramienta activa
     */
    setToolState: (state) => {
        const activeTool = get().activeTool;

        set((prevState) => ({
            toolData: {
                ...prevState.toolData,
                [activeTool]: {
                    ...prevState.toolData[activeTool],
                    state,
                },
            },
        }));
    },

    /**
     * Alterna el modo ortogonal (restricción a ángulos de 90°)
     */
    toggleOrthoMode: () => {
        set((state) => ({
            isOrthoMode: !state.isOrthoMode,
        }));
    },
}));