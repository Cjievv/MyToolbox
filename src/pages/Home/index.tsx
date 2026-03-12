// ========================================
// Home / Welcome Page
// ========================================

import { useNavigate } from 'react-router-dom';
import {
  FileJson,
  GitCompare,
  Database,
  FileText,
  FileCode,
  ArrowRight,
  Sparkles,
  Clock,
  CaseUpper,
  FileSpreadsheet,
} from 'lucide-react';

const RECENT_TOOLS = [
  { id: 'json', name: 'JSON 格式化', icon: FileJson, time: '10分钟前' },
  { id: 'markdown', name: 'Markdown 编辑器', icon: FileText, time: '2小时前' },
];

const ALL_TOOLS = [
  { id: 'json', name: 'JSON 工具', icon: FileJson, desc: '格式化、验证、转换', color: '#007aff' },
  { id: 'excel', name: 'JSON转换', icon: FileSpreadsheet, desc: 'JSON转Excel、表格预览', color: '#4cd964' },
  { id: 'diff', name: '文本对比', icon: GitCompare, desc: '差异对比、合并', color: '#5856d6' },
  { id: 'sql', name: 'SQL 工具', icon: Database, desc: '格式化、压缩', color: '#34c759' },
  { id: 'markdown', name: 'Markdown', icon: FileText, desc: '编辑、预览、导出', color: '#ff9500' },
  { id: 'case', name: '大小写转换', icon: CaseUpper, desc: '驼峰、下划线、短横线', color: '#ff2d55' },
  { id: 'converter', name: 'JSON转换', icon: FileCode, desc: 'JSON转Excel、表格预览', color: '#af52de' },
];

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Welcome Section */}
      <header className="home-header">
        <div className="welcome-badge">
          <Sparkles size={14} />
          <span>欢迎回来</span>
        </div>
        <h1 className="welcome-title">MyToolbox</h1>
        <p className="welcome-subtitle">选择下方工具开始使用</p>
      </header>

      {/* Recent Tools */}
      {RECENT_TOOLS.length > 0 && (
        <section className="recent-section">
          <h2 className="section-title">
            <Clock size={14} />
            最近使用
          </h2>
          <div className="recent-list">
            {RECENT_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  className="recent-item"
                  onClick={() => navigate(`/${tool.id}`)}
                >
                  <Icon size={16} />
                  <span className="recent-name">{tool.name}</span>
                  <span className="recent-time">{tool.time}</span>
                  <ArrowRight size={14} className="recent-arrow" />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* All Tools Grid */}
      <section className="tools-section">
        <h2 className="section-title">所有工具</h2>
        <div className="tools-grid">
          {ALL_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                className="tool-card"
                onClick={() => navigate(`/${tool.id}`)}
              >
                <div className="tool-icon" style={{ backgroundColor: `${tool.color}15`, color: tool.color }}>
                  <Icon size={24} />
                </div>
                <div className="tool-info">
                  <span className="tool-name">{tool.name}</span>
                  <span className="tool-desc">{tool.desc}</span>
                </div>
                <ArrowRight size={16} className="tool-arrow" />
              </button>
            );
          })}
        </div>
      </section>

      <style>{`
        .home-page {
          height: 100%;
          overflow-y: auto;
          padding: 40px;
        }

        .home-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .welcome-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background-color: rgba(0, 122, 255, 0.1);
          color: var(--accent-primary);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .welcome-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .welcome-subtitle {
          font-size: 15px;
          color: var(--text-secondary);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        }

        .recent-section {
          margin-bottom: 32px;
        }

        .recent-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .recent-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          color: var(--text-primary);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }

        .recent-item:hover {
          border-color: var(--accent-primary);
          transform: translateX(4px);
        }

        .recent-name {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
        }

        .recent-time {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .recent-arrow {
          color: var(--text-tertiary);
        }

        .tools-section {
          margin-bottom: 32px;
        }

        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }

        .tool-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }

        .tool-card:hover {
          border-color: var(--accent-primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .tool-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .tool-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .tool-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .tool-desc {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .tool-arrow {
          color: var(--text-tertiary);
        }
      `}</style>
    </div>
  );
}
