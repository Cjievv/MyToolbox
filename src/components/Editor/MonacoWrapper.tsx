// ========================================
// Monaco Editor Wrapper
// ========================================

import Editor from '@monaco-editor/react';

interface MonacoWrapperProps {
  language?: string;
  value?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export function MonacoWrapper({
  language = 'json',
  value = '',
  onChange,
  readOnly = false,
}: MonacoWrapperProps) {
  const handleChange = (val: string | undefined) => {
    if (onChange) {
      onChange(val || '');
    }
  };

  return (
    <div className="editor-wrapper">
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={value}
        onChange={handleChange}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'SF Mono, Monaco, monospace',
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          folding: true,
          renderLineHighlight: 'all',
          matchBrackets: 'always',
        }}
      />
      <style>{`
        .editor-wrapper {
          flex: 1;
          height: 100%;
          min-height: 0;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }
      `}</style>
    </div>
  );
}
