import React, { useMemo } from 'react';
import { useViewportStore } from '@/store/viewportStore';
import { useGridStore } from '@/store/gridStore';
import { formatNumber } from '@/utils/helpers';
import './GridRenderer.scss';

/**
 * Componente que renderiza la cuadrícula y los ejes
 */
const GridRenderer: React.FC = () => {
  const { viewport, worldToScreen, screenToWorld } = useViewportStore();
  const { settings } = useGridStore();
  
  // No renderizar si la cuadrícula no es visible
  if (!settings.visible) return null;
  
  // Calcular límites visibles del mundo
  const topLeft = screenToWorld({ x: 0, y: 0 });
  const bottomRight = screenToWorld({ 
    x: viewport.width, 
    y: viewport.height 
  });
  
  // Calcular parámetros de la cuadrícula
  const gridSpacing = settings.spacing;
  const minorSpacing = gridSpacing / settings.subdivisions;
  
  // Memorizar líneas de la cuadrícula para evitar recálculos innecesarios
  const gridLines = useMemo(() => {
    // Determinar rangos para líneas
    const startX = Math.floor(topLeft.x / gridSpacing) * gridSpacing;
    const endX = Math.ceil(bottomRight.x / gridSpacing) * gridSpacing;
    const startY = Math.floor(topLeft.y / gridSpacing) * gridSpacing;
    const endY = Math.ceil(bottomRight.y / gridSpacing) * gridSpacing;
    
    // Líneas principales verticales
    const majorVerticals = [];
    for (let x = startX; x <= endX; x += gridSpacing) {
      const screenStart = worldToScreen({ x, y: topLeft.y });
      const screenEnd = worldToScreen({ x, y: bottomRight.y });
      
      majorVerticals.push({
        x1: screenStart.x,
        y1: screenStart.y,
        x2: screenEnd.x,
        y2: screenEnd.y,
        key: `major-v-${x}`,
      });
    }
    
    // Líneas principales horizontales
    const majorHorizontals = [];
    for (let y = startY; y <= endY; y += gridSpacing) {
      const screenStart = worldToScreen({ x: topLeft.x, y });
      const screenEnd = worldToScreen({ x: bottomRight.x, y });
      
      majorHorizontals.push({
        x1: screenStart.x,
        y1: screenStart.y,
        x2: screenEnd.x,
        y2: screenEnd.y,
        key: `major-h-${y}`,
      });
    }
    
    // Líneas secundarias (solo si el zoom es suficiente)
    const minorLines = [];
    
    // Determinar si se deben mostrar líneas secundarias basado en el zoom
    // Mostrar subdivisiones solo cuando el espaciado en pantalla sea mayor a 20px
    const screenSpacing = Math.abs(
      worldToScreen({ x: 0, y: 0 }).x - worldToScreen({ x: gridSpacing, y: 0 }).x
    );
    
    if (screenSpacing > 50) {
      // Subgrids verticales
      for (let x = startX; x <= endX; x += minorSpacing) {
        // Saltear líneas que coinciden con las principales
        if (Math.abs(x % gridSpacing) < 0.001) continue;
        
        const screenStart = worldToScreen({ x, y: topLeft.y });
        const screenEnd = worldToScreen({ x, y: bottomRight.y });
        
        minorLines.push({
          x1: screenStart.x,
          y1: screenStart.y,
          x2: screenEnd.x,
          y2: screenEnd.y,
          key: `minor-v-${x}`,
        });
      }
      
      // Subgrids horizontales
      for (let y = startY; y <= endY; y += minorSpacing) {
        // Saltear líneas que coinciden con las principales
        if (Math.abs(y % gridSpacing) < 0.001) continue;
        
        const screenStart = worldToScreen({ x: topLeft.x, y });
        const screenEnd = worldToScreen({ x: bottomRight.x, y });
        
        minorLines.push({
          x1: screenStart.x,
          y1: screenStart.y,
          x2: screenEnd.x,
          y2: screenEnd.y,
          key: `minor-h-${y}`,
        });
      }
    }
    
    return {
      majorVerticals,
      majorHorizontals,
      minorLines,
    };
  }, [
    topLeft, 
    bottomRight, 
    gridSpacing, 
    minorSpacing, 
    worldToScreen, 
    viewport.scale
  ]);
  
  // Memorizar las etiquetas de la cuadrícula
  const gridLabels = useMemo(() => {
    if (!settings.showLabels) return [];
    
    const labels = [];
    const labelPadding = 5;
    
    // Determinar rangos para etiquetas
    const startX = Math.floor(topLeft.x / gridSpacing) * gridSpacing;
    const endX = Math.ceil(bottomRight.x / gridSpacing) * gridSpacing;
    const startY = Math.floor(topLeft.y / gridSpacing) * gridSpacing;
    const endY = Math.ceil(bottomRight.y / gridSpacing) * gridSpacing;
    
    // Etiquetas en el eje X
    for (let x = startX; x <= endX; x += gridSpacing) {
      if (Math.abs(x) < 0.001) continue; // Evitar etiqueta en 0
      
      const screenPos = worldToScreen({ x, y: 0 });
      
      // Solo mostrar etiquetas si están en el viewport
      if (
        screenPos.x >= 0 && 
        screenPos.x <= viewport.width && 
        screenPos.y >= 0 && 
        screenPos.y <= viewport.height
      ) {
        labels.push({
          x: screenPos.x,
          y: screenPos.y + labelPadding,
          text: formatNumber(x),
          key: `label-x-${x}`,
        });
      }
    }
    
    // Etiquetas en el eje Y
    for (let y = startY; y <= endY; y += gridSpacing) {
      if (Math.abs(y) < 0.001) continue; // Evitar etiqueta en 0
      
      const screenPos = worldToScreen({ x: 0, y });
      
      // Solo mostrar etiquetas si están en el viewport
      if (
        screenPos.x >= 0 && 
        screenPos.x <= viewport.width && 
        screenPos.y >= 0 && 
        screenPos.y <= viewport.height
      ) {
        labels.push({
          x: screenPos.x + labelPadding,
          y: screenPos.y,
          text: formatNumber(y),
          key: `label-y-${y}`,
        });
      }
    }
    
    return labels;
  }, [
    topLeft, 
    bottomRight, 
    gridSpacing, 
    worldToScreen, 
    viewport, 
    settings.showLabels
  ]);
  
  // Calcular posición de los ejes
  const axes = useMemo(() => {
    if (!settings.showAxes) return null;
    
    // Eje X
    const xAxisStart = worldToScreen({ x: topLeft.x, y: 0 });
    const xAxisEnd = worldToScreen({ x: bottomRight.x, y: 0 });
    
    // Eje Y
    const yAxisStart = worldToScreen({ x: 0, y: topLeft.y });
    const yAxisEnd = worldToScreen({ x: 0, y: bottomRight.y });
    
    return {
      xAxis: {
        x1: xAxisStart.x,
        y1: xAxisStart.y,
        x2: xAxisEnd.x,
        y2: xAxisEnd.y,
      },
      yAxis: {
        x1: yAxisStart.x,
        y1: yAxisStart.y,
        x2: yAxisEnd.x,
        y2: yAxisEnd.y,
      },
    };
  }, [topLeft, bottomRight, worldToScreen, settings.showAxes]);
  
  return (
    <g className="grid-renderer">
      {/* Líneas secundarias */}
      {gridLines.minorLines.map((line) => (
        <line
          key={line.key}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          className="grid-line minor-line"
          stroke={settings.minorLineColor}
        />
      ))}
      
      {/* Líneas principales */}
      {gridLines.majorVerticals.map((line) => (
        <line
          key={line.key}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          className="grid-line major-line"
          stroke={settings.majorLineColor}
        />
      ))}
      
      {gridLines.majorHorizontals.map((line) => (
        <line
          key={line.key}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          className="grid-line major-line"
          stroke={settings.majorLineColor}
        />
      ))}
      
      {/* Ejes X e Y */}
      {axes && settings.showAxes && (
        <>
          <line
            x1={axes.xAxis.x1}
            y1={axes.xAxis.y1}
            x2={axes.xAxis.x2}
            y2={axes.xAxis.y2}
            className="axis-line x-axis"
            stroke={settings.axisXColor}
            strokeWidth={2}
          />
          <line
            x1={axes.yAxis.x1}
            y1={axes.yAxis.y1}
            x2={axes.yAxis.x2}
            y2={axes.yAxis.y2}
            className="axis-line y-axis"
            stroke={settings.axisYColor}
            strokeWidth={2}
          />
        </>
      )}
      
      {/* Etiquetas */}
      {settings.showLabels && gridLabels.map((label) => (
        <text
          key={label.key}
          x={label.x}
          y={label.y}
          className="grid-label"
          fill={settings.labelColor}
          fontSize={settings.labelFontSize}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {label.text}
        </text>
      ))}
      
      {/* Origen (0,0) */}
      {settings.showAxes && (
        <g className="origin-point">
          <circle
            cx={worldToScreen({ x: 0, y: 0 }).x}
            cy={worldToScreen({ x: 0, y: 0 }).y}
            r={3}
            fill="#000000"
          />
          <text
            x={worldToScreen({ x: 0, y: 0 }).x + 10}
            y={worldToScreen({ x: 0, y: 0 }).y - 10}
            fontSize={settings.labelFontSize}
            fill={settings.labelColor}
          >
            (0,0)
          </text>
        </g>
      )}
    </g>
  );
};

export default GridRenderer;