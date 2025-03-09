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
  MarkerType,
  MiniMap,
} from "@xyflow/react";
import { ButtonEdge } from "@/components/flow/button-edge";
import initialElements from "@/components/flow/initial-elements";

import '@xyflow/react/dist/style.css';



const edgeTypes = {
  button: ButtonEdge,
};

// const nodeClassName = (node: any) => node.type;

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
      attributionPosition="bottom-left"
      nodeTypes={initialElements.nodeTypes}
      edgeTypes={edgeTypes}
      fitView
    >
      <Controls />
      <MiniMap />
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
