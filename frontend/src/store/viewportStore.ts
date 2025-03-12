import { create } from 'zustand';
import { Point, Viewport, Matrix } from '@/types/geometry';

interface ViewportState {
    viewport: Viewport;
    setViewport: (viewport: Partial<Viewport>) => void;
    pan: (dx: number, dy: number) => void;
    zoom: (factor: number, center: Point) => void;
    rotate: (angle: number, center?: Point) => void;
    reset: () => void;
    screenToWorld: (point: Point) => Point;
    worldToScreen: (point: Point) => Point;
    getTransformMatrix: () => Matrix;
    getInverseTransformMatrix: () => Matrix;
}

const initialViewport: Viewport = {
    origin: { x: 0, y: 0 },
    scale: 1.0,
    rotation: 0,
    width: window.innerWidth,
    height: window.innerHeight,
};

/**
 * Store para la gestión del viewport (vista del usuario)
 * Maneja transformaciones entre coordenadas de pantalla y mundo
 */
export const useViewportStore = create<ViewportState>((set, get) => ({
    viewport: initialViewport,

    setViewport: (viewportUpdate) =>
        set((state) => ({
            viewport: { ...state.viewport, ...viewportUpdate }
        })),

    /**
     * Desplaza la vista según los deltas dados en píxeles
     */
    pan: (dx, dy) =>
        set((state) => {
            // Convertir el desplazamiento en píxeles a unidades del mundo
            const { rotation, scale } = state.viewport;

            // Ajustar por rotación
            const cosTheta = Math.cos(rotation);
            const sinTheta = Math.sin(rotation);

            const worldDx = (dx * cosTheta + dy * sinTheta) / scale;
            const worldDy = (-dx * sinTheta + dy * cosTheta) / scale;

            return {
                viewport: {
                    ...state.viewport,
                    origin: {
                        x: state.viewport.origin.x - worldDx,
                        y: state.viewport.origin.y - worldDy,
                    },
                },
            };
        }),

    /**
     * Aplica zoom centrado en un punto específico
     * @param factor Factor de zoom (>1 para acercar, <1 para alejar)
     * @param center Punto central en coordenadas de pantalla
     */
    zoom: (factor, center) => {
        const { viewport } = get();
        const worldCenter = get().screenToWorld(center);

        const newScale = viewport.scale * factor;

        // Limitar el zoom para evitar valores extremos
        const limitedScale = Math.max(0.01, Math.min(1000, newScale));

        if (limitedScale === viewport.scale) return;

        set((state) => ({
            viewport: {
                ...state.viewport,
                scale: limitedScale,
                // Ajustar origen para mantener el punto central fijo
                origin: {
                    x: worldCenter.x - (center.x - viewport.width / 2) / limitedScale,
                    y: worldCenter.y - (center.y - viewport.height / 2) / limitedScale,
                },
            },
        }));
    },

    /**
     * Rota la vista alrededor de un punto específico
     * @param angle Ángulo de rotación en radianes
     * @param center Punto central de rotación en coordenadas de pantalla
     */
    rotate: (angle, center) => {
        const { viewport } = get();
        const pivot = center
            ? get().screenToWorld(center)
            : viewport.origin;

        const currentRotation = viewport.rotation;
        const newRotation = currentRotation + angle;

        // Normalizar el ángulo entre 0 y 2π
        const normalizedRotation = newRotation % (2 * Math.PI);

        set((state) => ({
            viewport: {
                ...state.viewport,
                rotation: normalizedRotation,
                // Ajustar origen si se proporciona un punto de pivote personalizado
                origin: pivot !== viewport.origin
                    ? {
                        x: pivot.x + (viewport.origin.x - pivot.x) * Math.cos(angle) -
                            (viewport.origin.y - pivot.y) * Math.sin(angle),
                        y: pivot.y + (viewport.origin.x - pivot.x) * Math.sin(angle) +
                            (viewport.origin.y - pivot.y) * Math.cos(angle),
                    }
                    : viewport.origin,
            },
        }));
    },

    /**
     * Restablece el viewport a su estado inicial
     */
    reset: () => set({
        viewport: {
            ...initialViewport,
            width: get().viewport.width,
            height: get().viewport.height
        }
    }),

    /**
     * Obtiene la matriz de transformación actual
     * Convierte coordenadas del mundo a coordenadas de pantalla
     */
    getTransformMatrix: () => {
        const { viewport } = get();
        const { width, height, scale, rotation, origin } = viewport;

        const centerX = width / 2;
        const centerY = height / 2;

        const cosTheta = Math.cos(rotation);
        const sinTheta = Math.sin(rotation);

        // Matriz de transformación:
        // 1. Trasladar por el negativo del origen del mundo
        // 2. Escalar por el factor de zoom
        // 3. Rotar según el ángulo de rotación
        // 4. Trasladar al centro de la pantalla

        return [
            scale * cosTheta,
            scale * sinTheta,
            -scale * cosTheta * origin.x + -scale * sinTheta * origin.y + centerX,
            -scale * sinTheta,
            scale * cosTheta,
            scale * sinTheta * origin.x + -scale * cosTheta * origin.y + centerY,
        ] as Matrix;
    },

    /**
     * Obtiene la matriz de transformación inversa
     * Convierte coordenadas de pantalla a coordenadas del mundo
     */
    getInverseTransformMatrix: () => {
        const matrix = get().getTransformMatrix();
        const [a, b, c, d, e, f] = matrix;

        // Calcular determinante
        const det = a * e - b * d;

        if (Math.abs(det) < 1e-6) {
            // Matriz singular, retornar identidad
            return [1, 0, 0, 0, 1, 0] as Matrix;
        }

        // Calcular inversa
        const invDet = 1 / det;

        return [
            e * invDet,
            -b * invDet,
            (b * f - c * e) * invDet,
            -d * invDet,
            a * invDet,
            (c * d - a * f) * invDet,
        ] as Matrix;
    },

    /**
     * Convierte un punto de coordenadas de pantalla a coordenadas del mundo
     */
    screenToWorld: (point) => {
        const inverse = get().getInverseTransformMatrix();
        const [a, b, c, d, e, f] = inverse;

        return {
            x: a * point.x + c * point.y + e,
            y: b * point.x + d * point.y + f,
        };
    },

    /**
     * Convierte un punto de coordenadas del mundo a coordenadas de pantalla
     */
    worldToScreen: (point) => {
        const matrix = get().getTransformMatrix();
        const [a, b, c, d, e, f] = matrix;

        return {
            x: a * point.x + c * point.y + e,
            y: b * point.x + d * point.y + f,
        };
    },
}));