export interface VersionInfo {
  version: string;
  macUrl: string;
  windowsUrl: string;
  releaseNotes?: string;
}

export const checkForUpdate = async (currentVersion: string): Promise<VersionInfo | null> => {
  const platform = getPlatform();
  const versionUrl = getVersionUrl(platform);

  try {
    const response = await fetch(versionUrl);
    if (!response.ok) {
      return null;
    }
    const latestVersion: VersionInfo = await response.json();

    if (isNewerVersion(latestVersion.version, currentVersion)) {
      return latestVersion;
    }
    return null;
  } catch (error) {
    console.error('Version check failed:', error);
    return null;
  }
};

export const getPlatform = (): 'mac' | 'windows' => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('mac') || userAgent.includes('darwin')) {
    return 'mac';
  }
  return 'windows';
};

const getVersionUrl = (platform: 'mac' | 'windows'): string => {
  const urls = {
    mac: 'https://gist.githubusercontent.com/Cjievv/5ed754cc63118a08e2c56b04455f7799/raw/latest-mac.json',
    windows: 'https://gist.githubusercontent.com/Cjievv/3bbb8aa153afa570f0048db46cc59bb4/raw/latest-windows.json',
  };
  return urls[platform];
};

const isNewerVersion = (latest: string, current: string): boolean => {
  const latestParts = latest.split('.').map(Number);
  const currentParts = current.split('.').map(Number);

  for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
    const latestPart = latestParts[i] || 0;
    const currentPart = currentParts[i] || 0;
    if (latestPart > currentPart) return true;
    if (latestPart < currentPart) return false;
  }
  return false;
};

export const openDownloadPage = (url: string) => {
  window.open(url, '_blank');
};
