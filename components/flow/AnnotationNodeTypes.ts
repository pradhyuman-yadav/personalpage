// AnnotationNodeTypes.ts
import { Node } from "@xyflow/react";
import { AnnotationNodeData } from "@/components/flow/AnnotationNodeData";

// This means that the node’s data will be AnnotationNodeData
export type AnnotationNodeType = Node<AnnotationNodeData, string>;
