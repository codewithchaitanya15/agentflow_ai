import React, { useState } from 'react';
import { NODE_CATALOG, NODE_CATEGORIES } from '../../lib/constants';
import { useWorkflowStore } from '../../store/workflowStore';
import {
  Mail,
  Webhook,
  Clock,
  Cpu,
  Brain,
  Send,
  MessageSquare,
  Bot,
  FileSpreadsheet,
  Split,
  Search,
  Plus,
  Layers
} from 'lucide-react';

const ICON_MAP = {
  Mail,
  Webhook,
  Clock,
  Cpu,
  Brain,
  Send,
  MessageSquare,
  Bot,
  FileSpreadsheet,
  Split
};

export default function NodePalette() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const addNode = useWorkflowStore((state) => state.addNode);

  const filteredNodes = NODE_CATALOG.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.nodeType.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDragStart = (e, nodeItem) => {
    e.dataTransfer.setData('application/reactflow-node', JSON.stringify(nodeItem));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-80 bg-surface/95 border-r border-border flex flex-col h-full overflow-hidden select-none shrink-0 z-10 shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">Node Palette</h2>
            <p className="text-[11px] text-slate-400">Drag or click to insert into graph</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nodes & tools..."
            className="w-full bg-slate-900/80 border border-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        {/* Category filter pills */}
        <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
              activeCategory === 'all'
                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All
          </button>
          {NODE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Nodes list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredNodes.map((item) => {
          const Icon = ICON_MAP[item.icon] || Cpu;

          const getCategoryBadge = () => {
            switch (item.category) {
              case 'trigger':
                return { bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', label: 'Trigger' };
              case 'ai':
                return { bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'AI Agent' };
              case 'action':
                return { bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', label: 'Integration' };
              case 'logic':
                return { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Logic' };
              default:
                return { bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'Tool' };
            }
          };

          const badge = getCategoryBadge();

          return (
            <div
              key={item.nodeType}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onClick={() => addNode(item)}
              className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-border/80 hover:border-brand-500/40 cursor-grab active:cursor-grabbing transition-all group relative shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-800 text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-100 group-hover:text-brand-400 transition">
                      {item.label}
                    </h3>
                    <span className={`inline-block text-[9px] font-medium px-1.5 py-0.2 rounded border ${badge.bg} mt-0.5`}>
                      {badge.label}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-slate-800 text-slate-300 hover:text-white transition"
                  title="Add to canvas"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
