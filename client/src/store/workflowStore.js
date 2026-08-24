import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import api from '../lib/api';

export const useWorkflowStore = create((set, get) => ({
  currentWorkflow: null,
  nodes: [],
  edges: [],
  selectedNode: null,
  isDirty: false,
  isSaving: false,
  isGenerating: false,
  error: null,

  setWorkflow: (workflow) => {
    set({
      currentWorkflow: workflow,
      nodes: workflow?.nodes || [],
      edges: workflow?.edges || [],
      selectedNode: null,
      isDirty: false,
      error: null
    });
  },

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
      isDirty: true
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true
    });
  },

  onConnect: (connection) => {
    const newEdge = {
      ...connection,
      id: `e_${connection.source}_${connection.target}_${Date.now()}`,
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 }
    };
    set({
      edges: addEdge(newEdge, get().edges),
      isDirty: true
    });
  },

  addNode: (nodeCatalogItem, position = { x: 250, y: 200 }) => {
    const newNodeId = `node_${Date.now().toString().slice(-4)}`;
    const newNode = {
      id: newNodeId,
      type: 'customNode',
      position,
      data: {
        label: nodeCatalogItem.label,
        category: nodeCatalogItem.category,
        nodeType: nodeCatalogItem.nodeType,
        icon: nodeCatalogItem.icon,
        config: { ...nodeCatalogItem.defaultConfig },
        inputs: [...nodeCatalogItem.inputs],
        outputs: [...nodeCatalogItem.outputs]
      }
    };

    set({
      nodes: [...get().nodes, newNode],
      selectedNode: newNode,
      isDirty: true
    });
  },

  updateNodeConfig: (nodeId, newConfig) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          const updated = {
            ...node,
            data: {
              ...node.data,
              config: { ...node.data.config, ...newConfig }
            }
          };
          if (get().selectedNode?.id === nodeId) {
            set({ selectedNode: updated });
          }
          return updated;
        }
        return node;
      }),
      isDirty: true
    });
  },

  updateNodeLabel: (nodeId, label) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          const updated = {
            ...node,
            data: {
              ...node.data,
              label
            }
          };
          if (get().selectedNode?.id === nodeId) {
            set({ selectedNode: updated });
          }
          return updated;
        }
        return node;
      }),
      isDirty: true
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNode: get().selectedNode?.id === nodeId ? null : get().selectedNode,
      isDirty: true
    });
  },

  setSelectedNode: (node) => {
    set({ selectedNode: node });
  },

  saveWorkflow: async () => {
    const { currentWorkflow, nodes, edges } = get();
    if (!currentWorkflow?._id) return;

    set({ isSaving: true, error: null });
    try {
      const response = await api.put(`/workflows/${currentWorkflow._id}`, {
        nodes,
        edges,
        triggerConfig: currentWorkflow.triggerConfig,
        name: currentWorkflow.name,
        description: currentWorkflow.description,
        tags: currentWorkflow.tags,
        status: currentWorkflow.status
      });

      set({
        currentWorkflow: response.data,
        isDirty: false,
        isSaving: false
      });
      return response.data;
    } catch (err) {
      set({ isSaving: false, error: err.message });
      throw err;
    }
  },

  generateFromPrompt: async (prompt) => {
    set({ isGenerating: true, error: null });
    try {
      const response = await api.post('/workflows/generate', { prompt });
      const generated = response.data;

      set({
        currentWorkflow: {
          name: generated.name,
          description: generated.description,
          tags: generated.tags,
          triggerConfig: { type: generated.triggerType, settings: {} },
          status: 'draft',
          aiGenerated: true,
          prompt: generated.prompt
        },
        nodes: generated.nodes || [],
        edges: generated.edges || [],
        selectedNode: null,
        isDirty: true,
        isGenerating: false
      });

      return generated;
    } catch (err) {
      set({ isGenerating: false, error: err.message });
      throw err;
    }
  }
}));
