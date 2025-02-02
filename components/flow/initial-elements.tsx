import React from 'react';
import { MarkerType } from '@xyflow/react';

export const nodes = [
  // ─── Timeline Header ──────────────────────────────────────────────
  {
    id: 'timeline-header',
    type: 'annotation',
    draggable: false,
    selectable: false,
    data: {
      label: (
        <div className="text-3xl font-bold text-center whitespace-nowrap">
          Projects
        </div>
      ),
      arrowStyle: { display: 'none' },
    },
    position: { x: 720, y: 20 },
  },

  // ─── Project A ──────────────────────────────────────────────────────
  {
    id: 'project-A',
    type: 'default', // basic node style
    data: { label: 'Portfolio Website' },
    position: { x: 100, y: 300 },
    // Optionally add Tailwind classes via your custom node renderer
    className: "p-2",
  },
  {
    id: 'annotation-A',
    type: 'annotation',
    draggable: false,
    selectable: false,
    data: {
      label: (
        <div className="rounded-lg p-3 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <span role="img" aria-label="Calendar">📅</span>
            <strong>Jan 2016</strong>
          </div>
          <div className="mt-1 text-center">
            Portfolio Website <span role="img" aria-label="Globe">🌐</span>
            <br />
            <span className="italic text-gray-600">HTML, CSS, JS</span>
          </div>
        </div>
      ),
      // Adjust the transform to anchor the annotation to the edge
      arrowStyle: { top: 0, left: 0, transform: 'translate(20px, 80px)' },
    },
    position: { x: 100, y: 120 },
  },

  // ─── Project B ──────────────────────────────────────────────────────
  {
    id: 'project-B',
    type: 'default',
    data: { label: 'Blog Platform' },
    position: { x: 300, y: 300 },
    className: "p-2",
  },
  {
    id: 'annotation-B',
    type: 'annotation',
    draggable: false,
    selectable: false,
    data: {
      label: (
        <div className="rounded-lg p-3 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <span role="img" aria-label="Calendar">📅</span>
            <strong>May 2017</strong>
          </div>
          <div className="mt-1 text-center">
            Blog Platform <span role="img" aria-label="Memo">📝</span>
            <br />
            <span className="italic text-gray-600">React, Node.js</span>
          </div>
        </div>
      ),
      arrowStyle: { top: 0, left: 0, transform: 'translate(20px, 80px)' },
    },
    position: { x: 300, y: 120 },
  },

  // ─── Project C ──────────────────────────────────────────────────────
  {
    id: 'project-C',
    type: 'default',
    data: { label: 'E-commerce App' },
    position: { x: 500, y: 300 },
    className: "p-2",
  },
  {
    id: 'annotation-C',
    type: 'annotation',
    draggable: false,
    selectable: false,
    data: {
      label: (
        <div className="rounded-lg p-3 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <span role="img" aria-label="Calendar">📅</span>
            <strong>Dec 2017</strong>
          </div>
          <div className="mt-1 text-center">
            E-commerce App <span role="img" aria-label="Cart">🛒</span>
            <br />
            <span className="italic text-gray-600">React, MongoDB</span>
          </div>
        </div>
      ),
      arrowStyle: { top: 0, left: 0, transform: 'translate(20px, 80px)' },
    },
    position: { x: 500, y: 120 },
  },

  // ─── Project D ──────────────────────────────────────────────────────
  {
    id: 'project-D',
    type: 'default',
    data: { label: 'Data Viz Dashboard' },
    position: { x: 700, y: 300 },
    className: "p-2",
  },
  {
    id: 'annotation-D',
    type: 'annotation',
    draggable: false,
    selectable: false,
    data: {
      label: (
        <div className="rounded-lg p-3 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <span role="img" aria-label="Calendar">📅</span>
            <strong>Mar 2018</strong>
          </div>
          <div className="mt-1 text-center">
            Data Viz Dashboard <span role="img" aria-label="Chart">📊</span>
            <br />
            <span className="italic text-gray-600">D3.js, React</span>
          </div>
        </div>
      ),
      arrowStyle: { bottom: 0, left: 0, transform: 'translate(5px, 25px) scale(1, -1) rotate(100deg)' },
    },
    position: { x: 700, y: 120 },
  },
];

export const edges = [
  // ─── Connect Projects Sequentially ────────────────────────────────
  {
    id: 'edge-A-B',
    source: 'project-A',
    target: 'project-B',
    type: 'smoothstep',
    animated: true,
    label: 'edge',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'edge-B-C',
    source: 'project-B',
    target: 'project-C',
    type: 'smoothstep',
    animated: true,
    label: 'edge',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'edge-C-D',
    source: 'project-C',
    target: 'project-D',
    type: 'smoothstep',
    animated: true,
    label: 'edge',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];

export default { nodes, edges };
