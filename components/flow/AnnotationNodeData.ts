// AnnotationNodeData.ts

export type AnnotationNodeData = {
  label: string;
  arrowStyle: {
    right: number;
    bottom: number;
    transform: string;
  };
  position?: { x: number; y: number };
  // level?: number;
  // arrow?: string;
  // arrowStyle?: CSSProperties;
};
