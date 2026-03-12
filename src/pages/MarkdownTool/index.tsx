// ========================================
// Markdown Tool Page
// ========================================

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  FileText,
  Eye,
  Type,
  Image,
  Link,
  Bold,
  Italic,
  List,
  Heading,
  Quote,
  Code,
  Table,
  Download,
  FileUp,
  ChevronRight,
  Copy,
  PanelLeft,
  Edit3,
  GripVertical,
  ExternalLink,
  FileType,
} from 'lucide-react';
import { marked } from 'marked';
import html2pdf from 'html2pdf.js';
import { MonacoWrapper } from '../../components/Editor/MonacoWrapper';

interface OutlineItem {
  level: number;
  title: string;
  id: string;
  line: number;
}

marked.setOptions({
  breaks: true,
  gfm: true,
});

function extractOutline(markdown: string): OutlineItem[] {
  const outline: OutlineItem[] = [];
  const lines = markdown.split('\n');
  let idCounter = 0;

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const title = match[2].trim();
      const id = `heading-${idCounter++}`;
      outline.push({ level, title, id, line: index });
    }
  });

  return outline;
}

function renderMarkdownWithIds(markdown: string): string {
  let idCounter = 0;
  const renderer = new marked.Renderer();
  
  renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
    const id = `heading-${idCounter++}`;
    return `<h${depth} id="${id}" data-heading-id="${id}">${text}</h${depth}>`;
  };
  
  marked.setOptions({ renderer });
  return marked(markdown) as string;
}

