// ========================================
// MyToolbox - Main App
// ========================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { JsonTool } from './pages/JsonTool';
import { DiffTool } from './pages/DiffTool';
import { SqlTool } from './pages/SqlTool';
import { MarkdownTool } from './pages/MarkdownTool';
import { ConverterTool } from './pages/ConverterTool';
import { SettingsPage } from './pages/Settings';
import { CaseTool } from './pages/CaseTool';
import { ExcelTool } from './pages/ExcelTool';
import { PromptOptimizer } from './pages/PromptOptimizer';
import { useSettings } from './hooks/useSettings';

function App() {
  useSettings();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="json" element={<JsonTool />} />
          <Route path="diff" element={<DiffTool />} />
          <Route path="sql" element={<SqlTool />} />
          <Route path="markdown" element={<MarkdownTool />} />
          <Route path="converter" element={<ConverterTool />} />
          <Route path="case" element={<CaseTool />} />
          <Route path="excel" element={<ExcelTool />} />
          <Route path="prompt" element={<PromptOptimizer />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
