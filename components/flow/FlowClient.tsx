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
  useNodes,
} from "reactflow";

import { AnnotationNode } from "@/components/flow/annotation-node";
import { ButtonEdge } from "@/components/flow/button-edge";
import {
  nodes as initialNodes,
  edges as initialEdges,
} from "@/components/flow/initial-elements";

import "reactflow/dist/style.css";

const nodeTypes = {
  annotation: AnnotationNode,
};

const edgeTypes = {
  button: ButtonEdge,
};

interface NodeData {
  level?: number;
  label: string;
  arrowStyle?: {
    right: number;
    bottom: number;
    transform: string;
    left?: number;
  };
}

interface Node {
  id: string;
  type: string;
  data: NodeData;
  position: { x: number; y: number };
  draggable?: boolean;
  selectable?: boolean;
  style?: React.CSSProperties;
  parentId?: string;
  extent?: string;
}

const nodeClassName = (node: Node): string => node.type;

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((connection: Edge | Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);

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

function FlowClient(props: any) {
  return (
    <div className="w-full h-lvh">
      <ReactFlowProvider>
        <Flow {...props} />
      </ReactFlowProvider>
    </div>
  );
}

export default FlowClient;
