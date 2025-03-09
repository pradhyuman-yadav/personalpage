import * as React from "react";
import {
  MarkerType,
  Node,
  Edge,
  Position,
  Handle,
  NodeTypes,
  NodeProps,
} from "@xyflow/react";
import { projectsData, Project, annotationData } from "@/components/flow/projectData";
import TechIcon from "@/components/flow/TechIcon";
import dagre from "@dagrejs/dagre";
import { AnnotationNode } from "@/components/flow/annotation-node";
import { AnnotationNodeType } from "@/components/flow/AnnotationNodeTypes";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  nodesPerRow: number = 4
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "LR", ranksep: 50, nodesep: 50 }); // Add spacing

  // Separate project nodes and other nodes (like the header)
  const projectNodes = nodes.filter((node) => node.id.startsWith("project"));
  const otherNodes = nodes.filter((node) => !node.id.startsWith("project"));

  // Layout project nodes in rows
  projectNodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: typeof node.data?.width === "number" ? node.data.width : 150, // Use dynamic width if available
      height: typeof node.data?.height === "number" ? node.data.height : 50, // Use dynamic height
    });
  });

  // Add other nodes to the graph (e.g., header)
  otherNodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: typeof node.data?.width === "number" ? node.data.width : 150,
      height: typeof node.data?.height === "number" ? node.data.height : 50,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  let oldNodeId: string | dagre.Label | null = null;

  nodes.forEach((node, index) => {
    if (node.id.startsWith("project")) {
      const nodeWithPosition = dagreGraph.node(node.id);
      const col =
        200 * ((index-1) % nodesPerRow) +
        (oldNodeId == null ? 0 : dagreGraph.node(oldNodeId).width)*((index-1) % nodesPerRow);
      const row = Math.floor((index-1) / nodesPerRow) * 100 + 250;
      // console.log(row);

      // Set Handle positions for project nodes
      if (node.id.startsWith("project")) {
        node.targetPosition = Position.Left;
        node.sourcePosition = Position.Right;
      }

      // Check if nodeWithPosition and its properties are defined
      if (
        nodeWithPosition &&
        typeof nodeWithPosition.x === "number" &&
        typeof nodeWithPosition.y === "number"
      ) {
        node.position = {
          x: col,
          y: row,
        };
      } else {
        node.position = { x: 0, y: 0 };
        console.error(
          `Node ${node.id} has invalid position data from Dagre:`,
          nodeWithPosition
        );
      }
      oldNodeId = node.id;
    }
  });
  return { nodes, edges };
};

const ProjectNode: React.FC<{ data: Project }> = ({ data }) => {
  const {
    title,
    techStack,
    description,
    githubLink,
    liveLink,
    startDate,
    endDate,
  } = data;
  return (
    <HoverCard>
      <div className="relative">
        <Handle
          type="target"
          position={Position.Left}
          className="w-2 h-2 !bg-blue-500 absolute -left-1 top-1/2 -translate-y-1/2"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="w-2 h-2 !bg-blue-500 absolute -right-1 top-1/2 -translate-y-1/2"
        />

        <HoverCardTrigger asChild>
          <div className=" bg-sky-200 dark:bg-sky-100 border rounded-md p-2 cursor-pointer">
            <div className="flex items-center">
              <span className={"text-lg text-gray-950"}>{title}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {techStack.map((tech) => (
                <TechIcon key={tech} tech={tech} className="text-gray-950" />
              ))}
            </div>
            <div className="flex items-center">
              <strong className="text-xs text-gray-950">
                {startDate && endDate
                  ? `${startDate} - ${endDate}`
                  : startDate
                  ? `Started: ${startDate}`
                  : endDate
                  ? `Completed: ${endDate}`
                  : "Ongoing"}
              </strong>
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 z-[9999]">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">{title}</h4>
            <div className="flex flex-wrap gap-1">
              {techStack.map((tech) => (
                <TechIcon
                  key={tech}
                  tech={tech}
                  className="text-black dark:text-white"
                />
              ))}
            </div>
            <p className="text-sm">{description}</p>
            <div className="flex gap-2 pt-2">
              {githubLink && (
                <Button asChild variant="outline" size="icon">
                  <a
                    href={githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    <TechIcon
                      key={"Github"}
                      tech={"Github"}
                      className="h-4 w-4 text-black dark:text-white"
                    />
                  </a>
                </Button>
              )}
              {liveLink && (
                <Button asChild variant="outline" size="icon">
                  <a
                    href={liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    <TechIcon
                      key={"Link"}
                      tech={"Link"}
                      className="h-4 w-4 text-black dark:text-white"
                    />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </HoverCardContent>
      </div>
    </HoverCard>
  );
};

const projectNodes: Node[] = projectsData.map((project) => ({
  id: project.id,
  type: "custom",
  position: { x: 0, y: 0 },
  data: project as unknown as Record<string, unknown>, // Cast the project data
  className: "project-node",
}));

const annotationNodes: Node[] = annotationData.map((project, index) => ({
  id: `annotation-${index}`,
  type: "annotation",
  draggable: false,
  selectable: false,
  position: { x: project?.position?.x || 0, y: project?.position?.y || 0 },
  data: {
    // label: (
    //     <div className="rounded-lg p-1 text-sm border">
    //         <div className="flex items-center justify-center">
    //             <span className="text-gray-950">{"H"}</span>
    //         </div>
    //     </div>
    // ),
    // arrowStyle: { display: "none" },
  },
}));

const projectEdges: Edge[] = [];
for (let i = 0; i < projectsData.length - 1; i++) {
  projectEdges.push({
    id: `edge-${projectsData[i].id}-${projectsData[i + 1].id}`,
    source: projectsData[i].id,
    target: projectsData[i + 1].id,
    type: "smoothstep",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
  });
}

const initialNodes: Node[] = [
  {
    id: "timeline-header",
    type: "annotation",
    draggable: false,
    selectable: false,
    data: {
      label: (
        <div className={"text-9xl font-bold text-center whitespace-nowrap"}>
          Projects
        </div>
      ),
      arrowStyle: { display: "none" },
    },
    position: { x: 0, y: 0 },
  },
  ...projectNodes,
  ...annotationNodes,
];

const initialEdges: Edge[] = [...projectEdges];

const nodeTypes: NodeTypes = {
  annotation: AnnotationNode as React.FC<NodeProps<AnnotationNodeType>>,
  custom: ProjectNode,
};

const { nodes, edges } = getLayoutedElements(initialNodes, initialEdges);
const initialElements = { nodes: nodes, edges: edges, nodeTypes };
export default initialElements;
