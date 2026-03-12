// ========================================
// JSON Tool Page
// ========================================

import { useState, useCallback } from 'react';
import {
  AlignLeft,
  Minimize2,
  Check,
  X,
  Copy,
  FileJson,
  ArrowRightLeft,
  TreeDeciduous,
  Download,
  Clipboard,
} from 'lucide-react';
import yaml from 'js-yaml';
import { MonacoWrapper } from '../../components/Editor/MonacoWrapper';

interface JsonTreeNode {
  key: string;
  value: unknown;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  children?: JsonTreeNode[];
}

function buildTree(key: string, value: unknown): JsonTreeNode {
  if (value === null) {
    return { key, value: 'null', type: 'null' };
  }
  if (Array.isArray(value)) {
    return {
      key,
      value: `Array[${value.length}]`,
      type: 'array',
      children: value.map((item, index) => buildTree(`[${index}]`, item)),
    };
  }
  if (typeof value === 'object') {
    return {
      key,
      value: `Object{${Object.keys(value as Record<string, unknown>).length}}`,
      type: 'object',
      children: Object.entries(value as Record<string, unknown>).map(([k, v]) => buildTree(k, v)),
    };
  }
  if (typeof value === 'string') {
    return { key, value: `"${value}"`, type: 'string' };
  }
  if (typeof value === 'number') {
    return { key, value: String(value), type: 'number' };
  }
  if (typeof value === 'boolean') {
    return { key, value: String(value), type: 'boolean' };
  }
  return { key, value: String(value), type: 'null' };
}

function TreeView({ data }: { data: unknown }) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(['root']));

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const renderNode = (node: JsonTreeNode, depth: number = 0, path: string = 'root') => {
    const isExpandable = node.children && node.children.length > 0;
    const isExpanded = expandedKeys.has(path);

    const getTypeColor = () => {
      switch (node.type) {
        case 'object': return 'var(--accent-warning)';
        case 'array': return 'var(--accent-primary)';
        case 'string': return 'var(--accent-success)';
        case 'number': return 'var(--accent-info)';
        case 'boolean': return 'var(--accent-danger)';
        case 'null': return 'var(--text-tertiary)';
        default: return 'var(--text-primary)';
      }
    };

    return (
      <div key={path} className="tree-node" style={{ paddingLeft: depth * 16 }}>
        {isExpandable ? (
          <span className="tree-toggle" onClick={() => toggleExpand(path)}>
            {isExpanded ? '▼' : '▶'} <span style={{ color: getTypeColor() }}>{String(node.key)}</span>: {String(node.value)}
          </span>
        ) : (
          <span className="tree-leaf">
            <span style={{ color: 'var(--text-secondary)' }}>{String(node.key)}</span>: <span style={{ color: getTypeColor() }}>{String(node.value)}</span>
          </span>
        )}
        {isExpandable && isExpanded && (
          <div className="tree-children">
            {node.children!.map((child, index) => renderNode(child, depth + 1, `${path}.${child.key || index}`))}
          </div>
        )}
      </div>
    );
  };

  const treeData = buildTree('root', data);
  return <div className="tree-view">{renderNode(treeData)}</div>;
}

