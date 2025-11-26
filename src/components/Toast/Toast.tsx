import React, { useEffect, useState } from 'react';
import { ICONS } from '../../constants/constants';
import type { ToastProps } from '../../types/toast';
import './Toast.css';

const Toast: React.FC<ToastProps> = ({
    message,
    type,
    isVisible,
    onClose,
    duration = 3000,
    isPersistent = false
}) => {
    const [show, setShow] = useState(isVisible);

    useEffect(() => {
        setShow(isVisible);
    }, [isVisible]);

    useEffect(() => {
        if (show && !isPersistent && duration > 0) {
            const timer = setTimeout(() => {
                setShow(false);
                if (onClose) onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [show, isPersistent, duration, onClose]);

    if (!show) return null;

    return (
        <div className={`toast toast-${type} ${show ? 'show' : ''}`}>
            <span className="toast-icon">{ICONS[type]}</span>
            <span className="toast-message">{message}</span>
            {!isPersistent && (
                <button className="toast-close" onClick={() => {
                    setShow(false);
                    if (onClose) onClose();
                }}>
                    ×
                </button>
            )}
        </div>
    );
};

export default Toast;
