import { Point, Line, Vector } from '@/types/geometry';

/**
 * Genera un ID único basado en un prefijo y un timestamp
 */
export const generateId = (prefix = 'elem'): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Calcula la distancia entre dos puntos
 */
export const distance = (p1: Point, p2: Point): number => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calcula el punto medio entre dos puntos
 */
export const midpoint = (p1: Point, p2: Point): Point => {
    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
    };
};

/**
 * Calcula el ángulo en radianes entre dos puntos
 */
export const angleInRadians = (p1: Point, p2: Point): number => {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

/**
 * Calcula el ángulo en grados entre dos puntos
 */
export const angleInDegrees = (p1: Point, p2: Point): number => {
    return (angleInRadians(p1, p2) * 180) / Math.PI;
};

/**
 * Aplica restricción ortogonal (0°, 90°, 180°, 270°) a un punto
 * @param start Punto de origen
 * @param end Punto final
 * @returns Punto final ajustado a la restricción ortogonal
 */
export const applyOrthoConstraint = (start: Point, end: Point): Point => {
    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);

    // Si dx > dy, restricción horizontal, de lo contrario vertical
    if (dx > dy) {
        return { x: end.x, y: start.y };
    } else {
        return { x: start.x, y: end.y };
    }
};

/**
 * Convierte grados a radianes
 */
export const degreesToRadians = (degrees: number): number => {
    return (degrees * Math.PI) / 180;
};

/**
 * Convierte radianes a grados
 */
export const radiansToDegrees = (radians: number): number => {
    return (radians * 180) / Math.PI;
};

/**
 * Limita un valor a un rango específico
 */
export const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
};

/**
 * Formatea un número con precisión específica
 */
export const formatNumber = (num: number, precision = 2): string => {
    return num.toFixed(precision).replace(/\.?0+$/, '');
};

/**
 * Verifica si un punto está dentro de un rectángulo definido por dos esquinas
 */
export const isPointInRect = (
    point: Point,
    rectCorner1: Point,
    rectCorner2: Point
): boolean => {
    const minX = Math.min(rectCorner1.x, rectCorner2.x);
    const maxX = Math.max(rectCorner1.x, rectCorner2.x);
    const minY = Math.min(rectCorner1.y, rectCorner2.y);
    const maxY = Math.max(rectCorner1.y, rectCorner2.y);

    return (
        point.x >= minX &&
        point.x <= maxX &&
        point.y >= minY &&
        point.y <= maxY
    );
};

/**
 * Calcula la intersección entre dos líneas
 * @returns Punto de intersección o null si no se intersectan
 */
export const lineIntersection = (l1: Line, l2: Line): Point | null => {
    const x1 = l1.start.x;
    const y1 = l1.start.y;
    const x2 = l1.end.x;
    const y2 = l1.end.y;

    const x3 = l2.start.x;
    const y3 = l2.start.y;
    const x4 = l2.end.x;
    const y4 = l2.end.y;

    const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

    // Líneas paralelas
    if (Math.abs(denominator) < 1e-10) {
        return null;
    }

    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

    // Verificar si la intersección está dentro de ambos segmentos
    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return null;
    }

    return {
        x: x1 + ua * (x2 - x1),
        y: y1 + ua * (y2 - y1),
    };
};

/**
 * Calcula la distancia de un punto a una línea
 */
export const distancePointToLine = (point: Point, line: Line): number => {
    const { start, end } = line;

    // Longitud de la línea al cuadrado
    const lengthSquared =
        (end.x - start.x) * (end.x - start.x) +
        (end.y - start.y) * (end.y - start.y);

    // Si la línea es un punto, devolver la distancia al punto
    if (lengthSquared === 0) {
        return distance(point, start);
    }

    // Calcular la proyección del punto sobre la línea
    const t =
        ((point.x - start.x) * (end.x - start.x) +
            (point.y - start.y) * (end.y - start.y)) /
        lengthSquared;

    // Si t está fuera del rango [0,1], la proyección está fuera de la línea
    if (t < 0) {
        return distance(point, start);
    }
    if (t > 1) {
        return distance(point, end);
    }

    // Calcular el punto de proyección
    const projection = {
        x: start.x + t * (end.x - start.x),
        y: start.y + t * (end.y - start.y),
    };

    // Devolver la distancia al punto de proyección
    return distance(point, projection);
};

/**
 * Normaliza un vector
 */
export const normalizeVector = (vector: Vector): Vector => {
    const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

    if (magnitude === 0) {
        return { x: 0, y: 0 };
    }

    return {
        x: vector.x / magnitude,
        y: vector.y / magnitude,
    };
};

/**
 * Calcula un vector perpendicular
 */
export const perpendicularVector = (vector: Vector): Vector => {
    return { x: -vector.y, y: vector.x };
};

/**
 * Rota un punto alrededor de otro punto
 */
export const rotatePoint = (
    point: Point,
    center: Point,
    angleInRadians: number
): Point => {
    const x = point.x - center.x;
    const y = point.y - center.y;

    const cos = Math.cos(angleInRadians);
    const sin = Math.sin(angleInRadians);

    return {
        x: center.x + x * cos - y * sin,
        y: center.y + x * sin + y * cos,
    };
};

/**
 * Devuelve un array de colores predefinidos para usar en capas
 */
export const getPredefinedColors = (): string[] => {
    return [
        '#ff0000', // Rojo
        '#00ff00', // Verde
        '#0000ff', // Azul
        '#ffff00', // Amarillo
        '#ff00ff', // Magenta
        '#00ffff', // Cian
        '#ff8000', // Naranja
        '#8000ff', // Violeta
        '#0080ff', // Azul claro
        '#ff0080', // Rosa
        '#80ff00', // Verde lima
        '#00ff80', // Verde menta
        '#808080', // Gris
        '#800000', // Marrón
        '#008000', // Verde oscuro
        '#000080', // Azul oscuro
    ];
};

/**
 * Debounce: Limita la frecuencia de ejecución de una función
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
};

/**
 * Throttle: Asegura que una función no se ejecute más de una vez en un período especificado
 */
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    let inThrottle = false;
    let lastArgs: Parameters<T> | null = null;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;

            setTimeout(() => {
                inThrottle = false;

                if (lastArgs) {
                    func(...lastArgs);
                    lastArgs = null;
                }
            }, limit);
        } else {
            lastArgs = args;
        }
    };
};