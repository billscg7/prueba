import React from 'react';
import { useViewportStore } from '@/store/viewportStore';
import './NorthIndicator.scss';

/**
 * Componente que muestra un indicador de norte en el canvas
 * Se posiciona en la esquina superior derecha y refleja la rotación actual
 */
const NorthIndicator: React.FC = () => {
    const { viewport } = useViewportStore();

    // Calcular tamaño del indicador
    const size = 50; // Tamaño en píxeles
    const margin = 20; // Margen desde el borde

    // Calcular posición (esquina superior derecha)
    const centerX = viewport.width - size / 2 - margin;
    const centerY = size / 2 + margin;

    // Obtener el ángulo de rotación invertido (ya que rotamos la vista, no el mundo)
    const rotation = -viewport.rotation * (180 / Math.PI);

    return (
        <g
            className="north-indicator"
            transform={`translate(${centerX}, ${centerY})`}
        >
            {/* Círculo de fondo */}
            <circle
                r={size / 2}
                fill="white"
                stroke="#333333"
                strokeWidth={1}
                opacity={0.8}
            />

            {/* Flecha de dirección (punto al norte) */}
            <g transform={`rotate(${rotation})`}>
                {/* Punta de flecha (triángulo) */}
                <path
                    d="M0,-20 L6,-10 L0,-12 L-6,-10 Z"
                    fill="#CC0000"
                    stroke="#880000"
                    strokeWidth={1}
                />

                {/* Línea de la flecha */}
                <line
                    x1="0"
                    y1="-12"
                    x2="0"
                    y2="12"
                    stroke="#880000"
                    strokeWidth={2}
                />

                {/* Letra N para Norte */}
                <text
                    x="0"
                    y="-25"
                    fontSize="14"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#000000"
                >
                    N
                </text>

                {/* Marcas para los puntos cardinales */}
                <line x1="0" y1="16" x2="0" y2="22" stroke="#333333" strokeWidth={1} />
                <text x="0" y="28" fontSize="10" textAnchor="middle" fill="#333333">S</text>

                <line x1="16" y1="0" x2="22" y2="0" stroke="#333333" strokeWidth={1} />
                <text x="28" y="0" fontSize="10" dominantBaseline="middle" fill="#333333">E</text>

                <line x1="-16" y1="0" x2="-22" y2="0" stroke="#333333" strokeWidth={1} />
                <text x="-28" y="0" fontSize="10" textAnchor="end" dominantBaseline="middle" fill="#333333">W</text>
            </g>
        </g>
    );
};

export default NorthIndicator;