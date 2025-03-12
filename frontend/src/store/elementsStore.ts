import { create } from 'zustand';
import { Element, LineElement, PolylineElement, RectangleElement, CircleElement, Layer } from '@/types/elements';
import { Point } from '@/types/geometry';
import { generateId } from '@/utils/helpers';

interface ElementsState {
  elements: Record<string, Element>;
  layers: Record<string, Layer>;
  activeLayerId: string;
  selectedElementIds: string[];

  // Elementos
  addElement: (element: Omit<Element, 'id'>) => string;
  updateElement: (id: string, updates: Partial<Element>) => void;
  removeElement: (id: string) => void;
  removeElements: (ids: string[]) => void;

  // Selección
  selectElement: (id: string) => void;
  deselectElement: (id: string) => void;
  selectElements: (ids: string[]) => void;
  deselectElements: (ids: string[]) => void;
  selectAll: () => void;
  deselectAll: () => void;

  // Capas
  addLayer: (layer: Omit<Layer, 'id'>) => string;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  setActiveLayer: (id: string) => void;
  getVisibleElements: () => Element[];

  // Helpers
  getElementById: (id: string) => Element | undefined;
  getElementsByLayer: (layerId: string) => Element[];
  getElementsByType: <T extends Element>(type: T['type']) => T[];
}

/**
 * Genera estilos por defecto para un elemento basado en su capa
 */
const getDefaultStyle = (layerId: string, layers: Record<string, Layer>) => {
  const layer = layers[layerId];
  return {
    strokeColor: layer?.color || '#000000',
    strokeWidth: 1,
    lineType: 'solid',
    fillColor: 'none',
    fillOpacity: 0.5,
  };
};

// Capa por defecto
const defaultLayer: Layer = {
  id: 'default',
  name: 'Default',
  visible: true,
  locked: false,
  color: '#000000',
  order: 0,
};

// Estado inicial
const initialState = {
  elements: {},
  layers: {
    [defaultLayer.id]: defaultLayer
  },
  activeLayerId: defaultLayer.id,
  selectedElementIds: [],
};

/**
 * Store para la gestión de elementos y capas
 */
