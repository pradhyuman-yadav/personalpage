import { type NodeProps} from "@xyflow/react";
import { AnnotationNodeType } from "./AnnotationNodeTypes";

export const AnnotationNode: React.FC<NodeProps<AnnotationNodeType>> = ({
  data,
  selected,
}) => {
  return (
    <div
      className={`annotation-content flex max-w-[180px] items-start p-2 text-sm text-secondary-foreground ${
        selected ? "border border-blue-500" : ""
      }`}
    >
      {data.level !== undefined && (
        <div className="mr-1 leading-snug annotation-level">{data.level}.</div>
      )}
      <div className="leading-snug">{data.label}</div>
      {data.arrowStyle && (
        <div className="annotation-arrow" style={data.arrowStyle}>
          ⤹
        </div>
      )}
    </div>
  );
};

AnnotationNode.displayName = "AnnotationNode";
