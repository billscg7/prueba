/**
 * Representa un punto en el espacio 2D
 */
export interface Point {
    x: number;
    y: number;
}

/**
 * Representa una línea entre dos puntos
 */
export interface Line {
    start: Point;
    end: Point;
}

/**
 * Representa un vector en el espacio 2D
 */
export interface Vector {
    x: number;
    y: number;
}

/**
 * Matriz de transformación 2D con 6 valores (a, b, c, d, e, f)
 * [a c e]
 * [b d f]
 * [0 0 1]
 */
export type Matrix = [number, number, number, number, number, number];

/**
 * Definición de un viewport que representa la vista actual del usuario
 */
export interface Viewport {
    /** Punto central de la vista en coordenadas del mundo */
    origin: Point;
    /** Factor de zoom (>1 para acercar, <1 para alejar) */
    scale: number;
    /** Rotación en radianes */
    rotation: number;
    /** Ancho del viewport en píxeles */
    width: number;
    /** Alto del viewport en píxeles */
    height: number;
}

/**
 * Definición de un rectángulo por sus esquinas superior izquierda e inferior derecha
 */
export interface Rect {
    topLeft: Point;
    bottomRight: Point;
}

/**
 * Tipos de unidades soportadas
 */
export type UnitSystem = 'metric' | 'imperial';

/**
 * Información sobre las unidades activas
 */
export interface UnitInfo {
    system: UnitSystem;
    /** Factor de conversión a metros (1.0 para métrico, 0.3048 para imperial) */
    factor: number;
    /** Símbolo de la unidad (m, ft, etc.) */
    symbol: string;
    /** Precisión decimal para mostrar */
    precision: number;
}