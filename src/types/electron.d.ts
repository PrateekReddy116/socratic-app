export interface ElectronAPI {
  hideWindow: () => void;
  getApiKeys: () => Promise<{
    GROQ_API_KEY: string;
    GEMINI_API_KEY: string;
    GEMINI_MODEL: string;
  }>;
  onWindowVisibilityChange: (callback: (visible: boolean) => void) => void;
  onScreenCaptured: (callback: (base64Image: string) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
