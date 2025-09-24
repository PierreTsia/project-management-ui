const UI_FLAG_STORAGE_KEY = 'feature_ai_taskgen';

export function isAiTaskGenEnabled(): boolean {
  const stored = localStorage.getItem(UI_FLAG_STORAGE_KEY);
  if (stored === 'true') return true;
  if (stored === 'false') return false;
  return (import.meta.env.VITE_FEATURE_AI_TASKGEN as string) === 'true';
}

export function setAiTaskGenEnabled(isEnabled: boolean): void {
  localStorage.setItem(UI_FLAG_STORAGE_KEY, isEnabled ? 'true' : 'false');
}

export function getAiTaskGenFlagSource(): 'localStorage' | 'env' {
  return localStorage.getItem(UI_FLAG_STORAGE_KEY) === null
    ? 'env'
    : 'localStorage';
}
