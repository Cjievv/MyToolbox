import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { checkForUpdate, openDownloadPage, getPlatform } from '../../services/version';
import type { VersionInfo } from '../../services/version';
import { useSettings } from '../../hooks/useSettings';

interface UpdateAlertProps {
  currentVersion: string;
}

export function UpdateAlert({ currentVersion }: UpdateAlertProps) {
  const [updateInfo, setUpdateInfo] = useState<VersionInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    const check = async () => {
      if (!settings.autoCheckUpdate) {
        setIsChecking(false);
        return;
      }

      const latest = await checkForUpdate(currentVersion);
      setUpdateInfo(latest);
      setIsChecking(false);
    };

    check();
  }, [currentVersion, settings.autoCheckUpdate]);

  if (isChecking || !updateInfo || dismissed) {
    return null;
  }

  const platform = getPlatform();
  const downloadUrl = platform === 'mac' ? updateInfo.macUrl : updateInfo.windowsUrl;

  return (
    <div className="update-alert">
      <div className="update-content">
        <Download size={18} className="update-icon" />
        <div className="update-text">
          <div className="update-title">
            发现新版本 v{updateInfo.version}
          </div>
          {updateInfo.releaseNotes && (
            <div className="update-notes">{updateInfo.releaseNotes}</div>
          )}
        </div>
      </div>
      <div className="update-actions">
        <button
          className="update-btn update-btn-primary"
          onClick={() => openDownloadPage(downloadUrl)}
        >
          下载新版本
        </button>
        <button
          className="update-btn update-btn-secondary"
          onClick={() => setDismissed(true)}
        >
          <X size={16} />
        </button>
      </div>

      <style>{`
        .update-alert {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
          max-width: 360px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .update-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .update-icon {
          color: var(--accent-color);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .update-text {
          flex: 1;
          min-width: 0;
        }

        .update-title {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
        }

        .update-notes {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 4px;
          line-height: 1.4;
        }

        .update-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .update-btn {
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .update-btn-primary {
          background: var(--accent-color);
          color: white;
          padding: 8px 16px;
        }

        .update-btn-primary:hover {
          opacity: 0.9;
        }

        .update-btn-secondary {
          background: transparent;
          color: var(--text-secondary);
          padding: 6px;
        }

        .update-btn-secondary:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