export function JsonTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [parsedJson, setParsedJson] = useState<unknown>(null);
  const [activeTab, setActiveTab] = useState<'formatted' | 'tree' | 'yaml'>('formatted');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [indentSize, setIndentSize] = useState(2);

  const handleFormat = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setIsValid(null);
      setParsedJson(null);
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutput(formatted);
      setParsedJson(parsed);
      setIsValid(true);
    } catch {
      setIsValid(false);
      setParsedJson(null);
    }
  }, [input, indentSize]);

  const handleMinify = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setIsValid(null);
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setParsedJson(parsed);
      setIsValid(true);
    } catch {
      setIsValid(false);
    }
  }, [input]);

  const handleConvertToYaml = useCallback(() => {
    if (!parsedJson) {
      if (input.trim()) {
        try {
          const parsed = JSON.parse(input);
          const yamlStr = yaml.dump(parsed, { indent: indentSize, lineWidth: -1 });
          setOutput(yamlStr);
          setParsedJson(parsed);
          setIsValid(true);
        } catch {
          setIsValid(false);
        }
      }
      return;
    }
    const yamlStr = yaml.dump(parsedJson, { indent: indentSize, lineWidth: -1 });
    setOutput(yamlStr);
    setActiveTab('yaml');
  }, [parsedJson, input, indentSize]);

  const handleCopy = useCallback(async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
    }
  }, [output]);

  const handlePaste = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    setInput(text);
  }, []);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setIsValid(null);
    setParsedJson(null);
  }, []);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const handleTabChange = useCallback((tab: 'formatted' | 'tree' | 'yaml') => {
    setActiveTab(tab);
    if (tab === 'yaml' && parsedJson) {
      const yamlStr = yaml.dump(parsedJson, { indent: indentSize, lineWidth: -1 });
      setOutput(yamlStr);
    } else if (tab === 'formatted' && parsedJson) {
      const formatted = JSON.stringify(parsedJson, null, indentSize);
      setOutput(formatted);
    }
  }, [parsedJson, indentSize]);

  return (
    <div className="json-tool">
      <header className="page-header">
        <div className="page-header-left">
          <FileJson size={20} />
          <h1>JSON 工具</h1>
        </div>
        <div className="page-header-actions">
          <select
            className="indent-select"
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
          >
            <option value={2}>2 空格缩进</option>
            <option value={4}>4 空格缩进</option>
          </select>
          <button className="btn btn-secondary" onClick={handleFormat}>
            <AlignLeft size={14} />
            格式化
          </button>
          <button className="btn btn-secondary" onClick={handleMinify}>
            <Minimize2 size={14} />
            压缩
          </button>
          <button className="btn btn-secondary" onClick={handleConvertToYaml}>
            <ArrowRightLeft size={14} />
            转 YAML
          </button>
          <button className="btn btn-primary" onClick={handleCopy} disabled={!output}>
            <Copy size={14} />
            复制结果
          </button>
        </div>
      </header>

      <div className="json-tool-content">
        <div className="json-section">
          <div className="section-header">
            <span className="section-title">输入</span>
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

        <div className="json-arrow">
          <ArrowRightLeft size={20} />
        </div>

        <div className="json-section">
          <div className="section-header">
            <div className="section-tabs">
              <button
                className={`section-tab ${activeTab === 'formatted' ? 'active' : ''}`}
                onClick={() => handleTabChange('formatted')}
              >
                <AlignLeft size={14} />
                格式化
              </button>
              <button
                className={`section-tab ${activeTab === 'tree' ? 'active' : ''}`}
                onClick={() => handleTabChange('tree')}
              >
                <TreeDeciduous size={14} />
                树形
              </button>
              <button
                className={`section-tab ${activeTab === 'yaml' ? 'active' : ''}`}
                onClick={() => handleTabChange('yaml')}
              >
                <FileJson size={14} />
                YAML
              </button>
            </div>
            <div className="section-actions">
              <button className="btn btn-icon" onClick={handleDownload} disabled={!output} title="下载">
                <Download size={14} />
              </button>
            </div>
          </div>
          <div className="section-body">
            {activeTab === 'formatted' && (
              <MonacoWrapper language="json" value={output} readOnly />
            )}
            {activeTab === 'tree' && (
              parsedJson ? (
                <TreeView data={parsedJson} />
              ) : (
                <div className="tree-view-placeholder">
                  请先输入有效的 JSON 数据
                </div>
              )
            )}
            {activeTab === 'yaml' && (
              <MonacoWrapper language="yaml" value={output} readOnly />
            )}
          </div>
          <div className="section-footer">
            <span className="char-count">{output.length} 字符</span>
          </div>
        </div>
      </div>

      <style>{`
        .json-tool {
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

        .indent-select {
          padding: 6px 10px;
          font-size: 13px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
          cursor: pointer;
        }

        .json-tool-content {
          display: flex;
          flex: 1;
          padding: 16px;
          gap: 12px;
          overflow: hidden;
        }

        .json-section {
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

        .section-tabs {
          display: flex;
          gap: 4px;
        }

        .section-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          border: none;
          border-radius: 6px;
          background-color: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .section-tab:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .section-tab.active {
          background-color: var(--accent-primary);
          color: white;
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

        .json-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
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

        .tree-view {
          font-family: var(--font-mono);
          font-size: 13px;
          line-height: 1.6;
          color: var(--text-primary);
        }

        .tree-node {
          margin: 2px 0;
        }

        .tree-toggle {
          cursor: pointer;
          user-select: none;
        }

        .tree-toggle:hover {
          background-color: var(--bg-tertiary);
        }

        .tree-leaf {
          font-family: var(--font-mono);
        }

        .tree-children {
          margin-left: 8px;
          border-left: 1px solid var(--border-color);
          padding-left: 4px;
        }

        .tree-view-placeholder {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
          font-size: 13px;
        }
      `}</style>
    </div>
  );
}
