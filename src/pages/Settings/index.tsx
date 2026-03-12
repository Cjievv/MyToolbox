// ========================================
// Settings Page
// ========================================

import { useState } from 'react';
import {
  Settings,
  Palette,
  Type,
  Monitor,
  Info,
  ChevronRight,
  Check,
  Moon,
  Sun,
  Laptop,
  FileJson,
  FileSpreadsheet,
  GitCompare,
  Database,
  FileText,
  CaseUpper,
  FileType,
} from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import type { Theme } from '../../types';
import packageJson from '../../../package.json';

const THEMES = [
  { id: 'light', name: '浅色', icon: Sun },
  { id: 'dark', name: '深色', icon: Moon },
  { id: 'system', name: '跟随系统', icon: Laptop },
];

const FONT_SIZES = [12, 13, 14, 15, 16, 18];

export function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [activeSection, setActiveSection] = useState('appearance');
  const { theme, fontSize, wordWrap, minimap, autoSave } = settings;

  return (
    <div className="settings-page">
      {/* Sidebar */}
      <aside className="settings-sidebar">
        <h2 className="settings-title">
          <Settings size={18} />
          设置
        </h2>
        <nav className="settings-nav">
          <button
            className={`nav-item ${activeSection === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveSection('appearance')}
          >
            <Palette size={16} />
            <span>外观</span>
          </button>
          <button
            className={`nav-item ${activeSection === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveSection('editor')}
          >
            <Type size={16} />
            <span>编辑器</span>
          </button>
          <button
            className={`nav-item ${activeSection === 'tools' ? 'active' : ''}`}
            onClick={() => setActiveSection('tools')}
          >
            <FileJson size={16} />
            <span>工具</span>
          </button>
          <button
            className={`nav-item ${activeSection === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveSection('advanced')}
          >
            <Monitor size={16} />
            <span>高级</span>
          </button>
          <button
            className={`nav-item ${activeSection === 'about' ? 'active' : ''}`}
            onClick={() => setActiveSection('about')}
          >
            <Info size={16} />
            <span>关于</span>
          </button>
        </nav>
      </aside>

      {/* Content */}
      <main className="settings-content">
        {activeSection === 'appearance' && (
          <section className="settings-section">
            <h3>外观</h3>

            <div className="setting-group">
              <label className="setting-label">主题</label>
              <div className="theme-options">
                {THEMES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      className={`theme-option ${theme === t.id ? 'active' : ''}`}
                      onClick={() => updateSettings({ theme: t.id as Theme })}
                    >
                      <Icon size={20} />
                      <span>{t.name}</span>
                      {theme === t.id && <Check size={14} className="check" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {activeSection === 'editor' && (
          <section className="settings-section">
            <h3>编辑器</h3>

            <div className="setting-group">
              <label className="setting-label">字体大小</label>
              <div className="font-size-options">
                {FONT_SIZES.map((size) => (
                  <button
                    key={size}
                    className={`size-option ${fontSize === size ? 'active' : ''}`}
                    onClick={() => updateSettings({ fontSize: size })}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>

            <div className="setting-group">
              <label className="setting-item checkbox">
                <div className="setting-item-info">
                  <span className="setting-item-title">自动换行</span>
                  <span className="setting-item-desc">文本超出编辑器宽度时自动换行</span>
                </div>
                <input
                  type="checkbox"
                  checked={wordWrap}
                  onChange={(e) => updateSettings({ wordWrap: e.target.checked })}
                />
              </label>
            </div>

            <div className="setting-group">
              <label className="setting-item checkbox">
                <div className="setting-item-info">
                  <span className="setting-item-title">显示缩略图</span>
                  <span className="setting-item-desc">在编辑器右侧显示代码缩略图</span>
                </div>
                <input
                  type="checkbox"
                  checked={minimap}
                  onChange={(e) => updateSettings({ minimap: e.target.checked })}
                />
              </label>
            </div>

            <div className="setting-group">
              <label className="setting-item checkbox">
                <div className="setting-item-info">
                  <span className="setting-item-title">自动保存</span>
                  <span className="setting-item-desc">编辑内容自动保存到本地</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => updateSettings({ autoSave: e.target.checked })}
                />
              </label>
            </div>
          </section>
        )}

        {activeSection === 'tools' && (
          <section className="settings-section">
            <h3>工具配置</h3>

            <div className="setting-group">
              <label className="setting-label">侧边栏工具顺序</label>
              <p className="setting-description">拖拽工具可以调整顺序</p>
              <div 
                className="tools-list"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const draggedToolId = e.dataTransfer.getData('text/plain');
                  const target = e.target as HTMLElement;
                  const dropTargetId = target.closest('.tool-item')?.getAttribute('data-tool-id');
                  
                  if (draggedToolId && dropTargetId && draggedToolId !== dropTargetId) {
                    const newTools = [...settings.sidebarTools];
                    const draggedIndex = newTools.indexOf(draggedToolId);
                    const dropIndex = newTools.indexOf(dropTargetId);
                    
                    newTools.splice(draggedIndex, 1);
                    newTools.splice(dropIndex, 0, draggedToolId);
                    updateSettings({ sidebarTools: newTools });
                  }
                }}
              >
                {settings.sidebarTools.map((toolId) => {
                  const toolInfoMap: Record<string, { name: string; icon: typeof FileJson }> = {
                    json: { name: 'JSON 格式化', icon: FileJson },
                    excel: { name: 'JSON转换', icon: FileSpreadsheet },
                    diff: { name: '文本对比', icon: GitCompare },
                    sql: { name: 'SQL 工具', icon: Database },
                    markdown: { name: 'Markdown', icon: FileText },
                    case: { name: '大小写转换', icon: CaseUpper },
                    converter: { name: 'JSON转换', icon: FileType },
                    prompt: { name: '提示词优化', icon: FileType },
                  };
                  const toolInfo = toolInfoMap[toolId];

                  if (!toolInfo) return null;

                  const Icon = toolInfo.icon;
                  return (
                    <div 
                      key={toolId} 
                      className="tool-item"
                      data-tool-id={toolId}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', toolId)}
                    >
                      <Icon size={16} />
                      <span>{toolInfo.name}</span>
                      <button 
                        className="remove-tool-btn"
                        onClick={() => {
                          const newTools = settings.sidebarTools.filter(id => id !== toolId);
                          updateSettings({ sidebarTools: newTools });
                        }}
                        title="移除工具"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="setting-group">
              <label className="setting-label">添加工具</label>
              <div className="add-tools-list">
                {[
                  { id: 'json', name: 'JSON 格式化', icon: FileJson },
                  { id: 'excel', name: 'JSON转换', icon: FileSpreadsheet },
                  { id: 'diff', name: '文本对比', icon: GitCompare },
                  { id: 'sql', name: 'SQL 工具', icon: Database },
                  { id: 'markdown', name: 'Markdown', icon: FileText },
                  { id: 'case', name: '大小写转换', icon: CaseUpper },
                  { id: 'converter', name: 'JSON转换', icon: FileType },
                  { id: 'prompt', name: '提示词优化', icon: FileType },
                ].filter(tool => !settings.sidebarTools.includes(tool.id)).map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <div key={tool.id} className="tool-item addable">
                      <Icon size={16} />
                      <span>{tool.name}</span>
                      <button 
                        className="add-tool-btn"
                        onClick={() => {
                          const newTools = [...settings.sidebarTools, tool.id];
                          updateSettings({ sidebarTools: newTools });
                        }}
                        title="添加工具"
                      >
                        +
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {activeSection === 'advanced' && (
          <section className="settings-section">
            <h3>高级</h3>

            <div className="setting-group">
              <label className="setting-label">JSON转换设置</label>
              <div className="advanced-options">
                <div className="advanced-item">
                  <div className="advanced-item-info">
                    <span>Python 解释器路径</span>
                    <span className="advanced-item-value">/usr/bin/python3</span>
                  </div>
                  <button className="btn btn-secondary">更改</button>
                </div>
                <div className="advanced-item">
                  <div className="advanced-item-info">
                    <span>临时文件目录</span>
                    <span className="advanced-item-value">~/Library/Caches/MyToolbox</span>
                  </div>
                  <button className="btn btn-secondary">更改</button>
                </div>
              </div>
            </div>

            <div className="setting-group">
              <label className="setting-label">数据管理</label>
              <div className="danger-zone">
                <button className="btn btn-danger">清除所有历史记录</button>
                <button className="btn btn-danger">重置所有设置</button>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'about' && (
          <section className="settings-section">
            <h3>关于</h3>

            <div className="about-card">
              <div className="app-icon">🧰</div>
              <h4 className="app-name">Cjie工具箱</h4>
              <p className="app-version">版本 {packageJson.version}</p>
              <p className="app-description">
                一个为开发者设计的 Mac 工具箱，提供 JSON/SQL 格式化、文本对比、Markdown 编辑、JSON转换等功能。
              </p>
            </div>

            <div className="about-links">
              <a href="#" className="about-link">
                <span>GitHub 仓库</span>
                <ChevronRight size={14} />
              </a>
              <a href="#" className="about-link">
                <span>反馈问题</span>
                <ChevronRight size={14} />
              </a>
              <a href="#" className="about-link">
                <span>检查更新</span>
                <ChevronRight size={14} />
              </a>
            </div>

            <p className="copyright">
              © 2024 MyToolbox. All rights reserved.
            </p>
          </section>
        )}
      </main>

      <style>{`
        .settings-page {
          display: flex;
          height: 100%;
          background-color: var(--bg-primary);
        }

        .settings-sidebar {
          width: 200px;
          padding: 20px 12px;
          border-right: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
        }

        .settings-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 20px;
          padding: 0 8px;
        }

        .settings-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          font-size: 13px;
          font-weight: 500;
          border: none;
          border-radius: 8px;
          background-color: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .nav-item:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .nav-item.active {
          background-color: var(--accent-primary);
          color: white;
        }

        .settings-content {
          flex: 1;
          overflow-y: auto;
          padding: 40px;
        }

        .settings-section h3 {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 24px;
        }

        .setting-group {
          margin-bottom: 32px;
        }

        .setting-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .setting-description {
          font-size: 12px;
          color: var(--text-tertiary);
          margin-bottom: 12px;
          margin-top: 0;
        }

        .theme-options {
          display: flex;
          gap: 12px;
        }

        .theme-option {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px;
          border: 2px solid var(--border-color);
          border-radius: 10px;
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
        }

        .theme-option:hover {
          border-color: var(--accent-primary);
        }

        .theme-option.active {
          border-color: var(--accent-primary);
          background-color: rgba(0, 122, 255, 0.05);
        }

        .theme-option .check {
          position: absolute;
          top: 8px;
          right: 8px;
          color: var(--accent-primary);
        }

        .font-size-options {
          display: flex;
          gap: 8px;
        }

        .size-option {
          padding: 8px 16px;
          font-size: 13px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .size-option:hover {
          border-color: var(--accent-primary);
        }

        .size-option.active {
          background-color: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
        }

        .setting-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
        }

        .setting-item.checkbox {
          cursor: pointer;
        }

        .setting-item-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .setting-item-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .setting-item-desc {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .setting-item input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: var(--accent-primary);
        }

        .advanced-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .advanced-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
        }

        .advanced-item-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .advanced-item-info span:first-child {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .advanced-item-value {
          font-size: 12px;
          color: var(--text-tertiary);
          font-family: var(--font-mono);
        }

        .danger-zone {
          display: flex;
          gap: 12px;
        }

        .btn-danger {
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          border: none;
          border-radius: 6px;
          background-color: rgba(255, 59, 48, 0.1);
          color: var(--accent-danger);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-danger:hover {
          background-color: var(--accent-danger);
          color: white;
        }

        .about-card {
          text-align: center;
          padding: 40px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          margin-bottom: 24px;
        }

        .app-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .app-name {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .app-version {
          font-size: 13px;
          color: var(--text-tertiary);
          margin-bottom: 16px;
        }

        .app-description {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 400px;
          margin: 0 auto;
        }

        .about-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
        }

        .about-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 14px;
          color: var(--text-primary);
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .about-link:hover {
          border-color: var(--accent-primary);
        }

        .copyright {
          text-align: center;
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .tools-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tool-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 14px;
          color: var(--text-primary);
        }

        .tool-item:hover {
          border-color: var(--accent-primary);
        }

        .tool-item {
          position: relative;
          justify-content: space-between;
        }

        .remove-tool-btn,
        .add-tool-btn {
          width: 20px;
          height: 20px;
          border: none;
          border-radius: 50%;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .remove-tool-btn {
          background-color: rgba(255, 59, 48, 0.1);
          color: var(--accent-danger);
        }

        .remove-tool-btn:hover {
          background-color: var(--accent-danger);
          color: white;
        }

        .add-tool-btn {
          background-color: rgba(52, 199, 89, 0.1);
          color: var(--accent-success);
        }

        .add-tool-btn:hover {
          background-color: var(--accent-success);
          color: white;
        }

        .tool-item.addable {
          opacity: 0.7;
        }

        .tool-item.addable:hover {
          opacity: 1;
          border-color: var(--accent-primary);
        }

        .add-tools-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      `}</style>
    </div>
  );
}
