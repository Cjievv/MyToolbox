// ========================================
// SQL Tool Page
// ========================================

import { useState, useCallback } from 'react';
import {
  Database,
  AlignLeft,
  Minimize2,
  Copy,
  Download,
  Upload,
  Clipboard,
  X,
} from 'lucide-react';
import { format } from 'sql-formatter';
import { MonacoWrapper } from '../../components/Editor/MonacoWrapper';

const SQL_DIALECTS = [
  { id: 'mysql', name: 'MySQL' },
  { id: 'postgresql', name: 'PostgreSQL' },
  { id: 'sqlite', name: 'SQLite' },
  { id: 'mariadb', name: 'MariaDB' },
  { id: 'plsql', name: 'PL/SQL' },
];

export function SqlTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [dialect, setDialect] = useState<'mysql' | 'postgresql' | 'sqlite' | 'mariadb' | 'plsql'>('mysql');
  const [keywordCase, setKeywordCase] = useState<'upper' | 'lower' | 'preserve'>('upper');
  const [tabWidth, setTabWidth] = useState(2);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFormat = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setIsValid(null);
      return;
    }
    try {
      const formatted = format(input, {
        language: dialect,
        keywordCase: keywordCase,
        tabWidth: tabWidth,
        linesBetweenQueries: 2,
      });
      setOutput(formatted);
      setIsValid(true);
      setErrorMessage('');
    } catch (e) {
      setIsValid(false);
      setErrorMessage((e as Error).message);
    }
  }, [input, dialect, keywordCase, tabWidth]);

  const handleMinify = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setIsValid(null);
      return;
    }
    try {
      const formatted = format(input, {
        language: dialect,
        keywordCase: keywordCase,
        tabWidth: 0,
        linesBetweenQueries: 0,
      });
      setOutput(formatted.replace(/\s+/g, ' ').trim());
      setIsValid(true);
      setErrorMessage('');
    } catch (e) {
      setIsValid(false);
      setErrorMessage((e as Error).message);
    }
  }, [input, dialect, keywordCase]);

  const handleCopy = useCallback(async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
    }
  }, [output]);

  const handlePaste = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    setInput(text);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInput(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  }, []);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setIsValid(null);
    setErrorMessage('');
  }, []);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.sql';
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  return (
    <div className="sql-tool">
      {/* Header */}
      <header className="page-header">
        <div className="page-header-left">
          <Database size={20} />
          <h1>SQL 格式化</h1>
        </div>
        <div className="page-header-actions">
          <select
            className="select"
            value={dialect}
            onChange={(e) => setDialect(e.target.value as 'mysql' | 'postgresql' | 'sqlite' | 'mariadb' | 'plsql')}
          >
            {SQL_DIALECTS.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <button className="btn btn-secondary" onClick={handleFormat}>
            <AlignLeft size={14} />
            格式化
          </button>
          <button className="btn btn-secondary" onClick={handleMinify}>
            <Minimize2 size={14} />
            压缩
          </button>
          <button className="btn btn-primary" onClick={handleCopy} disabled={!output}>
            <Copy size={14} />
            复制结果
          </button>
        </div>
      </header>

      {/* Options Bar */}
      <div className="sql-options-bar">
        <div className="option-group">
          <span className="option-label">缩进宽度:</span>
          <div className="option-toggle">
            <button
              className={`toggle-btn ${tabWidth === 2 ? 'active' : ''}`}
              onClick={() => setTabWidth(2)}
            >
              2 空格
            </button>
            <button
              className={`toggle-btn ${tabWidth === 4 ? 'active' : ''}`}
              onClick={() => setTabWidth(4)}
            >
              4 空格
            </button>
          </div>
        </div>
        <div className="option-group">
          <span className="option-label">关键字大小写:</span>
          <div className="option-toggle">
            <button
              className={`toggle-btn ${keywordCase === 'upper' ? 'active' : ''}`}
              onClick={() => setKeywordCase('upper')}
            >
              UPPER
            </button>
            <button
              className={`toggle-btn ${keywordCase === 'lower' ? 'active' : ''}`}
              onClick={() => setKeywordCase('lower')}
            >
              lower
            </button>
            <button
              className={`toggle-btn ${keywordCase === 'preserve' ? 'active' : ''}`}
              onClick={() => setKeywordCase('preserve')}
            >
              保持
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="sql-content">
        {/* Input */}
        <div className="sql-section">
          <div className="section-header">
            <span className="section-title">输入 SQL</span>
            <div className="section-actions">
              <label className="btn btn-icon" title="从文件导入">
                <Upload size={14} />
                <input
                  type="file"
                  hidden
                  accept=".sql,.txt"
                  onChange={handleFileUpload}
                />
              </label>
              <button className="btn btn-icon" onClick={handlePaste} title="粘贴">
                <Clipboard size={14} />
              </button>
              <button className="btn btn-icon" onClick={handleClear} title="清空">
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="section-body">
            <MonacoWrapper
              language="sql"
              value={input}
              onChange={setInput}
            />
          </div>
          <div className="section-footer">
            {isValid !== null && !isValid && errorMessage && (
              <span className="validation-badge invalid">
                <X size={12} />
                {errorMessage.substring(0, 50)}...
              </span>
            )}
            <span className="char-count">{input.length} 字符</span>
          </div>
        </div>

        {/* Output */}
        <div className="sql-section">
          <div className="section-header">
            <span className="section-title">格式化结果</span>
            <div className="section-actions">
              <button className="btn btn-icon" onClick={handleDownload} disabled={!output} title="导出文件">
                <Download size={14} />
              </button>
            </div>
          </div>
          <div className="section-body">
            <MonacoWrapper
              language="sql"
              value={output}
              readOnly
            />
          </div>
          <div className="section-footer">
            <span className="char-count">{output.length} 字符</span>
          </div>
        </div>
      </div>

      <style>{`
        .sql-tool {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }

        .page-header-left {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-primary);
        }

        .page-header-left h1 {
          font-size: 16px;
          font-weight: 600;
        }

        .page-header-actions {
          display: flex;
          gap: 8px;
        }

        .select {
          padding: 6px 10px;
          font-size: 13px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
          cursor: pointer;
        }

        .sql-options-bar {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 10px 20px;
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }

        .option-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .option-label {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .option-toggle {
          display: flex;
          background-color: var(--bg-tertiary);
          border-radius: 6px;
          padding: 2px;
        }

        .toggle-btn {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          border: none;
          border-radius: 4px;
          background-color: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: var(--font-mono);
        }

        .toggle-btn.active {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .checkbox-label input {
          width: 14px;
          height: 14px;
          accent-color: var(--accent-primary);
        }

        .sql-content {
          display: flex;
          flex: 1;
          padding: 16px;
          gap: 16px;
          overflow: hidden;
        }

        .sql-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background-color: var(--bg-secondary);
          border-radius: 10px;
          border: 1px solid var(--border-color);
          overflow: hidden;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-bottom: 1px solid var(--border-color);
        }

        .section-title {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .section-actions {
          display: flex;
          gap: 4px;
        }

        .section-body {
          flex: 1;
          min-height: 0;
          padding: 12px;
        }

        .section-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-top: 1px solid var(--border-color);
          font-size: 11px;
          color: var(--text-tertiary);
        }

        .validation-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .validation-badge.valid {
          background-color: rgba(52, 199, 89, 0.15);
          color: var(--accent-success);
        }

        .validation-badge.invalid {
          background-color: rgba(255, 59, 48, 0.15);
          color: var(--accent-danger);
        }
      `}</style>
    </div>
  );
}
