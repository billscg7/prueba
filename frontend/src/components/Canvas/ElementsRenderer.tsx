import React from 'react';
import { useElementsStore } from '@/store/elementsStore';
import { Element, LineElement, PolylineElement, RectangleElement, CircleElement, ArcElement, TextElement } from '@/types/elements';
import './ElementsRenderer.scss';

/**
 * Renderiza un elemento de tipo línea
 */
const LineElementRenderer: React.FC<{ element: LineElement }> = ({ element }) => {
    const { start, end, style, selected } = element;

    return (
        <g className={`element line-element ${selected ? 'selected' : ''}`}>
            <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={style.strokeColor}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.lineType === 'dashed' ? '5,5' : undefined}
            />

            {/* Puntos de control cuando está seleccionado */}
            {selected && (
                <>
                    <circle className="control-point start-point" cx={start.x} cy={start.y} r={4} />
                    <circle className="control-point end-point" cx={end.x} cy={end.y} r={4} />
                </>
            )}
        </g>
    );
};

/**
 * Renderiza un elemento de tipo polilínea
 */
const PolylineElementRenderer: React.FC<{ element: PolylineElement }> = ({ element }) => {
    const { points, closed, style, selected } = element;

    if (points.length < 2) return null;

    // Construir string de puntos para el polígono
    const pathData = points.map((point, index) =>
        `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`
    ).join(' ') + (closed ? ' Z' : '');

    return (
        <g className={`element polyline-element ${selected ? 'selected' : ''}`}>
            <path
                d={pathData}
                fill={closed ? style.fillColor : 'none'}
                fillOpacity={style.fillOpacity}
                stroke={style.strokeColor}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.lineType === 'dashed' ? '5,5' : undefined}
            />

            {/* Puntos de control cuando está seleccionado */}
            {selected && points.map((point, index) => (
                <circle
                    key={`control-${index}`}
                    className="control-point"
                    cx={point.x}
                    cy={point.y}
                    r={4}
                />
            ))}
        </g>
    );
};

/**
 * Renderiza un elemento de tipo rectángulo
 */
const RectangleElementRenderer: React.FC<{ element: RectangleElement }> = ({ element }) => {
    const { topLeft, width, height, rotation, style, selected } = element;

    // Calcular la transformación para la rotación
    const centerX = topLeft.x + width / 2;
    const centerY = topLeft.y + height / 2;
    const transform = rotation ? `rotate(${rotation} ${centerX} ${centerY})` : undefined;

    return (
        <g
            className={`element rectangle-element ${selected ? 'selected' : ''}`}
            transform={transform}
        >
            <rect
                x={topLeft.x}
                y={topLeft.y}
                width={width}
                height={height}
                fill={style.fillColor}
                fillOpacity={style.fillOpacity}
                stroke={style.strokeColor}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.lineType === 'dashed' ? '5,5' : undefined}
            />

            {/* Puntos de control cuando está seleccionado */}
            {selected && (
                <>
                    {/* Esquinas */}
                    <circle className="control-point" cx={topLeft.x} cy={topLeft.y} r={4} />
                    <circle className="control-point" cx={topLeft.x + width} cy={topLeft.y} r={4} />
                    <circle className="control-point" cx={topLeft.x + width} cy={topLeft.y + height} r={4} />
                    <circle className="control-point" cx={topLeft.x} cy={topLeft.y + height} r={4} />

                    {/* Puntos medios de los lados */}
                    <circle className="control-point" cx={topLeft.x + width / 2} cy={topLeft.y} r={4} />
                    <circle className="control-point" cx={topLeft.x + width} cy={topLeft.y + height / 2} r={4} />
                    <circle className="control-point" cx={topLeft.x + width / 2} cy={topLeft.y + height} r={4} />
                    <circle className="control-point" cx={topLeft.x} cy={topLeft.y + height / 2} r={4} />
                </>
            )}
        </g>
    );
};

/**
 * Renderiza un elemento de tipo círculo
 */
const CircleElementRenderer: React.FC<{ element: CircleElement }> = ({ element }) => {
    const { center, radius, style, selected } = element;

    return (
        <g className={`element circle-element ${selected ? 'selected' : ''}`}>
            <circle
                cx={center.x}
                cy={center.y}
                r={radius}
                fill={style.fillColor}
                fillOpacity={style.fillOpacity}
                stroke={style.strokeColor}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.lineType === 'dashed' ? '5,5' : undefined}
            />

            {/* Puntos de control cuando está seleccionado */}
            {selected && (
                <>
                    <circle className="control-point center-point" cx={center.x} cy={center.y} r={4} />
                    <circle className="control-point radius-point" cx={center.x + radius} cy={center.y} r={4} />
                    <circle className="control-point radius-point" cx={center.x} cy={center.y + radius} r={4} />
                    <circle className="control-point radius-point" cx={center.x - radius} cy={center.y} r={4} />
                    <circle className="control-point radius-point" cx={center.x} cy={center.y - radius} r={4} />
                </>
            )}
        </g>
    );
};

