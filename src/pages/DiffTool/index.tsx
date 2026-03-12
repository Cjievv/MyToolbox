// ========================================
// Diff Tool Page
// ========================================

import { useState, useCallback, useMemo } from 'react';
import {
  GitCompare,
  AlignJustify,
  Columns,
  FileText,
  Copy,
  Download,
  Upload,
  Clipboard,
  RotateCcw,
} from 'lucide-react';
import * as Diff from 'diff';
import { MonacoWrapper } from '../../components/Editor/MonacoWrapper';

export function DiffTool() {
  const [leftContent, setLeftContent] = useState('');
  const [rightContent, setRightContent] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'inline'>('split');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  const lineDiffResult = useMemo(() => {
    if (!isComparing) return null;
    const diff = ignoreWhitespace
      ? Diff.diffTrimmedLines(leftContent, rightContent)
      : Diff.diffLines(leftContent, rightContent);

    const leftLines: { lineNum: number; content: string; type: 'removed' | 'unchanged' | 'empty'; chunks?: Array<{text: string; type: 'unchanged' | 'removed' | 'added'}> }[] = [];
    const rightLines: { lineNum: number; content: string; type: 'added' | 'unchanged' | 'empty'; chunks?: Array<{text: string; type: 'unchanged' | 'removed' | 'added'}> }[] = [];

    let leftLineNum = 1;
    let rightLineNum = 1;

    diff.forEach((part) => {
      const lines = part.value.split('\n');
      lines.forEach((line, idx) => {
        if (idx === lines.length - 1 && line === '') return;
        
        if (part.removed) {
          leftLines.push({ lineNum: leftLineNum++, content: line, type: 'removed' });
          rightLines.push({ lineNum: 0, content: '', type: 'empty' });
        } else if (part.added) {
          leftLines.push({ lineNum: 0, content: '', type: 'empty' });
          rightLines.push({ lineNum: rightLineNum++, content: line, type: 'added' });
        } else {
          leftLines.push({ lineNum: leftLineNum++, content: line, type: 'unchanged' });
          rightLines.push({ lineNum: rightLineNum++, content: line, type: 'unchanged' });
        }
      });
    });

    // Find adjacent removed and added lines for character-level comparison
    for (let i = 0; i < leftLines.length; i++) {
      const leftLine = leftLines[i];
      
      if (leftLine.type === 'removed' && i + 1 < leftLines.length) {
        const nextLeftLine = leftLines[i + 1];
        const nextRightLine = rightLines[i + 1];
        
        if (nextLeftLine.type === 'empty' && nextRightLine.type === 'added') {
          // Found a potential change (removed + added)
          const charDiff = Diff.diffChars(leftLine.content, nextRightLine.content);
          
          leftLine.chunks = charDiff.map(part => ({
            text: part.value,
            type: part.removed ? 'removed' : part.added ? 'unchanged' : 'unchanged'
          }));
          
          nextRightLine.chunks = charDiff.map(part => ({
            text: part.value,
            type: part.added ? 'added' : part.removed ? 'unchanged' : 'unchanged'
          }));
        }
      }
    }

    return { leftLines, rightLines };
  }, [leftContent, rightContent, ignoreWhitespace, isComparing]);

  const diffStats = useMemo(() => {
    const diff = ignoreWhitespace
      ? Diff.diffTrimmedLines(leftContent, rightContent)
      : Diff.diffLines(leftContent, rightContent);

    let added = 0;
    let removed = 0;

    diff.forEach((part) => {
      const lines = part.value.split('\n').filter(l => l.length > 0).length;
      if (part.added) added += lines;
      if (part.removed) removed += lines;
    });

    return {
      added,
      removed,
      changed: Math.min(added, removed),
    };
  }, [leftContent, rightContent, ignoreWhitespace]);

  const handleCompare = useCallback(() => {
    setIsComparing(true);
  }, []);

  const handleCopyLeft = useCallback(async () => {
    if (leftContent) {
      await navigator.clipboard.writeText(leftContent);
    }
  }, [leftContent]);

  const handleCopyRight = useCallback(async () => {
    if (rightContent) {
      await navigator.clipboard.writeText(rightContent);
    }
  }, [rightContent]);

  const handlePasteLeft = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    setLeftContent(text);
  }, []);

  const handlePasteRight = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    setRightContent(text);
  }, []);

  const handleFileUploadLeft = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLeftContent(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  }, []);

  const handleFileUploadRight = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRightContent(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  }, []);

  const handleClearLeft = useCallback(() => {
    setLeftContent('');
  }, []);

  const handleClearRight = useCallback(() => {
    setRightContent('');
  }, []);

  const handleReset = useCallback(() => {
    setLeftContent('');
    setRightContent('');
    setIsComparing(false);
  }, []);

  const handleExportResult = useCallback(() => {
    const diff = ignoreWhitespace
      ? Diff.diffTrimmedLines(leftContent, rightContent)
      : Diff.diffLines(leftContent, rightContent);

    const result = diff.map((part) => {
      const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
      return part.value.split('\n').map(line => prefix + line).join('\n');
    }).join('');

    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diff-result.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [leftContent, rightContent, ignoreWhitespace]);

  return (
    <div className="diff-tool">
      {/* Header */}
      <header className="page-header">
        <div className="page-header-left">
          <GitCompare size={20} />
          <h1>文本对比</h1>
        </div>
        <div className="page-header-actions">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'split' ? 'active' : ''}`}
              onClick={() => setViewMode('split')}
            >
              <Columns size={14} />
              并排
            </button>
            <button
              className={`toggle-btn ${viewMode === 'inline' ? 'active' : ''}`}
              onClick={() => setViewMode('inline')}
            >
              <AlignJustify size={14} />
              行内
            </button>
          </div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
            />
            忽略空白符
          </label>
          {isComparing ? (
            <button className="btn btn-secondary" onClick={handleReset}>
              <RotateCcw size={14} />
              重新填写
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleCompare}>
              <GitCompare size={14} />
              开始对比
            </button>
          )}
        </div>
      </header>

      {/* Stats Bar */}
      <div className="diff-stats-bar">
        <div className="stat-item removed">
          <span className="stat-dot" />
          删除: {diffStats.removed}
        </div>
        <div className="stat-item added">
          <span className="stat-dot" />
          新增: {diffStats.added}
        </div>
        <div className="stat-item changed">
          <span className="stat-dot" />
          修改: {diffStats.changed}
        </div>
      </div>

      {/* Main Content */}
      <div className="diff-content">
        {/* Left Panel */}
        <div className="diff-panel">
          <div className="panel-header">
            <div className="panel-title">
              <FileText size={14} />
              {isComparing ? (viewMode === 'split' ? '原始文本' : '对比结果') : '原始文本'}
            </div>
            <div className="panel-actions">
              {!isComparing && (
                <>
                  <label className="btn btn-icon" title="从文件导入">
                    <Upload size={14} />
                    <input
                      type="file"
                      hidden
                      accept=".txt,.js,.ts,.json,.md,.html,.css,.xml,.yaml,.yml"
                      onChange={handleFileUploadLeft}
                    />
                  </label>
                  <button className="btn btn-icon" onClick={handlePasteLeft} title="粘贴">
                    <Clipboard size={14} />
                  </button>
                  <button className="btn btn-icon" onClick={handleCopyLeft} title="复制">
                    <Copy size={14} />
                  </button>
                  <button className="btn btn-icon" onClick={handleClearLeft} title="清空">
                    <span>⌫</span>
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="panel-body">
            {!isComparing ? (
              <MonacoWrapper
                language="text"
                value={leftContent}
                onChange={setLeftContent}
              />
            ) : viewMode === 'split' ? (
              <div className="diff-view">
                <table className="diff-table">
                  <tbody>
                    {lineDiffResult?.leftLines.map((line, index) => (
                      <tr key={index} className={`diff-row diff-row-${line.type}`}>
                        <td className="diff-line-num">{line.lineNum > 0 ? line.lineNum : ''}</td>
                        <td className="diff-line-num">{lineDiffResult.rightLines[index]?.lineNum > 0 ? lineDiffResult.rightLines[index]?.lineNum : ''}</td>
                        <td className="diff-line-content">
                          <span className={`diff-indicator ${line.type === 'removed' ? 'removed' : ''}`}>-</span>
                          {line.chunks ? (
                            <span className="diff-text">
                              {line.chunks.map((chunk, chunkIdx) => (
                                <span key={chunkIdx} className={`diff-chunk diff-chunk-${chunk.type}`}>
                                  {chunk.text}
                                </span>
                              ))}
                            </span>
                          ) : (
                            <span className="diff-text">{line.content}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="diff-view inline-view">
                {lineDiffResult?.leftLines.map((line, index) => (
                  <>
                    {line.type === 'removed' && (
                      <div key={`left-${index}`} className="diff-line diff-line-removed">
                        <span className="diff-line-num">{line.lineNum}</span>
                        <span className="diff-indicator">-</span>
                        {line.chunks ? (
                          <span className="diff-text">
                            {line.chunks.map((chunk, chunkIdx) => (
                              <span key={chunkIdx} className={`diff-chunk diff-chunk-${chunk.type}`}>
                                {chunk.text}
                              </span>
                            ))}
                          </span>
                        ) : (
                          <span className="diff-text">{line.content}</span>
                        )}
                      </div>
                    )}
                    {line.type === 'empty' && lineDiffResult.rightLines[index]?.type === 'added' && (
                      <div key={`right-${index}`} className="diff-line diff-line-added">
                        <span className="diff-line-num">{lineDiffResult.rightLines[index].lineNum}</span>
                        <span className="diff-indicator">+</span>
                        {lineDiffResult.rightLines[index].chunks ? (
                          <span className="diff-text">
                            {lineDiffResult.rightLines[index].chunks.map((chunk, chunkIdx) => (
                              <span key={chunkIdx} className={`diff-chunk diff-chunk-${chunk.type}`}>
                                {chunk.text}
                              </span>
                            ))}
                          </span>
                        ) : (
                          <span className="diff-text">{lineDiffResult.rightLines[index].content}</span>
                        )}
                      </div>
                    )}
                  </>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Only show in split view when not comparing */}
        {(viewMode === 'split' || !isComparing) && (
          <div className="diff-panel">
            <div className="panel-header">
              <div className="panel-title">
                <FileText size={14} />
                {isComparing ? '对比结果' : '对比文本'}
              </div>
              <div className="panel-actions">
                {!isComparing && (
                  <>
                    <label className="btn btn-icon" title="从文件导入">
                      <Upload size={14} />
                      <input
                        type="file"
                        hidden
                        accept=".txt,.js,.ts,.json,.md,.html,.css,.xml,.yaml,.yml"
                        onChange={handleFileUploadRight}
                      />
                    </label>
                    <button className="btn btn-icon" onClick={handlePasteRight} title="粘贴">
                      <Clipboard size={14} />
                    </button>
                    <button className="btn btn-icon" onClick={handleCopyRight} title="复制">
                      <Copy size={14} />
                    </button>
                    <button className="btn btn-icon" onClick={handleClearRight} title="清空">
                      <span>⌫</span>
                    </button>
                  </>
                )}
                {isComparing && (
                  <button className="btn btn-icon" onClick={handleExportResult} title="导出结果">
                    <Download size={14} />
                  </button>
                )}
              </div>
            </div>
            <div className="panel-body">
              {!isComparing ? (
                <MonacoWrapper
                  language="text"
                  value={rightContent}
                  onChange={setRightContent}
                />
              ) : (
                <div className="diff-view">
                  <table className="diff-table">
                    <tbody>
                      {lineDiffResult?.rightLines.map((line, index) => (
                        <tr key={index} className={`diff-row diff-row-${line.type}`}>
                          <td className="diff-line-num">{lineDiffResult.leftLines[index]?.lineNum > 0 ? lineDiffResult.leftLines[index]?.lineNum : ''}</td>
                          <td className="diff-line-num">{line.lineNum > 0 ? line.lineNum : ''}</td>
                          <td className="diff-line-content">
                            <span className={`diff-indicator ${line.type === 'added' ? 'added' : ''}`}>+</span>
                            {line.chunks ? (
                              <span className="diff-text">
                                {line.chunks.map((chunk, chunkIdx) => (
                                  <span key={chunkIdx} className={`diff-chunk diff-chunk-${chunk.type}`}>
                                    {chunk.text}
                                  </span>
                                ))}
                              </span>
                            ) : (
                              <span className="diff-text">{line.content}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Styles */}
      <style>{`
        .diff-tool {
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
          align-items: center;
          gap: 12px;
        }

        .view-toggle {
          display: flex;
          background-color: var(--bg-tertiary);
          border-radius: 6px;
          padding: 2px;
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          border: none;
          border-radius: 4px;
          background-color: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
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

        .diff-stats-bar {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 8px 20px;
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .stat-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .stat-item.removed {
          color: var(--accent-danger);
        }
        .stat-item.removed .stat-dot {
          background-color: var(--accent-danger);
        }

        .stat-item.added {
          color: var(--accent-success);
        }
        .stat-item.added .stat-dot {
          background-color: var(--accent-success);
        }

        .stat-item.changed {
          color: var(--accent-warning);
        }
        .stat-item.changed .stat-dot {
          background-color: var(--accent-warning);
        }

        .diff-content {
          display: flex;
          flex: 1;
          gap: 1px;
          padding: 16px;
          background-color: var(--border-color);
          overflow: hidden;
        }

        .diff-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-secondary);
          border-radius: 10px;
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-bottom: 1px solid var(--border-color);
        }

        .panel-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .panel-actions {
          display: flex;
          gap: 4px;
        }

        .panel-body {
          flex: 1;
          padding: 12px;
          min-height: 0;
          overflow: auto;
        }

        .diff-line {
          padding: 2px 8px;
          border-radius: 3px;
          margin: 2px 0;
        }

        .diff-line.added {
          background-color: rgba(34, 197, 94, 0.15);
          color: var(--accent-success);
        }

        .diff-line.removed {
          background-color: rgba(239, 68, 68, 0.15);
          color: var(--accent-danger);
        }

        .diff-line.empty {
          background-color: var(--bg-tertiary);
          opacity: 0.5;
        }

        .diff-view.split-view {
          display: flex;
          flex-direction: column;
        }

        .diff-view.inline-view {
          display: flex;
          flex-direction: column;
        }

        .diff-line pre {
          margin: 0;
        }

        .diff-prefix {
          font-weight: bold;
          margin-right: 8px;
          min-width: 16px;
          display: inline-block;
        }

        .diff-line.added .diff-prefix {
          color: var(--accent-success);
        }

        .diff-view {
          font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
          font-size: 13px;
          line-height: 1.6;
          overflow: auto;
          height: 100%;
        }

        .diff-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .diff-table td {
          padding: 0;
          vertical-align: top;
        }

        .diff-row {
          height: 24px;
        }

        .diff-row-removed {
          background-color: rgba(239, 68, 68, 0.12);
        }

        .diff-row-added {
          background-color: rgba(34, 197, 94, 0.12);
        }

        .diff-row-unchanged {
          background-color: transparent;
        }

        .diff-row-empty {
          background-color: var(--bg-tertiary);
          opacity: 0.4;
        }

        .diff-line-num {
          width: 40px;
          min-width: 40px;
          padding: 0 8px;
          text-align: right;
          color: var(--text-secondary);
          background-color: var(--bg-tertiary);
          user-select: none;
          font-size: 12px;
          border-right: 1px solid var(--border-color);
        }

        .diff-line-content {
          padding: 0 8px;
          white-space: pre;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .diff-indicator {
          display: inline-block;
          width: 16px;
          font-weight: bold;
          color: var(--text-secondary);
        }

        .diff-indicator.removed {
          color: var(--accent-danger);
        }

        .diff-indicator.added {
          color: var(--accent-success);
        }

        .diff-text {
          color: var(--text-primary);
        }

        .diff-line-removed {
          background-color: rgba(239, 68, 68, 0.12);
          color: var(--accent-danger);
        }

        .diff-line-added {
          background-color: rgba(34, 197, 94, 0.12);
          color: var(--accent-success);
        }

        .diff-chunk-unchanged {
          color: var(--text-primary);
        }

        .diff-chunk-removed {
          color: var(--accent-danger);
          font-weight: bold;
          background-color: rgba(239, 68, 68, 0.2);
          padding: 0 2px;
          border-radius: 2px;
        }

        .diff-chunk-added {
          color: var(--accent-success);
          font-weight: bold;
          background-color: rgba(34, 197, 94, 0.2);
          padding: 0 2px;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}
