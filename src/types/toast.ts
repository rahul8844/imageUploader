export type ToastType = 'success' | 'error' | 'info' | 'warning';
export interface ToastProps {
    message: string;
    type: ToastType;
    isVisible: boolean;
    onClose?: () => void;
    duration?: number; // Duration in ms, if 0 or undefined (and not persistent logic handled by parent), it stays.
    isPersistent?: boolean; // If true, it won't auto-close.
}
