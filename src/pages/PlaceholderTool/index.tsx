// ========================================
// Placeholder Tool Page - Coming Soon
// ========================================

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';

interface PlaceholderToolProps {
  title: string;
}

export function PlaceholderTool({ title }: PlaceholderToolProps) {
  const navigate = useNavigate();

  return (
    <div className="placeholder-tool">
      <header className="page-header">
        <div className="page-header-left">
          <button className="btn btn-icon btn-back" onClick={() => navigate('/')}>
            <ArrowLeft size={18} />
          </button>
          <h1>{title}</h1>
        </div>
      </header>

      <div className="placeholder-content">
        <div className="placeholder-card">
          <Construction size={48} className="placeholder-icon" />
          <h2>功能开发中</h2>
          <p>该工具正在开发中，敬请期待...</p>
        </div>
      </div>

      <style>{`
        .placeholder-tool {
          display: flex;
          flex-direction: column;
          height: 100%;
          background-color: var(--bg-secondary);
        }

        .page-header {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          border-bottom: 1px solid var(--border-light);
        }

        .page-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .page-header-left h1 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .btn-back {
          background-color: transparent;
          color: var(--text-secondary);
        }

        .btn-back:hover {
          background-color: var(--bg-tertiary);
        }

        .placeholder-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .placeholder-card {
          text-align: center;
          padding: 60px 80px;
          background-color: var(--bg-primary);
          border-radius: 16px;
          border: 1px solid var(--border-color);
        }

        .placeholder-icon {
          color: var(--accent-primary);
          margin-bottom: 20px;
        }

        .placeholder-card h2 {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .placeholder-card p {
          font-size: 14px;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
