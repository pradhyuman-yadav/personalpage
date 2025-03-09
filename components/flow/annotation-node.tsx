import { type NodeProps } from "@xyflow/react";
import { AnnotationNodeType } from "./AnnotationNodeTypes";

export const AnnotationNode: React.FC<NodeProps<AnnotationNodeType>> = ({
  data,
}) => {
  return (
    <>
      <div className={`annotation-content text-secondary-foreground`}>
        <div className="leading-snug">{data.label}</div>
        {data.arrowStyle && (
          <div className="annotation-arrow" style={data.arrowStyle}>
            ⤹
          </div>
        )}
      </div>
    </>
  );
};

AnnotationNode.displayName = "AnnotationNode";
