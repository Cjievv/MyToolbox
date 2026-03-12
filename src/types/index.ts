// ========================================
// MyToolbox - Type Definitions
// ========================================

export interface ToolConfig {
  id: string;
  name: string;
  icon: string;
  description?: string;
  path: string;
}

export interface EditorState {
  content: string;
  language: string;
  isDirty: boolean;
  isLoading: boolean;
}

export interface DiffState {
  leftContent: string;
  rightContent: string;
  diffMode: 'split' | 'inline';
  ignoreWhitespace: boolean;
}

export interface ConverterState {
  sourceFile: File | null;
  targetFormat: string;
  isConverting: boolean;
  progress: number;
}

export type Theme = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: Theme;
  fontSize: number;
  fontFamily: string;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  autoSave: boolean;
  autoCheckUpdate: boolean;
  sidebarWidth?: number;
  sidebarTools: string[];
}
