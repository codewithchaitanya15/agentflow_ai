import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './CustomNode';
import { useWorkflowStore } from '../../store/workflowStore';

export default function WorkflowCanvas({ className = '', onExecute, isExecuting = false }) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    selectedNode,
    setSelectedNode
  } = useWorkflowStore();

  const nodeTypes = useMemo(() => ({ customNode: CustomNode }), []);

  const onNodeClick = useCallback(
    (_, node) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const rawData = event.dataTransfer.getData('application/reactflow-node');
      if (!rawData) return;

      try {
        const item = JSON.parse(rawData);
        const reactFlowBounds = event.currentTarget.getBoundingClientRect();
        const position = {
          x: event.clientX - reactFlowBounds.left - 120,
          y: event.clientY - reactFlowBounds.top - 40
        };

        addNode(item, position);
      } catch (err) {
        console.error('Failed to parse dropped node', err);
      }
    },
    [addNode]
  );

  return (
    <div className={`w-full h-full relative bg-background ${className}`} onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[20, 20]}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 }
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="rgba(255, 255, 255, 0.08)"
        />
        <Controls
          showInteractive={false}
          className="bg-surface border border-border text-slate-300 rounded-xl"
        />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(n) => {
            if (n.data?.category === 'trigger') return '#6366f1';
            if (n.data?.category === 'ai') return '#c084fc';
            if (n.data?.category === 'action') return '#06b6d4';
            if (n.data?.category === 'logic') return '#10b981';
            return '#64748b';
          }}
          maskColor="rgba(9, 13, 22, 0.75)"
          className="bg-surface border border-border rounded-xl hidden sm:block"
        />
      </ReactFlow>
    </div>
  );
}