/**
 * Renderiza un elemento de tipo arco
 */
const ArcElementRenderer: React.FC<{ element: ArcElement }> = ({ element }) => {
    const { center, radius, startAngle, endAngle, style, selected } = element;

    // Calcular puntos del arco
    const startX = center.x + radius * Math.cos(startAngle);
    const startY = center.y + radius * Math.sin(startAngle);
    const endX = center.x + radius * Math.cos(endAngle);
    const endY = center.y + radius * Math.sin(endAngle);

    // Determinar si el arco es mayor que 180 grados
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    // Construir path para el arco
    const pathData = `
    M ${center.x},${center.y}
    L ${startX},${startY}
    A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY}
    Z
  `;

    return (
        <g className={`element arc-element ${selected ? 'selected' : ''}`}>
            <path
                d={pathData}
                fill={style.fillColor}
                fillOpacity={style.fillOpacity}
                stroke={style.strokeColor}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.lineType === 'dashed' ? '5,5' : undefined}
            />

            {/* Puntos de control cuando está seleccionado */}
            {selected && (
                <>
                    <circle className="control-point center-point" cx={center.x} cy={center.y} r={4} />
                    <circle className="control-point start-point" cx={startX} cy={startY} r={4} />
                    <circle className="control-point end-point" cx={endX} cy={endY} r={4} />
                </>
            )}
        </g>
    );
};

/**
 * Renderiza un elemento de tipo texto
 */
const TextElementRenderer: React.FC<{ element: TextElement }> = ({ element }) => {
    const {
        position, content, fontSize, fontFamily,
        rotation, horizontalAlign, verticalAlign,
        style, selected
    } = element;

    // Calcular alineación
    let textAnchor: 'start' | 'middle' | 'end';
    switch (horizontalAlign) {
        case 'right': textAnchor = 'end'; break;
        case 'center': textAnchor = 'middle'; break;
        default: textAnchor = 'start';
    }

    let dominantBaseline: 'text-top' | 'middle' | 'text-bottom';
    switch (verticalAlign) {
        case 'top': dominantBaseline = 'text-top'; break;
        case 'bottom': dominantBaseline = 'text-bottom'; break;
        default: dominantBaseline = 'middle';
    }

    // Calcular transformación para rotación
    const transform = rotation ? `rotate(${rotation} ${position.x} ${position.y})` : undefined;

    return (
        <g
            className={`element text-element ${selected ? 'selected' : ''}`}
            transform={transform}
        >
            <text
                x={position.x}
                y={position.y}
                fontSize={fontSize}
                fontFamily={fontFamily}
                textAnchor={textAnchor}
                dominantBaseline={dominantBaseline}
                fill={style.fillColor}
            >
                {content}
            </text>

            {/* Marco de selección cuando está seleccionado */}
            {selected && (
                <rect
                    className="selection-box"
                    x={position.x - 2}
                    y={position.y - fontSize}
                    width={content.length * fontSize * 0.6 + 4}
                    height={fontSize * 1.2}
                    stroke="#0066cc"
                    strokeWidth={1}
                    fill="none"
                    strokeDasharray="3,3"
                />
            )}
        </g>
    );
};

/**
 * Componente principal que renderiza todos los elementos visibles
 */
const ElementsRenderer: React.FC = () => {
    // Obtener elementos visibles
    const { getVisibleElements } = useElementsStore();
    const visibleElements = getVisibleElements();

    return (
        <g className="elements-renderer">
            {visibleElements.map((element) => {
                switch (element.type) {
                    case 'line':
                        return <LineElementRenderer key={element.id} element={element as LineElement} />;
                    case 'polyline':
                        return <PolylineElementRenderer key={element.id} element={element as PolylineElement} />;
                    case 'rectangle':
                        return <RectangleElementRenderer key={element.id} element={element as RectangleElement} />;
                    case 'circle':
                        return <CircleElementRenderer key={element.id} element={element as CircleElement} />;
                    case 'arc':
                        return <ArcElementRenderer key={element.id} element={element as ArcElement} />;
                    case 'text':
                        return <TextElementRenderer key={element.id} element={element as TextElement} />;
                    default:
                        return null;
                }
            })}
        </g>
    );
};

export default ElementsRenderer;