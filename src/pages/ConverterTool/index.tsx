// ========================================
// JSON to Excel Converter Tool Page
// ========================================

import { useState, useCallback } from 'react';
import {
  Trash2,
  Download,
  Loader2,
} from 'lucide-react';
import * as XLSX from 'xlsx';

export function ConverterTool() {
  const [inputText, setInputText] = useState('');
  const [outputData, setOutputData] = useState<Record<string, unknown>[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState('');
  const [hasConverted, setHasConverted] = useState(false);

  const handleConvert = useCallback(() => {
    if (!inputText.trim()) return;

    setIsConverting(true);
    setError('');

    setTimeout(() => {
      try {
        const jsonData = JSON.parse(inputText);
        if (!Array.isArray(jsonData)) {
          throw new Error('请输入数组格式的 JSON 数据');
        }
        setOutputData(jsonData);
        setHasConverted(true);
      } catch (e) {
        setError((e as Error).message);
        setOutputData([]);
        setHasConverted(false);
      }
      setIsConverting(false);
    }, 100);
  }, [inputText]);

  const handleClear = useCallback(() => {
    setInputText('');
    setOutputData([]);
    setError('');
    setHasConverted(false);
  }, []);

  const handleDownload = useCallback(() => {
    if (outputData.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(outputData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'converted.xlsx');
  }, [outputData]);

  const handleViewExample = useCallback(() => {
    const example = `[
  {"分组1": "馨兰", "分组2": "慧美", "分组3": "虹影"},
  {"分组1": "虹雨", "分组2": "虹芙", "分组3": "慧艳"},
  {"分组1": "慧云", "分组2": "慧颖", "分组3": "怀玉"},
  {"分组1": "慧捷", "分组2": "慧俊", "分组3": "和洽"},
  {"分组1": "晗昱", "分组2": "虹颖", "分组3": "虹彩"},
  {"分组1": "慧心", "分组2": "慧雅", "分组3": "浩岚"},
  {"分组1": "馨欣", "分组2": "慧智", "分组3": "慧月"},
  {"分组1": "慧英", "分组2": "慧巧", "分组3": "慧秀"},
  {"分组1": "虹蝶", "分组2": "慧丽", "分组3": ""}
]`;
    setInputText(example);
    setError('');
  }, []);

  return (
    <div className="converter-tool">
      <header className="page-header">
        <div className="page-header-left">
          <h1>JSON转Excel工具</h1>
        </div>
        <div className="page-header-actions">
          <button
            className="btn btn-secondary"
            onClick={handleViewExample}
          >
            查看示例
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleClear}
          >
            <Trash2 size={14} />
            清空
          </button>
        </div>
      </header>

      <div className="converter-content">
        <div className="input-section">
          <textarea
            className="input-textarea"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="请输入 JSON 格式的数据..."
          />
        </div>

        <div className="action-row">
          <button
            className="btn btn-primary"
            onClick={handleConvert}
            disabled={isConverting || !inputText.trim()}
          >
            {isConverting ? (
              <>
                <Loader2 size={16} className="spinner" />
                转换中...
              </>
            ) : (
              <>
                <Download size={16} />
                转成Excel
              </>
            )}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleDownload}
            disabled={outputData.length === 0}
          >
            <Download size={14} />
            下载Excel
          </button>
        </div>

        {error && (
          <div className="error-message">
            转换错误: {error}
          </div>
        )}

        {hasConverted && outputData.length > 0 && (
          <div className="preview-section">
            <h3>预览</h3>
            <div className="preview-table">
              <table>
                <thead>
                  <tr>
                    {Object.keys(outputData[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {outputData.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex}>{String(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .converter-tool {
          display: flex;
          flex-direction: column;
          height: 100%;
          background-color: var(--bg-primary);
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }

        .page-header-left h1 {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .page-header-actions {
          display: flex;
          gap: 8px;
        }

        .converter-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .input-section {
          margin-bottom: 16px;
        }

        .input-textarea {
          width: 100%;
          min-height: 280px;
          padding: 12px 16px;
          font-size: 14px;
          font-family: var(--font-mono);
          line-height: 1.6;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          resize: vertical;
          transition: all var(--transition-fast);
        }

        .input-textarea:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
        }

        .input-textarea::placeholder {
          color: var(--text-tertiary);
        }

        .action-row {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-primary {
          background-color: var(--accent-primary);
          color: white;
        }

        .btn-primary:hover {
          background-color: var(--accent-primary-hover);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background-color: var(--bg-tertiary);
          color: var(--text-secondary);
        }

        .btn-secondary:hover {
          background-color: var(--border-color);
          color: var(--text-primary);
        }

        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-message {
          padding: 12px 16px;
          background-color: rgba(245, 34, 45, 0.1);
          border: 1px solid rgba(245, 34, 45, 0.3);
          border-radius: 8px;
          color: var(--accent-danger);
          font-size: 13px;
          margin-bottom: 16px;
        }

        .preview-section {
          margin-top: 8px;
        }

        .preview-section h3 {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .preview-table {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        table {
          width: 100%;
          border-collapse: collapse;
          background-color: var(--bg-secondary);
        }

        th, td {
          padding: 10px 14px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }

        th {
          background-color: var(--bg-tertiary);
          font-weight: 600;
          color: var(--text-primary);
          font-size: 13px;
        }

        td {
          color: var(--text-secondary);
          font-size: 13px;
        }

        tr:last-child td {
          border-bottom: none;
        }

        tr:nth-child(even) {
          background-color: var(--bg-primary);
        }

        tr:hover {
          background-color: var(--bg-tertiary);
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
