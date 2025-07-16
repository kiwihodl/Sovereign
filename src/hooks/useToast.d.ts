type ShowToast = (severity: string, summary: string, detail: string) => void;
export function useToast(): { showToast: ShowToast };
export const ToastProvider: React.FC<{ children: React.ReactNode }>;
