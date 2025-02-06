// AnnotationNodeData.ts
import { CSSProperties } from "react";

export type AnnotationNodeData = {
  label: React.ReactNode;
  level?: number;
  arrow?: string;
  arrowStyle?: CSSProperties;
};