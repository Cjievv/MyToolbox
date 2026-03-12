// ========================================
// Excel Tool Page
// ========================================

import { useState, useCallback } from 'react';
import {
  FileSpreadsheet,
  Download,
  Clipboard,
  X,
  Check,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { MonacoWrapper } from '../../components/Editor/MonacoWrapper';

export function ExcelTool() {
  const [input, setInput] = useState('');
  const [parsedJson, setParsedJson] = useState<unknown>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [excelData, setExcelData] = useState<{ headers: string[]; rows: (string | null)[][] } | null>(null);

  const handleParseJson = useCallback(() => {
    if (!input.trim()) {
      setParsedJson(null);
      setIsValid(null);
      setExcelData(null);
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setParsedJson(parsed);
      setIsValid(true);
      processExcelData(parsed);
    } catch {
      setIsValid(false);
      setParsedJson(null);
      setExcelData(null);
    }
  }, [input]);

  const processExcelData = (data: unknown) => {
    if (Array.isArray(data)) {
      if (data.length === 0) {
        setExcelData(null);
        return;
      }
      
      // Extract headers from the first object
      const firstItem = data[0];
      if (typeof firstItem === 'object' && firstItem !== null) {
        const headers = Object.keys(firstItem);
        const rows = data.map(item => {
          if (typeof item === 'object' && item !== null) {
            return headers.map(header => {
              const value = (item as Record<string, unknown>)[header];
              return value === null || value === undefined ? null : String(value);
            });
          }
          return headers.map(() => null);
        });
        setExcelData({ headers, rows });
      }
    }
  };

  const handleDownloadExcel = useCallback(() => {
    if (!parsedJson) return;
    
    try {
      const worksheet = XLSX.utils.json_to_sheet(Array.isArray(parsedJson) ? parsedJson : [parsedJson]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      XLSX.writeFile(workbook, 'data.xlsx');
    } catch (error) {
      console.error('Error downloading Excel:', error);
    }
  }, [parsedJson]);

  const handlePaste = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    setInput(text);
  }, []);

  const handleClear = useCallback(() => {
    setInput('');
    setParsedJson(null);
    setIsValid(null);
    setExcelData(null);
  }, []);

  return (
    <div className="excel-tool">
      <header className="page-header">
        <div className="page-header-left">
          <FileSpreadsheet size={20} />
          <h1>JSON转换工具</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={handleParseJson}>
            转成Excel
          </button>
          <button className="btn btn-primary" onClick={handleDownloadExcel} disabled={!parsedJson}>
            <Download size={14} />
            下载Excel
          </button>
        </div>
      </header>

      <div className="excel-tool-content">
        <div className="excel-section">
          <div className="section-header">
            <span className="section-title">JSON输入</span>
            <div className="section-actions">
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
              language="json"
              value={input}
              onChange={setInput}
            />
          </div>
          <div className="section-footer">
            {isValid !== null && (
              <span className={`validation-badge ${isValid ? 'valid' : 'invalid'}`}>
                {isValid ? <Check size={12} /> : <X size={12} />}
                {isValid ? '格式有效' : '格式错误'}
              </span>
            )}
            <span className="char-count">{input.length} 字符</span>
          </div>
        </div>

        <div className="excel-preview-section">
          <div className="section-header">
            <span className="section-title">HTML预览</span>
          </div>
          <div className="section-body">
            {excelData ? (
              <div className="excel-preview">
                <table className="excel-table">
                  <thead>
                    <tr>
                      {excelData.headers.map((header, index) => (
                        <th key={index}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>{cell || ''}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="preview-placeholder">
                请先输入有效的 JSON 数组数据
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .excel-tool {
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

        .excel-tool-content {
          display: flex;
          flex: 1;
          padding: 16px;
          gap: 12px;
          overflow: hidden;
        }

        .excel-section,
        .excel-preview-section {
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
          overflow: auto;
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

        .preview-placeholder {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
          font-size: 13px;
        }

        .excel-preview {
          width: 100%;
          overflow: auto;
        }

        .excel-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          line-height: 1.4;
        }

        .excel-table th {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
          padding: 8px 12px;
          text-align: left;
          border: 1px solid var(--border-color);
          font-weight: 500;
        }

        .excel-table td {
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        .excel-table tr:nth-child(even) {
          background-color: rgba(0, 0, 0, 0.02);
        }

        .excel-table tr:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
}
