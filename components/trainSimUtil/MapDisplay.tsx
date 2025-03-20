// app/components/trainSimUtil/MapDisplay.tsx
import React, { useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface MapDisplayProps {
  stations: {
    id: string;
    name: string;
    x: number;
    y: number;
    current_passengers: number;
    is_surging?: boolean;
  }[];
  trains: {
    id: string;
    position_x: number;
    position_y: number;
    status: string;
    line_id: string;
    current_station_id: string | null;
    next_station_id: string | null;
    current_passengers: number;
    current_speed: number;
    current_route_id: string | null;
    current_schedule_id: string | null;
  }[];
  surgeEvents: {
    id: string;
    target_station_ids: string[];
    start_time: number;
    duration: number;
    passenger_multiplier: number;
  }[];
  routes: {
    id: string;
    line_id: string;
    name: string;
    direction: string;
    station_order: string[];
  }[];
  lines: {
    id: string;
    name: string;
    color: string;
  }[];
  onDeleteStation?: (stationId: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onStationClick?: (station: any) => void;
}

// Custom Node for Stations (Example)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StationNode: React.FC<any> = ({ data }) => {
  return (
    <div
      className={`p-2 rounded-md border-2 ${
        data.is_surging ? 'border-red-500 bg-red-100' : 'border-blue-500 bg-blue-100'
      }`}
    >
      <div>{data.name}</div>
      <div>Passengers: {data.current_passengers}</div>
      {/* Add more station details here */}
    </div>
  );
};

const nodeTypes = {
  stationNode: StationNode, // Register the custom node type
};

const MapDisplay: React.FC<MapDisplayProps> = ({
  stations,
  routes,
  lines,
  onStationClick,
}) => {
  // --- Transform data for React Flow ---
  const initialNodes: Node[] = stations.map((station) => ({
    id: station.id,
    type: 'stationNode', // Use the custom node type
    position: { x: station.x, y: station.y },
    data: {
      ...station, // Pass all station data to the node
      label: station.name,
      isConnectable: true,
    },
    style: { width: 150, fontSize: 12 }, //Basic style.
  }));

    const initialEdges: Edge[] = routes.flatMap((route) => {
        const line = lines.find((l) => l.id === route.line_id);
        const lineColor = line ? line.color : 'gray';

        return route.station_order
            .map((stationId, index) => {
                if (index < route.station_order.length - 1) {
                    const nextStationId = route.station_order[index + 1];
                    return {
                        id: `edge-${route.id}-${stationId}-${nextStationId}`,
                        source: stationId,
                        target: nextStationId,
                        animated: true as boolean, // Animate the edge to show train movement
                        style: { stroke: lineColor, strokeWidth: 2 },
                        type: 'smoothstep', // You can change edge type (straight, step, smoothstep)
                        // Add train data here (e.g., train ID) if needed for edge styling/interaction
                    };
                }
                return null;
            });
    }).filter((edge): unknown => edge !== null) as Edge[]; // Filter out null values, and add type assertion

  const [nodes] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

    const handleNodeClick: NodeMouseHandler = (event, node) => {
        if (onStationClick) {
            const stationData = stations.find((s) => s.id === node.id);
            if (stationData) {
                onStationClick(stationData);
            }
        }
    };



  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes} // Pass the custom node types
        onNodeClick={handleNodeClick}
        fitView
        proOptions={{ hideAttribution: true }} //Add this to remove the reactflow attribution.
      >
        <Controls />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default MapDisplay;