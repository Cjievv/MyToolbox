// ========================================
// Case Converter Tool Page
// ========================================

import { useState, useCallback } from 'react';
import {
  ArrowRight,
  Trash2,
  Copy,
  Clipboard,
  Check,
  CaseUpper,
  CaseLower,
  Type,
} from 'lucide-react';

type ConversionType = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
};

const CONVERSION_TYPES: ConversionType[] = [
  {
    id: 'uppercase',
    name: '全大写',
    description: '转换为 UPPERCASE',
    icon: CaseUpper,
  },
  {
    id: 'lowercase',
    name: '全小写',
    description: '转换为 lowercase',
    icon: CaseLower,
  },
  {
    id: 'capitalize',
    name: '首字母大写',
    description: '每个单词首字母大写',
    icon: Type,
  },
  {
    id: 'camel-to-snake',
    name: '驼峰→下划线',
    description: 'camelCase → snake_case',
    icon: ArrowRight,
  },
  {
    id: 'camel-to-kebab',
    name: '驼峰→短横线',
    description: 'camelCase → kebab-case',
    icon: ArrowRight,
  },
  {
    id: 'snake-to-camel',
    name: '下划线→驼峰',
    description: 'snake_case → camelCase',
    icon: ArrowRight,
  },
  {
    id: 'kebab-to-camel',
    name: '短横线→驼峰',
    description: 'kebab-case → camelCase',
    icon: ArrowRight,
  },
  {
    id: 'snake-to-kebab',
    name: '下划线→短横线',
    description: 'snake_case → kebab-case',
    icon: ArrowRight,
  },
  {
    id: 'kebab-to-snake',
    name: '短横线→下划线',
    description: 'kebab-case → snake_case',
    icon: ArrowRight,
  },
];

function toCamelCase(str: string): string {
  return str.replace(/[-_](\w)/g, (_, c) => (c ? c.toUpperCase() : ''));
}

function toSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').replace(/[-\s]+/g, '_').toLowerCase().replace(/^_/, '');
}

function toKebabCase(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').replace(/[_\s]+/g, '-').toLowerCase().replace(/^-/, '');
}

function convert(text: string, typeId: string): string {
  if (!text.trim()) return '';

  const lines = text.split('\n');
  
  return lines.map((line) => {
    switch (typeId) {
      case 'uppercase':
        return line.toUpperCase();
      case 'lowercase':
        return line.toLowerCase();
      case 'capitalize':
        return line
          .toLowerCase()
          .replace(/(?:^|\s|[-_])\w/g, (char) => char.toUpperCase());
      case 'camel-to-snake':
        return toSnakeCase(line);
      case 'camel-to-kebab':
        return toKebabCase(line);
      case 'snake-to-camel':
        return toCamelCase(line);
      case 'kebab-to-camel':
        return toCamelCase(line);
      case 'snake-to-kebab':
        return toKebabCase(line);
      case 'kebab-to-snake':
        return toSnakeCase(line);
      default:
        return line;
    }
  }).join('\n');
}

export function CaseTool() {
  const [selectedType, setSelectedType] = useState(CONVERSION_TYPES[0]);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleConvert = useCallback(() => {
    const result = convert(inputText, selectedType.id);
    setOutputText(result);
  }, [inputText, selectedType]);

  const handleClear = useCallback(() => {
    setInputText('');
    setOutputText('');
  }, []);

  const handleCopy = useCallback(async () => {
    if (outputText) {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [outputText]);

  const handlePaste = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    setInputText(text);
  }, []);

  const handleTypeSelect = useCallback((type: ConversionType) => {
    setSelectedType(type);
    if (inputText) {
      const result = convert(inputText, type.id);
      setOutputText(result);
    }
  }, [inputText]);

  return (
    <div className="case-tool">
      <header className="page-header">
        <div className="page-header-left">
          <h1>大小写转换</h1>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary" onClick={handleClear}>
            <Trash2 size={14} />
            清空
          </button>
        </div>
      </header>

      <div className="case-content">
        <div className="case-cards">
          {CONVERSION_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.id}
                className={`case-card ${selectedType.id === type.id ? 'active' : ''}`}
                onClick={() => handleTypeSelect(type)}
              >
                <Icon size={18} />
                <div className="card-info">
                  <span className="card-name">{type.name}</span>
                  <span className="card-desc">{type.description}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="case-sections">
          <div className="case-section">
            <div className="section-label">
              <span>输入</span>
              <div className="input-actions">
                <button className="btn btn-icon" onClick={handlePaste} title="粘贴">
                  <Clipboard size={14} />
                </button>
              </div>
            </div>
            <textarea
              className="case-textarea"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="请输入需要转换的文本..."
            />
          </div>

          <div className="case-action">
            <button
              className="btn btn-primary btn-convert"
              onClick={handleConvert}
              disabled={!inputText.trim()}
            >
              <ArrowRight size={16} />
              转换
            </button>
          </div>

          <div className="case-section">
            <div className="section-label">
              <span>输出</span>
              <div className="output-actions">
                <button className="btn btn-icon" onClick={handleCopy} disabled={!outputText} title="复制">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <textarea
              className="case-textarea output"
              value={outputText}
              readOnly
              placeholder="转换结果将显示在这里"
            />
          </div>
        </div>
      </div>

      <style>{`
        .case-tool {
          display: flex;
          flex-direction: column;
          height: 100%;
          background-color: var(--bg-secondary);
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          border-bottom: 1px solid var(--border-light);
          background-color: var(--bg-secondary);
        }

        .page-header-left h1 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .case-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px 32px;
          max-width: 900px;
          margin: 0 auto;
          width: 100%;
        }

        .case-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 10px;
          margin-bottom: 24px;
        }

        .case-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background-color: var(--bg-primary);
          border: 2px solid transparent;
          border-radius: 10px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .case-card:hover {
          border-color: var(--accent-primary);
        }

        .case-card.active {
          background-color: var(--accent-primary);
          border-color: var(--accent-primary);
        }

        .case-card svg {
          flex-shrink: 0;
          color: var(--text-secondary);
        }

        .case-card.active svg {
          color: white;
        }

        .card-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }

        .card-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .case-card.active .card-name {
          color: white;
        }

        .card-desc {
          font-size: 11px;
          color: var(--text-tertiary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .case-card.active .card-desc {
          color: rgba(255, 255, 255, 0.7);
        }

        .case-sections {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .case-section {
          flex: 1;
        }

        .section-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .input-actions,
        .output-actions {
          display: flex;
          gap: 4px;
        }

        .case-textarea {
          width: 100%;
          min-height: 120px;
          padding: 12px 16px;
          font-size: 14px;
          font-family: var(--font-mono);
          line-height: 1.6;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          resize: vertical;
          transition: all var(--transition-fast);
        }

        .case-textarea:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
        }

        .case-textarea.output {
          background-color: var(--bg-tertiary);
        }

        .case-textarea::placeholder {
          color: var(--text-tertiary);
        }

        .case-action {
          display: flex;
          justify-content: center;
        }

        .btn-convert {
          min-width: 120px;
          padding: 10px 24px;
        }

        .btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          padding: 0;
          border: none;
          border-radius: 6px;
          background-color: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-icon:hover:not(:disabled) {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .btn-icon:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          transition: all var(--transition-fast);
          border: none;
        }

        .btn-primary {
          background-color: var(--accent-primary);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #0066cc;
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .btn-secondary:hover {
          background-color: var(--border-color);
        }
      `}</style>
    </div>
  );
}
