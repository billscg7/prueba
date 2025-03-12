import { create } from 'zustand';
import { Point } from '@/types/geometry';

/**
 * Configuración de la cuadrícula
 */
export interface GridSettings {
    /** Determina si la cuadrícula es visible */
    visible: boolean;
    /** Espaciado principal de la cuadrícula en unidades del mundo (metros) */
    spacing: number;
    /** Número de subdivisiones entre líneas principales */
    subdivisions: number;
    /** Determina si se debe ajustar a la cuadrícula */
    snapToGrid: boolean;
    /** Determina si se muestran los ejes */
    showAxes: boolean;
    /** Color de las líneas principales */
    majorLineColor: string;
    /** Color de las líneas secundarias */
    minorLineColor: string;
    /** Color del eje X */
    axisXColor: string;
    /** Color del eje Y */
    axisYColor: string;
    /** Color de las etiquetas */
    labelColor: string;
    /** Determina si se muestran las etiquetas */
    showLabels: boolean;
    /** Tamaño de fuente de las etiquetas */
    labelFontSize: number;
}

interface GridState {
    settings: GridSettings;
    updateSettings: (settings: Partial<GridSettings>) => void;
    snapPoint: (x: number, y: number) => Point;
    toggleVisibility: () => void;
    toggleSnap: () => void;
    toggleAxes: () => void;
    toggleLabels: () => void;
}

const initialSettings: GridSettings = {
    visible: true,
    spacing: 1, // 1 metro
    subdivisions: 10, // 10 subdivisiones
    snapToGrid: true,
    showAxes: true,
    majorLineColor: '#888888',
    minorLineColor: '#DDDDDD',
    axisXColor: '#FF4444',
    axisYColor: '#44FF44',
    labelColor: '#333333',
    showLabels: true,
    labelFontSize: 12,
};

/**
 * Store para gestionar la configuración y comportamiento de la cuadrícula
 */
export const useGridStore = create<GridState>((set, get) => ({
    settings: initialSettings,

    /**
     * Actualiza la configuración de la cuadrícula
     */
    updateSettings: (newSettings) =>
        set((state) => ({
            settings: { ...state.settings, ...newSettings }
        })),

    /**
     * Ajusta un punto a la cuadrícula según la configuración actual
     */
    snapPoint: (x, y) => {
        const { settings } = get();
        if (!settings.snapToGrid) return { x, y };

        // Calcular tamaño de la subdivisión
        const gridSize = settings.spacing / settings.subdivisions;

        // Ajustar a la cuadrícula
        return {
            x: Math.round(x / gridSize) * gridSize,
            y: Math.round(y / gridSize) * gridSize,
        };
    },

    /**
     * Alterna la visibilidad de la cuadrícula
     */
    toggleVisibility: () =>
        set((state) => ({
            settings: { ...state.settings, visible: !state.settings.visible }
        })),

    /**
     * Alterna el ajuste a la cuadrícula
     */
    toggleSnap: () =>
        set((state) => ({
            settings: { ...state.settings, snapToGrid: !state.settings.snapToGrid }
        })),

    /**
     * Alterna la visibilidad de los ejes
     */
    toggleAxes: () =>
        set((state) => ({
            settings: { ...state.settings, showAxes: !state.settings.showAxes }
        })),

    /**
     * Alterna la visibilidad de las etiquetas
     */
    toggleLabels: () =>
        set((state) => ({
            settings: { ...state.settings, showLabels: !state.settings.showLabels }
        })),
}));