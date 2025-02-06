import React, { ReactNode } from "react";
import { MarkerType } from "@xyflow/react";

export const nodes = [
  // ─── Timeline Header ──────────────────────────────────────────────
  {
    id: "timeline-header",
    type: "annotation",
    draggable: false,
    selectable: false,
    data: {
      label: (
        <div className="text-3xl font-bold text-center whitespace-nowrap">
          Projects
        </div>
      ),
      arrowStyle: { display: "none", },
    },
    position: { x: 720, y: 20 },
  },

  // ─── Project A ──────────────────────────────────────────────────────
  {
    id: "project-A",
    type: "default",
    data: {
      label: <div>Portfolio Website</div>,
      arrowStyle: { display: "none" } // Changed to JSX
    },
    position: { x: 100, y: 200 },
    className: "p-2 text-black dark:text-black",
  },
  {
    id: "annotation-A",
    type: "annotation",
    draggable: false,
    selectable: false,
    data: {
      label: (
        <div className="rounded-lg p-3 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <span role="img" aria-label="Calendar">
              📅
            </span>
            <strong>Jan 2025</strong>
          </div>
        </div>
      ),
      // Adjust the transform to anchor the annotation to the edge
      arrowStyle: { display: "none",},
    },
    position: { x: 100, y: 120 },
  },

  // ─── Project B ──────────────────────────────────────────────────────
  {
    id: "project-B",
    type: "default",
    data: {
      label: <div>JobMatch Automator</div>,
      arrowStyle: { display: "none" } // Changed to JSX
    },
    position: { x: 300, y: 200 },
    className: "p-2 text-black dark:text-black",
  },
  {
    id: "annotation-B",
    type: "annotation",
    draggable: false,
    selectable: false,
    data: {
      label: (
        <div className="rounded-lg p-3 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <span role="img" aria-label="Calendar">
              📅
            </span>
            <strong>May 2024</strong>
          </div>
        </div>
      ),
      arrowStyle: { display: "none",},
    },
    position: { x: 300, y: 120 },
  },

  // ─── Project C ──────────────────────────────────────────────────────
  {
    id: "project-C",
    type: "default",
    data: { label: <div>Trading with ML</div>, arrowStyle: { display: "none" } }, // Removed quotes
    position: { x: 500, y: 200 },
    className: "p-2 text-black dark:text-black",
  },
  {
    id: "annotation-C",
    type: "annotation",
    draggable: false,
    selectable: false,
    data: {
      label: (
        <div className="rounded-lg p-3 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <span role="img" aria-label="Calendar">
              📅
            </span>
            <strong>Dec 2024</strong>
          </div>
        </div>
      ),
      arrowStyle: { display: "none",},
    },
    position: { x: 500, y: 120 },
  },

  // ─── Project D ──────────────────────────────────────────────────────
  {
    id: "project-D",
    type: "default",
    data: { label: <div>Full Body Mo-Cap</div>, arrowStyle: { display: "none" } }, // Removed quotes
    position: { x: 700, y: 200 },
    className: "p-2 text-black dark:text-black",
  },
  {
    id: "annotation-D",
    type: "annotation",
    draggable: false,
    selectable: false,
    data: {
      label: (
        <div className="rounded-lg p-3 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <span role="img" aria-label="Calendar">
              📅
            </span>
            <strong>Mar 2018</strong>
          </div>
        </div>
      ),
      arrowStyle: { display: "none",},
    },
    position: { x: 700, y: 120 },
  },
  // ─── Project E ──────────────────────────────────────────────────────
  {
    id: "project-E",
    type: "default",
    data: { label: <div>AI Roommate Assistant</div>, arrowStyle: { display: "none" } }, // Removed quotes
    position: { x: 700, y: 300 },
    className: "p-2 text-black dark:text-black",
  },
  {
    id: "annotation-E",
    type: "annotation",
    draggable: false,
    selectable: false,
    data: {
      label: (
        <div className="rounded-lg p-3 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <span role="img" aria-label="Calendar">
              📅
            </span>
            <strong>Sep 2023</strong>
          </div>
        </div>
      ),
      arrowStyle: { display: "none",},
    },
    position: { x: 700, y: 370 },
  },

  // ─── Project F ──────────────────────────────────────────────────────
  {
    id: "project-F",
    type: "default",
    data: { label: <div>Wild Animal Detection</div>, arrowStyle: { display: "none" } }, // Removed quotes
    position: { x: 500, y: 300 },
    className: "p-2 text-black dark:text-black",
  },
  {
    id: "annotation-F",
    type: "annotation",
    draggable: false,
    selectable: false,
    data: {
      label: (
        <div className="rounded-lg p-3 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <span role="img" aria-label="Calendar">
              📅
            </span>
            <strong>Oct 2024</strong>
          </div>
        </div>
      ),
      arrowStyle: { display: "none",},
    },
    position: { x: 500, y: 370 },
  },

  // ─── Project G ──────────────────────────────────────────────────────
  {
    id: "project-G",
    type: "default",
    data: { label: <div>AI Instagram Model</div>, arrowStyle: { display: "none" } }, // Removed quotes
    position: { x: 300, y: 300 },
    className: "p-2 text-black dark:text-black",
  },
  {
    id: "annotation-G",
    type: "annotation",
    draggable: false,
    selectable: false,
    data: {
      label: (
        <div className="rounded-lg p-3 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <span role="img" aria-label="Calendar">
              📅
            </span>
            <strong>Jan 2025</strong>
          </div>
        </div>
      ),
      arrowStyle: {
        right: 0,
        bottom: 0,
        transform: "translate(-30px,10px) rotate(-80deg)",
      },
    },
    position: { x: 300, y: 370 },
  },
];

export const edges = [
  // ─── Connect Projects Sequentially ────────────────────────────────
  {
    id: "edge-A-B",
    source: "project-A",
    target: "project-B",
    type: "smoothstep",
    animated: true,
    label: "edge",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "edge-B-C",
    source: "project-B",
    target: "project-C",
    type: "smoothstep",
    animated: true,
    label: "edge",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "edge-C-D",
    source: "project-C",
    target: "project-D",
    type: "smoothstep",
    animated: true,
    label: "edge",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "edge-D-E",
    source: "project-D",
    target: "project-E",
    type: "smoothstep",
    animated: true,
    label: "edge",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "edge-E-F",
    source: "project-E",
    target: "project-F",
    type: "smoothstep",
    animated: true,
    label: "edge",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "edge-F-G",
    source: "project-F",
    target: "project-G",
    type: "smoothstep",
    animated: true,
    label: "edge",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];

const initialElements = { nodes: nodes, edges: edges };

export default initialElements;
