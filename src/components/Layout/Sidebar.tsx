// ========================================
// Sidebar Component - Clean Style
// ========================================

import { useState, useCallback, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Braces,
  GitCompare,
  Database,
  FileText,
  FileOutput,
  Settings,
  ChevronLeft,
  ChevronRight,
  CaseUpper,
  FileSpreadsheet,
  Wand2,
} from 'lucide-react';
import type { ToolConfig } from '../../types';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  tools?: string[];
  width: number;
  onWidthChange: (width: number) => void;
}

const allTools: Record<string, ToolConfig> = {
  json: { id: 'json', name: 'JSON 格式化', icon: 'braces', path: '/json' },
  excel: { id: 'excel', name: 'JSON转换', icon: 'file-spreadsheet', path: '/excel' },
  diff: { id: 'diff', name: '文本差异', icon: 'git-compare', path: '/diff' },
  sql: { id: 'sql', name: 'SQL 格式化', icon: 'database', path: '/sql' },
  markdown: { id: 'markdown', name: 'Markdown', icon: 'file-text', path: '/markdown' },
  case: { id: 'case', name: '大小写转换', icon: 'case-upper', path: '/case' },
  converter: { id: 'converter', name: 'JSON转换', icon: 'file-output', path: '/converter' },
  prompt: { id: 'prompt', name: '提示词优化', icon: 'wand-2', path: '/prompt' },
};

const defaultToolIds = ['json', 'excel', 'diff', 'sql', 'markdown', 'case', 'converter', 'prompt'];

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  braces: Braces,
  'git-compare': GitCompare,
  database: Database,
  'file-text': FileText,
  'file-output': FileOutput,
  'case-upper': CaseUpper,
  'file-spreadsheet': FileSpreadsheet,
  'wand-2': Wand2,
};

export function Sidebar({ collapsed, onToggle, tools: toolIds, width, onWidthChange }: SidebarProps) {
  // Use provided toolIds or defaultToolIds
  const toolsToDisplay = (toolIds || defaultToolIds)
    .map(id => allTools[id])
    .filter(Boolean) as ToolConfig[];

  // Drag handle state
  const [isDragging, setIsDragging] = useState(false);

  // Handle mouse down on drag handle
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  // Handle mouse move during drag
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newWidth = e.clientX;
    // Set minimum width to 100px
    if (newWidth >= 100 && newWidth <= 500) {
      onWidthChange(newWidth);
    }
  }, [isDragging, onWidthChange]);

  // Handle mouse up to end drag
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <aside 
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      style={{ width: collapsed ? '60px' : `${width}px` } as React.CSSProperties}
    >
      {/* App Header */}
      <div className="sidebar-header">
        <NavLink to="/" className="sidebar-title-link">
          <span className="sidebar-title">{collapsed ? '🧰' : 'Cjie工具箱'}</span>
        </NavLink>
      </div>

      {/* Tools Navigation */}
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {toolsToDisplay.map((tool) => {
            const IconComponent = iconMap[tool.icon];
            return (
              <li key={tool.id}>
                <NavLink
                  to={tool.path}
                  className={({ isActive }) =>
                    `sidebar-item ${isActive ? 'active' : ''}`
                  }
                  title={collapsed ? tool.name : undefined}
                >
                  {IconComponent && <IconComponent size={18} />}
                  {!collapsed && <span className="sidebar-item-title">{tool.name}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings */}
      <div className="sidebar-footer">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? 'active' : ''}`
          }
          title={collapsed ? '设置' : undefined}
        >
          <Settings size={18} />
          {!collapsed && <span className="sidebar-item-title">设置</span>}
        </NavLink>
        
        {/* Collapse Toggle */}
        <button 
          className="sidebar-toggle" 
          onClick={onToggle}
          title={collapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span>收起</span>}
        </button>
      </div>

      {/* Drag Handle */}
      {!collapsed && (
        <div 
          className={`sidebar-drag-handle ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
        />
      )}

      <style>{`
        .sidebar {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-sidebar);
          border-right: 1px solid var(--border-color);
          overflow: hidden;
          transition: width var(--transition-normal);
          position: relative;
        }

        .sidebar.collapsed {
          width: 60px;
        }

        .sidebar-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          padding: 10px 12px;
          margin-top: 8px;
          border-radius: 6px;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .sidebar-toggle:hover {
          background-color: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
        }

        .collapsed .sidebar-toggle {
          padding: 10px;
        }

        .sidebar-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-light);
          min-height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .collapsed .sidebar-header {
          padding: 16px 8px;
        }

        .sidebar-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .sidebar-title-link {
          text-decoration: none;
          color: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          transition: opacity var(--transition-fast);
        }

        .sidebar-title-link:hover {
          opacity: 0.8;
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 8px 12px;
        }

        .collapsed .sidebar-nav {
          padding: 8px;
        }

        .sidebar-menu {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 6px;
          text-decoration: none;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
          cursor: pointer;
          justify-content: center;
        }

        .collapsed .sidebar-item {
          padding: 10px;
        }

        .sidebar-item:hover {
          background-color: var(--bg-sidebar-hover);
          color: var(--text-primary);
        }

        .sidebar-item.active {
          background-color: var(--accent-primary);
          color: white;
        }

        .sidebar-item-title {
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
        }

        .sidebar-footer {
          padding: 12px;
          border-top: 1px solid var(--border-light);
        }

        .collapsed .sidebar-footer {
          padding: 8px;
        }

        /* Drag Handle */
        .sidebar-drag-handle {
          position: absolute;
          top: 0;
          right: 0;
          width: 4px;
          height: 100%;
          cursor: col-resize;
          background-color: transparent;
          transition: all var(--transition-fast);
        }

        .sidebar-drag-handle:hover {
          background-color: var(--border-color);
        }

        .sidebar-drag-handle.dragging {
          background-color: var(--accent-primary);
          width: 6px;
        }

        /* Disable text selection during drag */
        .sidebar-drag-handle::selection {
          background: none;
        }
      `}</style>
    </aside>
  );
}
