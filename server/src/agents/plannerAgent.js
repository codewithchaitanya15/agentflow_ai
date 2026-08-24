const BaseAgent = require('./baseAgent');
const logger = require('../utils/logger');

class PlannerAgent extends BaseAgent {
  constructor() {
    super('planner');
  }

  async plan(workflow, monitoringAgent, executionId) {
    const nodes = workflow.nodes || [];
    const edges = workflow.edges || [];

    logger.info(`Planner Agent analyzing workflow: "${workflow.name}" with ${nodes.length} nodes`);

    // 1. Build adjacency list and in-degree map for DAG topological sorting
    const adj = new Map();
    const inDegree = new Map();
    const nodeMap = new Map();

    nodes.forEach(node => {
      nodeMap.set(node.id, node);
      adj.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    edges.forEach(edge => {
      if (adj.has(edge.source) && inDegree.has(edge.target)) {
        adj.get(edge.source).push(edge.target);
        inDegree.set(edge.target, inDegree.get(edge.target) + 1);
      }
    });

    // 2. Kahn's Algorithm for Topological Sort
    const queue = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    const executionPlan = [];
    while (queue.length > 0) {
      const currentId = queue.shift();
      executionPlan.push(currentId);

      const neighbors = adj.get(currentId) || [];
      neighbors.forEach(neighbor => {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      });
    }

    // Check for circular dependencies / disconnected nodes
    const hasCycle = executionPlan.length !== nodes.length;
    let confidenceScore = 1.0;

    if (nodes.length === 0) {
      confidenceScore = 0.0;
    } else if (hasCycle) {
      confidenceScore = 0.5;
      // Append any unvisited nodes as fallback
      nodes.forEach(node => {
        if (!executionPlan.includes(node.id)) {
          executionPlan.push(node.id);
        }
      });
    }

    // Assess quality of configuration across nodes
    let unconfiguredNodes = 0;
    nodes.forEach(n => {
      const config = n.data?.config;
      if (!config || Object.keys(config).length === 0) {
        unconfiguredNodes++;
      }
    });

    if (nodes.length > 0) {
      confidenceScore = Math.max(0.6, confidenceScore - (unconfiguredNodes / nodes.length) * 0.2);
    }
    confidenceScore = Math.round(confidenceScore * 100) / 100;

    const plannedSteps = executionPlan.map((nodeId, idx) => {
      const node = nodeMap.get(nodeId);
      return {
        stepNumber: idx + 1,
        nodeId,
        label: node?.data?.label || nodeId,
        type: node?.data?.nodeType || node?.type || 'unknown',
        category: node?.data?.category || 'action'
      };
    });

    await this.emitLog(
      monitoringAgent,
      executionId,
      workflow._id,
      null,
      'info',
      'PLAN_GENERATED',
      `Planner Agent formulated execution strategy: ${plannedSteps.length} ordered steps (Confidence: ${(confidenceScore * 100).toFixed(0)}%)`,
      {
        plan: plannedSteps,
        confidenceScore,
        hasCycle,
        nodeOrder: executionPlan
      }
    );

    return {
      orderedNodeIds: executionPlan,
      plannedSteps,
      confidenceScore,
      nodeMap
    };
  }
}

module.exports = new PlannerAgent();