export function MarkdownTool() {
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [showOutline, setShowOutline] = useState(true);
  const [showEditor, setShowEditor] = useState(true);
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);
  const [activeOutline, setActiveOutline] = useState<string | null>(null);
  
  const [outlineWidth, setOutlineWidth] = useState(180);
  const [editorWidth, setEditorWidth] = useState(50);
  const [isResizingOutline, setIsResizingOutline] = useState(false);
  const [isResizingEditor, setIsResizingEditor] = useState(false);
  
  const outlineRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const outline = useMemo(() => extractOutline(content), [content]);

  const handleMouseDownOutline = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingOutline(true);
  }, []);

  const handleMouseDownEditor = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingEditor(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingOutline && outlineRef.current) {
        const newWidth = Math.max(120, Math.min(400, e.clientX - outlineRef.current.getBoundingClientRect().left));
        setOutlineWidth(newWidth);
      }
      if (isResizingEditor && editorRef.current) {
        const container = editorRef.current.parentElement;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const totalWidth = containerRect.width;
          const editorLeft = editorRef.current.getBoundingClientRect().left - containerRect.left;
          const newEditorWidth = Math.max(0, Math.min(100, ((e.clientX - containerRect.left - editorLeft) / totalWidth) * 100));
          setEditorWidth(newEditorWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingOutline(false);
      setIsResizingEditor(false);
    };

    if (isResizingOutline || isResizingEditor) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingOutline, isResizingEditor]);

  const renderedHtml = useMemo(() => {
    if (!content) return '';
    return renderMarkdownWithIds(content);
  }, [content]);

  const handleContentChange = useCallback((value: string | undefined) => {
    setContent(value || '');
  }, []);

  const handleInsertText = useCallback((before: string, after: string = '') => {
    const textarea = document.querySelector('.md-editor textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);

    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  }, [content]);

  const handleBold = () => handleInsertText('**', '**');
  const handleItalic = () => handleInsertText('*', '*');
  const handleHeading = () => handleInsertText('## ');
  const handleList = () => handleInsertText('- ');
  const handleQuote = () => handleInsertText('> ');
  const handleCode = () => handleInsertText('```\n', '\n```');
  const handleLink = () => handleInsertText('[', '](url)');
  const handleImage = () => handleInsertText('![alt](', ')');
  const handleTable = () => {
    const table = `\n| 列1 | 列2 | 列3 |\n|---|---|---|\n| 内容1 | 内容2 | 内容3 |\n`;
    handleInsertText(table, '');
  };

  const handleCopy = useCallback(async () => {
    if (content) {
      await navigator.clipboard.writeText(content);
    }
  }, [content]);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setContent(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  }, []);

  const handleExport = useCallback(() => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
  }, [content]);

  const handleExportPdf = useCallback(async () => {
    if (!content || !renderedHtml) return;
    
    const pdfContent = document.createElement('div');
    pdfContent.innerHTML = renderedHtml;
    pdfContent.style.cssText = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.8;
      color: #24292e;
      padding: 20px;
      max-width: 800px;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.4; }
      h1 { font-size: 28px; border-bottom: 1px solid #e1e4e8; padding-bottom: 8px; }
      h2 { font-size: 22px; border-bottom: 1px solid #e1e4e8; padding-bottom: 6px; }
      h3 { font-size: 18px; }
      h4 { font-size: 16px; }
      p { margin-bottom: 16px; }
      ul, ol { margin-bottom: 16px; padding-left: 24px; }
      li { margin-bottom: 4px; }
      strong { font-weight: 600; }
      em { font-style: italic; }
      a { color: #0366d6; text-decoration: none; }
      pre { background-color: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; margin-bottom: 16px; }
      code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 13px; }
      :not(pre) > code { background-color: #f6f8fa; padding: 2px 6px; border-radius: 4px; }
      blockquote { border-left: 4px solid #dfe2e5; padding-left: 16px; margin-bottom: 16px; color: #6a737d; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      th, td { border: 1px solid #dfe2e5; padding: 8px 12px; text-align: left; }
      th { background-color: #f6f8fa; font-weight: 600; }
      img { max-width: 100%; border-radius: 6px; }
      hr { border: none; border-top: 1px solid #e1e4e8; margin: 24px 0; }
    `;
    pdfContent.prepend(style);
    
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: 'document.pdf',
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    
    try {
      await html2pdf().set(opt).from(pdfContent).save();
    } catch (error) {
      console.error('导出 PDF 失败:', error);
    }
  }, [content, renderedHtml]);

  const handlePreviewHtml = useCallback(() => {
    if (!content) return;
    setShowHtmlPreview(true);
  }, [content]);

  const getHtmlPreviewSrcDoc = useCallback(() => {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown HTML 预览</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.8;
      color: #24292e;
      background-color: #fff;
    }
    .layout { display: flex; }
    .sidebar {
      width: 240px;
      flex-shrink: 0;
      background-color: #f6f8fa;
      border-right: 1px solid #e1e4e8;
      height: 100vh;
      position: sticky;
      top: 0;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    .sidebar-inner {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
      min-height: 100%;
    }
    .outline-title {
      font-size: 12px;
      font-weight: 600;
      color: #586069;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 16px;
      border-bottom: 1px solid #e1e4e8;
    }
    .outline-list { list-style: none; padding: 12px 0; flex: 1; }
    .outline-item {
      display: block;
      padding: 5px 16px;
      font-size: 13px;
      color: #586069;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .outline-item:hover { background-color: #e1e4e8; color: #0366d6; }
    .outline-item.active { background-color: #e1e4e8; color: #0366d6; border-right: 2px solid #0366d6; }
    .outline-item.level-1 { font-weight: 600; font-size: 14px; }
    .outline-item.level-2 { padding-left: 28px; }
    .outline-item.level-3 { padding-left: 40px; font-size: 12px; }
    .outline-item.level-4 { padding-left: 52px; font-size: 12px; }
    .outline-item.level-5 { padding-left: 64px; font-size: 12px; }
    .outline-item.level-6 { padding-left: 76px; font-size: 12px; }
    .resize-bar {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      cursor: col-resize;
      background: transparent;
      transition: background 0.2s;
      z-index: 10;
    }
    .resize-bar:hover, .resize-bar.resizing { background: #0366d6; }
    .content { flex: 1; padding: 40px 60px; max-width: 900px; min-width: 0; }
    h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.4; scroll-margin-top: 20px; }
    h1 { font-size: 28px; border-bottom: 1px solid #e1e4e8; padding-bottom: 8px; }
    h2 { font-size: 22px; border-bottom: 1px solid #e1e4e8; padding-bottom: 6px; }
    h3 { font-size: 18px; }
    h4 { font-size: 16px; }
    p { margin-bottom: 16px; }
    ul, ol { margin-bottom: 16px; padding-left: 24px; }
    li { margin-bottom: 4px; }
    strong { font-weight: 600; }
    em { font-style: italic; }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    pre { background-color: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; margin-bottom: 16px; }
    code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 13px; }
    :not(pre) > code { background-color: #f6f8fa; padding: 2px 6px; border-radius: 4px; }
    blockquote { border-left: 4px solid #dfe2e5; padding-left: 16px; margin-bottom: 16px; color: #6a737d; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th, td { border: 1px solid #dfe2e5; padding: 8px 12px; text-align: left; }
    th { background-color: #f6f8fa; font-weight: 600; }
    img { max-width: 100%; border-radius: 6px; }
    hr { border: none; border-top: 1px solid #e1e4e8; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="layout">
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-inner">
        <div class="outline-title">目录</div>
        <ul class="outline-list" id="outlineList">
          ${outline.map(item => `<li><a class="outline-item level-${item.level}" data-target="${item.id}" onclick="scrollToHeading('${item.id}')">${item.title}</a></li>`).join('')}
        </ul>
        <div class="resize-bar" id="resizeBar"></div>
      </div>
    </aside>
    <main class="content">
      ${renderedHtml}
    </main>
  </div>
  <script>
    const sidebar = document.getElementById('sidebar');
    const resizeBar = document.getElementById('resizeBar');
    let isResizing = false;
    let startX = 0;
    let startWidth = 240;

    resizeBar.addEventListener('mousedown', function(e) {
      isResizing = true;
      resizeBar.classList.add('resizing');
      startX = e.clientX;
      startWidth = sidebar.offsetWidth;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
      e.stopPropagation();
    });

    document.addEventListener('mousemove', function(e) {
      if (!isResizing) return;
      const diff = e.clientX - startX;
      const newWidth = Math.max(150, Math.min(500, startWidth + diff));
      sidebar.style.width = newWidth + 'px';
    });

    document.addEventListener('mouseup', function() {
      if (isResizing) {
        isResizing = false;
        resizeBar.classList.remove('resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });

    function scrollToHeading(id) {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', '#' + id);
      }
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll('.outline-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-target') === entry.target.id) {
              item.classList.add('active');
            }
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => observer.observe(h));
  </script>
</body>
</html>`;
  }, [content, renderedHtml, outline]);

  return (
    <div className="md-tool">
      {/* Header */}
      <header className="page-header">
        <div className="page-header-left">
          <FileText size={20} />
          <h1>Markdown 编辑器</h1>
        </div>
        <div className="page-header-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handlePreviewHtml}
            disabled={!content}
            title="在新窗口中预览 HTML 页面"
          >
            <ExternalLink size={14} />
            HTML 预览
          </button>
          <label className="btn btn-secondary">
            <FileUp size={14} />
            导入
            <input
              type="file"
              hidden
              accept=".md,.txt,.markdown"
              onChange={handleImport}
            />
          </label>
          <button className="btn btn-secondary" onClick={handleCopy}>
            <Copy size={14} />
            复制
          </button>
          <button className="btn btn-secondary" onClick={handleExport} disabled={!content}>
            <Download size={14} />
            导出 MD
          </button>
          <button className="btn btn-secondary" onClick={handleExportPdf} disabled={!content}>
            <FileType size={14} />
            导出 PDF
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="md-toolbar">
        <div className="toolbar-group">
          <button className="toolbar-btn" onClick={handleBold} title="粗体 (Ctrl+B)">
            <Bold size={16} />
          </button>
          <button className="toolbar-btn" onClick={handleItalic} title="斜体 (Ctrl+I)">
            <Italic size={16} />
          </button>
          <button className="toolbar-btn" onClick={handleHeading} title="标题">
            <Heading size={16} />
          </button>
        </div>
        <div className="toolbar-divider" />
        <div className="toolbar-group">
          <button className="toolbar-btn" onClick={handleList} title="无序列表">
            <List size={16} />
          </button>
          <button className="toolbar-btn" onClick={handleQuote} title="引用">
            <Quote size={16} />
          </button>
          <button className="toolbar-btn" onClick={handleCode} title="代码块">
            <Code size={16} />
          </button>
        </div>
        <div className="toolbar-divider" />
        <div className="toolbar-group">
          <button className="toolbar-btn" onClick={handleLink} title="链接">
            <Link size={16} />
          </button>
          <button className="toolbar-btn" onClick={handleImage} title="图片">
            <Image size={16} />
          </button>
          <button className="toolbar-btn" onClick={handleTable} title="表格">
            <Table size={16} />
          </button>
        </div>
        <div className="toolbar-spacer" />
        <button
          className={`toolbar-btn ${showOutline ? 'active' : ''}`}
          onClick={() => setShowOutline(!showOutline)}
          title="大纲"
        >
          <PanelLeft size={16} />
        </button>
        <button
          className={`toolbar-btn ${showEditor ? 'active' : ''}`}
          onClick={() => setShowEditor(!showEditor)}
          title="编辑器"
        >
          <Edit3 size={16} />
        </button>
        <button
          className={`toolbar-btn ${showPreview ? 'active' : ''}`}
          onClick={() => setShowPreview(!showPreview)}
          title="预览"
        >
          <Eye size={16} />
        </button>
      </div>

      {/* Main Content */}
      <div className="md-content">
        {/* Outline */}
        {showOutline && (
          <div className="md-outline" ref={outlineRef} style={{ width: outlineWidth }}>
            <div className="outline-header">
              <Type size={14} />
              <span>大纲</span>
            </div>
            <ul className="outline-list">
              {outline.length === 0 ? (
                <li className="outline-empty">暂无标题</li>
              ) : (
                outline.map((item) => (
                  <li
                    key={item.id}
                    className={`outline-item level-${item.level} ${activeOutline === item.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveOutline(item.id);
                      const heading = document.querySelector(`[data-heading-id="${item.id}"]`) as HTMLElement;
                      if (heading && previewRef.current) {
                        heading.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        previewRef.current.scrollTo({
                          top: heading.offsetTop - 20,
                          behavior: 'smooth'
                        });
                      }
                    }}
                  >
                    <ChevronRight size={12} />
                    {item.title}
                  </li>
                ))
              )}
            </ul>
            <div className="resize-handle" onMouseDown={handleMouseDownOutline}>
              <GripVertical size={12} />
            </div>
          </div>
        )}

        {/* Editor */}
        {showEditor && (
          <div 
            ref={editorRef}
            className={`md-editor ${showPreview ? 'with-preview' : ''}`}
            style={showPreview ? { flex: `0 0 ${editorWidth}%` } : { flex: 1 }}
          >
            <MonacoWrapper
              language="markdown"
              value={content}
              onChange={handleContentChange}
            />
            {showPreview && (
              <div className="resize-handle editor-resize" onMouseDown={handleMouseDownEditor}>
                <GripVertical size={12} />
              </div>
            )}
          </div>
        )}

        {/* Preview */}
        {showPreview && (
          <div 
            className="md-preview"
            ref={previewRef}
            style={showEditor ? { flex: `0 0 ${100 - editorWidth}%` } : { flex: 1 }}
          >
            <div className="preview-header">
              <Eye size={14} />
              <span>预览</span>
            </div>
            <div className="preview-content">
              <div
                className="markdown-body"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            </div>
          </div>
        )}
      </div>

      {showHtmlPreview && (
        <div className="html-preview-modal">
          <div className="html-preview-header">
            <div className="html-preview-title">
              <ExternalLink size={16} />
              <span>HTML 预览</span>
            </div>
            <button className="html-preview-close" onClick={() => setShowHtmlPreview(false)}>
              ×
            </button>
          </div>
          <div className="html-preview-content">
            <iframe
              srcDoc={getHtmlPreviewSrcDoc()}
              title="HTML Preview"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      )}

      <style>{`
        .md-tool {
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

        .md-toolbar {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 16px;
          background-color: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }

        .toolbar-group {
          display: flex;
          gap: 2px;
        }

        .toolbar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          background-color: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .toolbar-btn:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .toolbar-btn.active {
          background-color: var(--accent-primary);
          color: white;
        }

        .toolbar-divider {
          width: 1px;
          height: 20px;
          background-color: var(--border-color);
          margin: 0 4px;
        }

        .toolbar-spacer {
          flex: 1;
        }

        .md-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .md-outline {
          width: 180px;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          position: relative;
        }

        .resize-handle {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 6px;
          cursor: col-resize;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
          transition: background-color var(--transition-fast);
          z-index: 10;
        }

        .resize-handle:hover {
          background-color: var(--accent-primary);
          color: white;
        }

        .resize-handle.editor-resize {
          right: -3px;
        }

        .outline-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border-color);
        }

        .outline-list {
          list-style: none;
          padding: 8px;
          overflow-y: auto;
        }

        .outline-empty {
          padding: 12px;
          font-size: 12px;
          color: var(--text-tertiary);
          text-align: center;
        }

        .outline-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          font-size: 12px;
          color: var(--text-secondary);
          border-radius: 6px;
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .outline-item:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .outline-item.active {
          background-color: var(--accent-primary);
          color: white;
        }

        .outline-item.level-2 {
          padding-left: 20px;
        }

        .outline-item.level-3 {
          padding-left: 28px;
        }

        .outline-item.level-4 {
          padding-left: 36px;
        }

        .outline-item.level-5 {
          padding-left: 44px;
        }

        .outline-item.level-6 {
          padding-left: 52px;
        }

        .md-editor {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 12px;
          min-width: 0;
          position: relative;
        }

        .md-editor.with-preview {
          flex: 0.5;
        }

        .md-editor .resize-handle {
          position: absolute;
          right: -3px;
          top: 0;
          bottom: 0;
          width: 6px;
          cursor: col-resize;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-tertiary);
          transition: background-color var(--transition-fast);
          z-index: 10;
        }

        .md-editor .resize-handle:hover {
          background-color: var(--accent-primary);
          color: white;
        }

        .md-preview {
          flex: 0.5;
          display: flex;
          flex-direction: column;
          border-left: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
          min-width: 0;
        }

        .preview-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border-color);
        }

        .preview-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .markdown-body {
          font-size: 14px;
          line-height: 1.8;
          color: var(--text-primary);
        }

        .markdown-body h1,
        .markdown-body h2,
        .markdown-body h3,
        .markdown-body h4,
        .markdown-body h5,
        .markdown-body h6 {
          margin-top: 24px;
          margin-bottom: 16px;
          font-weight: 600;
          line-height: 1.4;
        }

        .markdown-body h1 { font-size: 28px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; }
        .markdown-body h2 { font-size: 22px; }
        .markdown-body h3 { font-size: 18px; }
        .markdown-body h4 { font-size: 16px; }

        .markdown-body p {
          margin-bottom: 16px;
        }

        .markdown-body ul,
        .markdown-body ol {
          margin-bottom: 16px;
          padding-left: 24px;
        }

        .markdown-body li {
          margin-bottom: 4px;
        }

        .markdown-body strong {
          font-weight: 600;
        }

        .markdown-body em {
          font-style: italic;
        }

        .markdown-body a {
          color: var(--accent-primary);
          text-decoration: none;
        }

        .markdown-body a:hover {
          text-decoration: underline;
        }

        .markdown-body pre {
          background-color: var(--bg-primary);
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          margin-bottom: 16px;
        }

        .markdown-body code {
          font-family: var(--font-mono);
          font-size: 13px;
        }

        .markdown-body :not(pre) > code {
          background-color: var(--bg-tertiary);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .markdown-body blockquote {
          border-left: 4px solid var(--accent-primary);
          padding-left: 16px;
          margin-bottom: 16px;
          color: var(--text-secondary);
        }

        .markdown-body table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
        }

        .markdown-body th,
        .markdown-body td {
          border: 1px solid var(--border-color);
          padding: 8px 12px;
          text-align: left;
        }

        .markdown-body th {
          background-color: var(--bg-tertiary);
          font-weight: 600;
        }

        .markdown-body img {
          max-width: 100%;
          border-radius: 8px;
        }

        .markdown-body hr {
          border: none;
          border-top: 1px solid var(--border-color);
          margin: 24px 0;
        }

        .html-preview-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }

        .html-preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
        }

        .html-preview-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
        }

        .html-preview-close {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          color: var(--text-secondary);
        }

        .html-preview-close:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .html-preview-content {
          flex: 1;
          padding: 0;
        }

        .html-preview-content iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
      `}</style>
    </div>
  );
}
