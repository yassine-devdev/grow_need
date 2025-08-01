export type CanvasElementType = 'shape' | 'text' | 'image';
export type ShapeType = 'rect' | 'circle' | 'triangle' | 'star';
export type TextAlign = 'left' | 'center' | 'right';

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  groupId?: string;
  isVisible: boolean;
  isLocked: boolean;
  opacity: number;
  
  // Shape properties
  shapeType?: ShapeType;
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;

  // Text properties
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  fontFamily?: string;
  textAlign?: TextAlign;
  
  // Image properties
  src?: string;
}

export interface Page {
  id: string;
  name?: string;
  elements: CanvasElement[];
  backgroundColor: string;
}

export interface DesignState {
  pages: Page[];
  activePageId: string;
  selectedElementIds: string[];
  zoom: number;
  pan: { x: number; y: number };
}

export interface Project {
    id: string;
    name: string;
    data: DesignState;
    lastModified: string;
}