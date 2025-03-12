// src/types/elements.ts
import { Point } from './geometry';

/**
 * Tipos de elementos disponibles en el sistema CAD
 */
export type ElementType =
    | 'line'
    | 'polyline'
    | 'rectangle'
    | 'circle'
    | 'arc'
    | 'text';

/**
 * Propiedades base comunes a todos los elementos
 */
export interface BaseElement {
    /** Identificador único del elemento */
    id: string;
    /** Tipo de elemento */
    type: ElementType;
    /** Identificador de la capa a la que pertenece */
    layerId: string;
    /** Propiedades de estilo */
    style: ElementStyle;
    /** Estado de selección */
    selected: boolean;
    /** Estado de bloqueo */
    locked: boolean;
    /** Metadatos adicionales */
    metadata: Record<string, any>;

    // Propiedades para compatibilidad con ambos enfoques
    geometry?: any;
}

/**
 * Propiedades de estilo de un elemento
 */
export interface ElementStyle {
    /** Color de trazo en formato hexadecimal (#RRGGBB) */
    strokeColor: string;
    /** Ancho de trazo en píxeles */
    strokeWidth: number;
    /** Tipo de línea (solid, dashed, etc.) */
    lineType: string;
    /** Color de relleno en formato hexadecimal (#RRGGBB) o 'none' */
    fillColor: string;
    /** Opacidad del relleno (0-1) */
    fillOpacity: number;
}

/**
 * Elemento de tipo línea
 */
export interface LineElement extends BaseElement {
    type: 'line';
    start: Point;
    end: Point;
}

/**
 * Elemento de tipo polilínea
 */
export interface PolylineElement extends BaseElement {
    type: 'polyline';
    points: Point[];
    closed: boolean;
}

/**
 * Elemento de tipo rectángulo
 */
export interface RectangleElement extends BaseElement {
    type: 'rectangle';
    topLeft: Point;
    width: number;
    height: number;
    rotation: number;
}

/**
 * Elemento de tipo círculo
 */
export interface CircleElement extends BaseElement {
    type: 'circle';
    center: Point;
    radius: number;
}

/**
 * Elemento de tipo arco
 */
export interface ArcElement extends BaseElement {
    type: 'arc';
    center: Point;
    radius: number;
    startAngle: number;
    endAngle: number;
}

/**
 * Elemento de tipo texto
 */
export interface TextElement extends BaseElement {
    type: 'text';
    position: Point;
    content: string;
    fontSize: number;
    fontFamily: string;
    rotation: number;
    horizontalAlign: 'left' | 'center' | 'right';
    verticalAlign: 'top' | 'middle' | 'bottom';
}

/**
 * Unión de todos los tipos de elementos posibles
 */
export type Element =
    | LineElement
    | PolylineElement
    | RectangleElement
    | CircleElement
    | ArcElement
    | TextElement;

/**
 * Definición de una capa
 */
export interface Layer {
    id: string;
    name: string;
    visible: boolean;
    locked: boolean;
    color: string;
    order: number;
}