export const useElementsStore = create<ElementsState>((set, get) => ({
  ...initialState,

  /**
   * Añade un nuevo elemento y devuelve su ID
   */
  addElement: (element) => {
    const id = generateId();
    const layerId = element.layerId || get().activeLayerId;

    // Si el elemento tiene una propiedad geometry, extraer sus propiedades
    let finalElement: any = { ...element };
    if (element.geometry) {
      finalElement = {
        ...element,
        ...element.geometry
      };
    }

    const newElement = {
      ...finalElement,
      id,
      layerId,
      selected: false,
      locked: false,
      style: element.style || getDefaultStyle(layerId, get().layers),
      metadata: element.metadata || {},
    } as Element;

    set((state) => ({
      ...state,
      elements: {
        ...state.elements,
        [id]: newElement,
      },
    }));

    return id;
  },

  /**
   * Actualiza un elemento existente
   */
  updateElement: (id, updates) => {
    const element = get().elements[id];
    if (!element) return;

    // Si updates tiene una propiedad geometry, extraer sus propiedades
    let finalUpdates: any = { ...updates };
    if (updates.geometry) {
      finalUpdates = {
        ...updates,
        ...updates.geometry
      };
    }

    set((state) => ({
      ...state,
      elements: {
        ...state.elements,
        [id]: {
          ...element,
          ...finalUpdates,
        },
      },
    }));
  },

  /**
   * Elimina un elemento
   */
  removeElement: (id) => {
    set((state) => {
      const { [id]: _, ...remainingElements } = state.elements;
      return {
        ...state,
        elements: remainingElements,
        selectedElementIds: state.selectedElementIds.filter(eid => eid !== id),
      };
    });
  },

  /**
   * Elimina múltiples elementos
   */
  removeElements: (ids) => {
    set((state) => {
      const newElements = { ...state.elements };
      ids.forEach(id => {
        delete newElements[id];
      });

      return {
        ...state,
        elements: newElements,
        selectedElementIds: state.selectedElementIds.filter(id => !ids.includes(id)),
      };
    });
  },

  /**
   * Selecciona un elemento
   */
  selectElement: (id) => {
    const element = get().elements[id];
    if (!element || element.locked) return;

    set((state) => ({
      ...state,
      selectedElementIds: state.selectedElementIds.includes(id)
        ? state.selectedElementIds
        : [...state.selectedElementIds, id],
      elements: {
        ...state.elements,
        [id]: {
          ...element,
          selected: true,
        },
      },
    }));
  },

  /**
   * Deselecciona un elemento
   */
  deselectElement: (id) => {
    const element = get().elements[id];
    if (!element) return;

    set((state) => ({
      ...state,
      selectedElementIds: state.selectedElementIds.filter(eid => eid !== id),
      elements: {
        ...state.elements,
        [id]: {
          ...element,
          selected: false,
        },
      },
    }));
  },

  /**
   * Selecciona múltiples elementos
   */
  selectElements: (ids) => {
    const updates: Record<string, Element> = {};

    ids.forEach(id => {
      const element = get().elements[id];
      if (element && !element.locked) {
        updates[id] = {
          ...element,
          selected: true,
        };
      }
    });

    const validIds = Object.keys(updates);

    set((state) => ({
      ...state,
      selectedElementIds: [...new Set([...state.selectedElementIds, ...validIds])],
      elements: {
        ...state.elements,
        ...updates,
      },
    }));
  },

  /**
   * Deselecciona múltiples elementos
   */
  deselectElements: (ids) => {
    const updates: Record<string, Element> = {};

    ids.forEach(id => {
      const element = get().elements[id];
      if (element) {
        updates[id] = {
          ...element,
          selected: false,
        };
      }
    });

    set((state) => ({
      ...state,
      selectedElementIds: state.selectedElementIds.filter(id => !ids.includes(id)),
      elements: {
        ...state.elements,
        ...updates,
      },
    }));
  },

  /**
   * Selecciona todos los elementos visibles y desbloqueados
   */
  selectAll: () => {
    const visibleElements = get().getVisibleElements();
    const selectableIds = visibleElements
      .filter(element => !element.locked)
      .map(element => element.id);

    get().selectElements(selectableIds);
  },

  /**
   * Deselecciona todos los elementos
   */
  deselectAll: () => {
    const { selectedElementIds } = get();
    get().deselectElements(selectedElementIds);
  },

  /**
   * Añade una nueva capa y devuelve su ID
   */
  addLayer: (layer) => {
    const id = generateId();

    const newLayer: Layer = {
      ...layer,
      id,
    };

    set((state) => ({
      ...state,
      layers: {
        ...state.layers,
        [id]: newLayer,
      },
    }));

    return id;
  },

  /**
   * Actualiza una capa existente
   */
  updateLayer: (id, updates) => {
    const layer = get().layers[id];
    if (!layer) return;

    set((state) => ({
      ...state,
      layers: {
        ...state.layers,
        [id]: {
          ...layer,
          ...updates,
        },
      },
    }));
  },

  /**
   * Elimina una capa y mueve sus elementos a la capa por defecto
   */
  removeLayer: (id) => {
    if (id === 'default') return; // No se puede eliminar la capa por defecto

    // Obtener elementos de la capa a eliminar
    const elementsInLayer = get().getElementsByLayer(id);

    // Actualizar los elementos a la capa por defecto
    const elementUpdates: Record<string, Element> = {};
    elementsInLayer.forEach(element => {
      elementUpdates[element.id] = {
        ...element,
        layerId: 'default',
      };
    });

    set((state) => {
      const { [id]: _, ...remainingLayers } = state.layers;

      // Si la capa activa es la que se está eliminando, cambiar a la capa por defecto
      const newActiveLayerId = state.activeLayerId === id
        ? 'default'
        : state.activeLayerId;

      return {
        ...state,
        layers: remainingLayers,
        activeLayerId: newActiveLayerId,
        elements: {
          ...state.elements,
          ...elementUpdates,
        },
      };
    });
  },

  /**
   * Establece la capa activa
   */
  setActiveLayer: (id) => {
    const layer = get().layers[id];
    if (!layer) return;

    set((state) => ({
      ...state,
      activeLayerId: id
    }));
  },

  /**
   * Obtiene todos los elementos visibles
   */
  getVisibleElements: () => {
    const { elements, layers } = get();

    return Object.values(elements).filter(element => {
      const layer = layers[element.layerId];
      return layer && layer.visible;
    });
  },

  /**
   * Obtiene un elemento por su ID
   */
  getElementById: (id) => {
    return get().elements[id];
  },

  /**
   * Obtiene todos los elementos de una capa
   */
  getElementsByLayer: (layerId) => {
    const { elements } = get();

    return Object.values(elements).filter(element =>
      element.layerId === layerId
    );
  },

  /**
   * Obtiene todos los elementos de un tipo específico
   */
  getElementsByType: <T extends Element>(type: T['type']) => {
    const { elements } = get();

    return Object.values(elements).filter(element =>
      element.type === type
    ) as T[];
  },
}));