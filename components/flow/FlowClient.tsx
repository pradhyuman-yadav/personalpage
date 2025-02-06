"use client";

import React from "react";
import { useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  ReactFlowProvider,
} from "reactflow";

import { AnnotationNode } from "@/components/flow/annotation-node";
import { ButtonEdge } from "@/components/flow/button-edge";
import initialElements from "@/components/flow/initial-elements";

import "reactflow/dist/style.css";

const nodeTypes = {
  annotation: AnnotationNode,
};

const edgeTypes = {
  button: ButtonEdge,
};

function Flow() {
  const [nodes, , onNodesChange] = useNodesState(initialElements.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialElements.edges);

  const onConnect = useCallback((connection: Edge | Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, [setEdges]);

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
      <Background color="#E6E6E6" />
    </ReactFlow>
  );
}

interface FlowClientProps {
  [key: string]: unknown;
}

/**
 * FlowClient component renders a flow diagram using ReactFlowProvider.
 *
 * @param {FlowClientProps} props - The properties passed to the FlowClient component.
 * @returns {JSX.Element} The rendered FlowClient component.
 */
function FlowClient(props: FlowClientProps) {
  return (
    <div className="w-full h-lvh">
      <ReactFlowProvider>
        <Flow {...props} />
      </ReactFlowProvider>
    </div>
  );
}

export default FlowClient;
