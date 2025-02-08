"use client";

import React from "react";
import { useCallback } from "react";
import {
  ReactFlow,
  addEdge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Edge,
  Connection,
  ReactFlowProvider,
  NodeTypes,
  NodeProps,
  MarkerType, // Import MarkerType
} from "@xyflow/react";

import { AnnotationNode } from "@/components/flow/annotation-node";
import { AnnotationNodeType } from "@/components/flow/AnnotationNodeTypes";
import { ButtonEdge } from "@/components/flow/button-edge";
import initialElements from "@/components/flow/initial-elements";

import '@xyflow/react/dist/style.css';

const nodeTypes: NodeTypes = {
  annotation: AnnotationNode as React.FC<NodeProps<AnnotationNodeType>>,
};

const edgeTypes = {
  button: ButtonEdge,
};

function Flow() {
  const [nodes, , onNodesChange] = useNodesState(initialElements.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialElements.edges);

  const onConnect = useCallback(
    (connection: Edge | Connection) => {
      setEdges((eds) =>
        addEdge(connection, eds).map((edge) => {
          // Destructure out the style property so it is not carried over
          const { style, ...rest } = edge;
          console.log("style", style);
          return {
            ...rest,
            label: String(edge.label ?? ""),
            type: edge.type ?? "default",
            animated: edge.animated ?? false,
            markerEnd: edge.markerEnd
              ? typeof edge.markerEnd === "string"
                ? { type: edge.markerEnd as MarkerType }
                : edge.markerEnd
              : { type: MarkerType.ArrowClosed },
          };
        })
      );
    },
    [setEdges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      attributionPosition="top-right"
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
    >
      <Controls />
      {/* <Background color="#E6E6E6" /> */}
      <Background color="#9CA3AF" gap={12} size={1}/>
    </ReactFlow>
  );
}

interface FlowClientProps {
  [key: string]: unknown;
}

function FlowClient(props: FlowClientProps) {
  return (
    <div className="w-full h-screen">
      <ReactFlowProvider>
        <Flow {...props} />
      </ReactFlowProvider>
    </div>
  );
}

export default FlowClient;
