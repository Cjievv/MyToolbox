// ========================================
// Prompt Optimizer Tool Page
// ========================================

import { useState, useCallback } from 'react';
import {
  Sparkles,
  Copy,
  RefreshCw,
  Settings,
  ArrowRight,
  AlertCircle,
  Check,
  Loader2,
  FileText,
  Wand2,
  ChevronDown,
  ChevronUp,
  Zap,
  Eye,
  EyeOff,
} from 'lucide-react';
import { optimizePrompt, testApiKey, PROVIDERS } from '../../services/llm';
import type { LLMProvider } from '../../services/llm';

export function PromptOptimizer() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('llm_api_key') || '');
  const [provider, setProvider] = useState<LLMProvider>(() => {
    const stored = localStorage.getItem('llm_provider');
    return (stored as LLMProvider) || 'siliconflow';
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveSettings = useCallback((newApiKey: string, newProvider: LLMProvider) => {
    setApiKey(newApiKey);
    setProvider(newProvider);
    localStorage.setItem('llm_api_key', newApiKey);
    localStorage.setItem('llm_provider', newProvider);
    setError(null);
  }, []);

  const handleTestApiKey = useCallback(async () => {
    if (!apiKey.trim()) {
      setError('请先输入 API Key');
      return;
    }

    setIsTesting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await testApiKey(apiKey, provider);
      if (result.success) {
        setSuccessMessage(result.message);
        localStorage.setItem('llm_api_key', apiKey);
        localStorage.setItem('llm_provider', provider);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '验证失败');
    } finally {
      setIsTesting(false);
    }
  }, [apiKey, provider]);

  const handleOptimize = useCallback(async () => {
    if (!apiKey.trim()) {
      setError('请先配置 API Key');
      setShowSettings(true);
      return;
    }

    if (!input.trim()) {
      setError('请输入要优化的提示词');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setOutput('');

    try {
      const result = await optimizePrompt(input, apiKey, provider);
      setOutput(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '优化失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [input, apiKey, provider]);

  const handleCopy = useCallback(async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
    setSuccessMessage(null);
  }, []);

  const handleSwap = useCallback(() => {
    if (output) {
      setInput(output);
      setOutput('');
    }
  }, [output]);

  const currentProvider = PROVIDERS.find(p => p.id === provider);

  return (
    <div className="prompt-optimizer">
      <header className="page-header">
        <div className="page-header-left">
          <Wand2 size={20} />
          <h1>提示词优化</h1>
        </div>
        <div className="page-header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={14} />
            {apiKey ? '已配置' : '配置 API Key'}
            {showSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="settings-panel">
          <div className="settings-card">
            <div className="settings-header">
              <h3>
                <Settings size={16} />
                API 配置
              </h3>
              <button 
                className="btn-close"
                onClick={() => setShowSettings(false)}
              >
                ×
              </button>
            </div>
            
            <div className="settings-row">
              <div className="setting-item">
                <label>服务商</label>
                <select
                  value={provider}
                  onChange={(e) => handleSaveSettings(apiKey, e.target.value as LLMProvider)}
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="setting-item">
                <label>模型</label>
                <span className="model-badge">{currentProvider?.defaultModel}</span>
              </div>
            </div>
            
            <div className="setting-item">
              <label>API Key</label>
              <div className="api-key-input">
                <div className="api-key-field">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="输入 API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-toggle-visibility"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button
                  className="btn-test"
                  onClick={handleTestApiKey}
                  disabled={isTesting || !apiKey.trim()}
                >
                  {isTesting ? (
                    <Loader2 size={14} className="spin" />
                  ) : (
                    <Zap size={14} />
                  )}
                  测试
                </button>
              </div>
              <p className="setting-hint">
                {provider === 'minimax' && (
                  <>请从 MiniMax 开放平台获取 API Key</>
                )}
                {provider === 'siliconflow' && (
                  <>请从 <a href="https://siliconflow.cn" target="_blank" rel="noopener noreferrer">硅基流动</a> 获取 API Key</>
                )}
                {provider === 'openai' && (
                  <>请从 <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer">OpenAI</a> 获取 API Key</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="message-banner error">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {successMessage && (
        <div className="message-banner success">
          <Check size={16} />
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)}>×</button>
        </div>
      )}

      <div className="optimizer-content">
        <div className="optimizer-section input-section">
          <div className="section-header">
            <span className="section-title">
              <FileText size={14} />
              原始提示词
            </span>
            <div className="section-actions">
              <button
                className="btn btn-primary btn-optimize"
                onClick={handleOptimize}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="spin" />
                    优化中...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    优化
                  </>
                )}
              </button>
              <button className="btn btn-icon" onClick={handleClear} title="清空">
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
          <div className="section-body">
            <textarea
              className="prompt-input"
              placeholder="输入你想要优化的提示词...

例如：
帮我写一段Python代码"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <div className="section-footer">
            <span className="char-count">{input.length} 字符</span>
          </div>
        </div>

        <div className="optimizer-arrow">
          <ArrowRight size={20} />
        </div>

        <div className="optimizer-section output-section">
          <div className="section-header">
            <span className="section-title">
              <Sparkles size={14} />
              优化结果
            </span>
            <div className="section-actions">
              <button
                className="btn btn-icon"
                onClick={handleSwap}
                disabled={!output}
                title="将结果作为输入重新优化"
              >
                <RefreshCw size={14} />
              </button>
              <button
                className="btn btn-icon"
                onClick={handleCopy}
                disabled={!output}
                title="复制结果"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <div className="section-body">
            {output ? (
              <pre className="prompt-output">{output}</pre>
            ) : (
              <div className="output-placeholder">
                <Sparkles size={32} />
                <p>优化后的提示词将显示在这里</p>
                <p className="hint">点击"优化提示词"按钮开始</p>
              </div>
            )}
          </div>
          <div className="section-footer">
            <span className="char-count">{output.length} 字符</span>
          </div>
        </div>
      </div>

      <style>{`
        .prompt-optimizer {
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

        .settings-panel {
          padding: 16px 20px;
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .settings-card {
          background-color: var(--bg-tertiary);
          border-radius: 8px;
          padding: 16px;
        }

        .settings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .settings-header h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .btn-close {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-secondary);
          font-size: 18px;
          cursor: pointer;
        }

        .btn-close:hover {
          background-color: var(--bg-secondary);
          color: var(--text-primary);
        }

        .settings-row {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .settings-row .setting-item {
          flex: 1;
        }

        .setting-item {
          margin-bottom: 12px;
        }

        .setting-item:last-child {
          margin-bottom: 0;
        }

        .setting-item label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .settings-card select,
        .settings-card input {
          width: 100%;
          padding: 10px 12px;
          font-size: 13px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background-color: var(--bg-secondary);
          color: var(--text-primary);
        }

        .settings-card select:focus,
        .settings-card input:focus {
          outline: none;
          border-color: var(--accent-primary);
        }

        .api-key-input {
          display: flex;
          gap: 8px;
        }

        .api-key-field {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .api-key-field input {
          flex: 1;
          padding-right: 36px !important;
        }

        .btn-toggle-visibility {
          position: absolute;
          right: 8px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 4px;
          background: transparent;
          color: var(--text-tertiary);
          cursor: pointer;
        }

        .btn-toggle-visibility:hover {
          color: var(--text-secondary);
          background-color: var(--bg-tertiary);
        }

        .btn-test {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 500;
          border: none;
          border-radius: 6px;
          background-color: var(--accent-primary);
          color: white;
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }

        .btn-test:hover:not(:disabled) {
          opacity: 0.9;
        }

        .btn-test:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .setting-hint {
          font-size: 11px;
          color: var(--text-tertiary);
          margin-top: 6px;
        }

        .setting-hint a {
          color: var(--accent-primary);
        }

        .model-badge {
          display: inline-block;
          padding: 10px 12px;
          font-size: 13px;
          font-family: var(--font-mono);
          background-color: var(--bg-secondary);
          border-radius: 6px;
          color: var(--text-secondary);
        }

        .message-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          font-size: 13px;
          animation: slideDown 0.2s ease;
        }

        .message-banner.error {
          background-color: rgba(255, 59, 48, 0.1);
          border-bottom: 1px solid rgba(255, 59, 48, 0.2);
          color: var(--accent-danger);
        }

        .message-banner.success {
          background-color: rgba(52, 199, 89, 0.1);
          border-bottom: 1px solid rgba(52, 199, 89, 0.2);
          color: var(--accent-success);
        }

        .message-banner button {
          margin-left: auto;
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 0 4px;
        }

        .message-banner.error button {
          color: var(--accent-danger);
        }

        .message-banner.success button {
          color: var(--accent-success);
        }

        .optimizer-content {
          display: flex;
          flex: 1;
          padding: 16px;
          gap: 12px;
          overflow: hidden;
        }

        .optimizer-section {
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
          display: flex;
          align-items: center;
          gap: 6px;
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

        .optimizer-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .prompt-input {
          width: 100%;
          height: 100%;
          padding: 0;
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 14px;
          line-height: 1.6;
          resize: none;
          font-family: inherit;
        }

        .prompt-input:focus {
          outline: none;
        }

        .prompt-input::placeholder {
          color: var(--text-tertiary);
        }

        .prompt-output {
          margin: 0;
          padding: 0;
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-primary);
          white-space: pre-wrap;
          word-break: break-word;
          font-family: inherit;
        }

        .output-placeholder {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
          gap: 8px;
        }

        .output-placeholder p {
          margin: 0;
          font-size: 13px;
        }

        .output-placeholder .hint {
          font-size: 12px;
          opacity: 0.7;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          font-size: 13px;
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

        .btn-primary:hover:not(:disabled) {
          opacity: 0.9;
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
          background-color: var(--bg-sidebar-hover);
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
      `}</style>
    </div>
  );
}
