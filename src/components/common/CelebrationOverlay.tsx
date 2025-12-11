'use client';

import React, { useEffect, useState } from 'react';
import styles from './CelebrationOverlay.module.css';

interface CelebrationOverlayProps {
    isVisible: boolean;
    onComplete: () => void;
    text?: string;
    style?: React.CSSProperties;
}

const CelebrationOverlay = ({ isVisible, onComplete, text = "WOOOOO!", style = {} }: CelebrationOverlayProps) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                onComplete();
            }, 1200); // Shorter duration for rapid combos
            return () => clearTimeout(timer);
        }
    }, [isVisible, onComplete]);

    if (!show) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.text} style={style}>{text}</div>
        </div>
    );
};

export default CelebrationOverlay;
