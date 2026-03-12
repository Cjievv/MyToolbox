// ========================================
// Layout Component
// ========================================

import { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import { UpdateAlert } from '../UpdateAlert';

const APP_VERSION = '0.3.0';

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const { settings, updateSettings } = useSettings();

  // Load sidebar width from settings
  useEffect(() => {
    if (settings.sidebarWidth) {
      setSidebarWidth(settings.sidebarWidth);
    }
  }, [settings.sidebarWidth]);

  // Update CSS variable when sidebar width changes
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
  }, [sidebarWidth]);

  // Handle sidebar width change
  const handleSidebarWidthChange = useCallback((width: number) => {
    setSidebarWidth(width);
    updateSettings({ sidebarWidth: width });
  }, [updateSettings]);

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        tools={settings.sidebarTools}
        width={sidebarWidth}
        onWidthChange={handleSidebarWidthChange}
      />
      <main className="main-content">
        <Outlet />
      </main>

      <UpdateAlert currentVersion={APP_VERSION} />

      <style>{`
        .app-layout {
          display: flex;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        .main-content {
          flex: 1;
          overflow: hidden;
          background-color: var(--bg-primary);
          transition: margin-left var(--transition-normal);
        }
      `}</style>
    </div>
  );
}
