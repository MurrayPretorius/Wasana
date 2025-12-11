'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import CelebrationOverlay from '@/components/common/CelebrationOverlay';
import confetti from 'canvas-confetti';

interface CelebrationContextType {
    triggerCelebration: () => void;
    triggerMiniCelebration: () => void;
}

const CelebrationContext = createContext<CelebrationContextType | undefined>(undefined);

export const CelebrationProvider = ({ children }: { children: ReactNode }) => {
    const [showOverlay, setShowOverlay] = useState(false);
    const [combo, setCombo] = useState(0);
    const [comboTimer, setComboTimer] = useState<NodeJS.Timeout | null>(null);
    const [overlayText, setOverlayText] = useState('WOOOOO!');
    const [overlayStyle, setOverlayStyle] = useState({});

    const triggerMiniCelebration = () => {
        // Mini confetti burst
        const defaults = { startVelocity: 20, spread: 360, ticks: 40, zIndex: 0 };
        const particleCount = 15;

        confetti({
            ...defaults,
            particleCount,
            scalar: 0.5,
            origin: { x: 0.5, y: 0.5 }, // Center screen
            colors: ['#4ade80', '#ffffff'] // Green/White for subtasks
        });

        // Optional: Very subtle overlay or just skip overlay for mini
        // Let's do a quick "Nice!"
        setOverlayText("Nice!");
        setOverlayStyle({ transform: 'scale(0.8) rotate(-5deg)' });
        setShowOverlay(true);
        // We rely on the existing Overlay useEffect to auto-hide.
    };

    const triggerCelebration = () => {
        // --- 1. COMBO LOGIC ---
        const newCombo = combo + 1;
        setCombo(newCombo);

        if (comboTimer) clearTimeout(comboTimer);
        const timer = setTimeout(() => {
            setCombo(0);
        }, 5000); // 5 second window to keep combo alive
        setComboTimer(timer);

        // --- 2. SCREEN SHAKE ---
        document.body.classList.remove('shake-screen');
        void document.body.offsetWidth; // Trigger reflow
        document.body.classList.add('shake-screen');

        // --- 3. CONFETTI MAYHEM ---
        const duration = 2000;
        const animationEnd = Date.now() + duration;
        let skew = 1;

        // Base intensity increases with combo
        const intensityMultiplier = Math.min(newCombo, 5);

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        (function frame() {
            const timeLeft = animationEnd - Date.now();
            const ticks = Math.max(200, 500 * (timeLeft / duration));

            skew = Math.max(0.8, skew - 0.001);

            confetti({
                particleCount: 1 * intensityMultiplier,
                startVelocity: 0,
                ticks: ticks,
                origin: { x: Math.random(), y: (Math.random() * skew) - 0.2 },
                colors: ['#ff00de', '#00ffff', '#ffffff'],
                shapes: ['circle'],
                gravity: randomInRange(0.4, 0.6),
                scalar: randomInRange(0.4, 1),
                drift: randomInRange(-0.4, 0.4)
            });

            if (timeLeft > 0) {
                requestAnimationFrame(frame);
            }
        }());

        // Cannons
        confetti({ particleCount: 50 * intensityMultiplier, spread: 60, origin: { y: 0.6, x: 0 } });
        confetti({ particleCount: 50 * intensityMultiplier, spread: 60, origin: { y: 0.6, x: 1 } });

        // --- 4. DYNAMIC OVERLAY ---
        const texts = ["WOOOOO!", "UNSTOPPABLE!", "LEGENDARY!", "MONSTER KILL!", "PURE ENERGY!", "YEAH BABY!"];
        // If high combo, use more intense text
        let textCheck = "WOOOOO!";
        if (newCombo > 1) textCheck = `COMBO x${newCombo}!`;
        if (newCombo > 4) textCheck = texts[Math.floor(Math.random() * texts.length)];

        setOverlayText(textCheck);

        // Randomize tilt and scale slightly for variety
        const randomRot = Math.floor(Math.random() * 20) - 10; // -10 to 10
        setOverlayStyle({
            transform: `rotate(${randomRot}deg) scale(${1 + (newCombo * 0.1)})`
        });

        setShowOverlay(true);
    };

    return (
        <CelebrationContext.Provider value={{ triggerCelebration, triggerMiniCelebration }}>
            {children}
            <CelebrationOverlay
                isVisible={showOverlay}
                text={overlayText}
                style={overlayStyle}
                onComplete={() => setShowOverlay(false)}
            />
        </CelebrationContext.Provider>
    );
};

export const useCelebration = () => {
    const context = useContext(CelebrationContext);
    if (!context) {
        throw new Error('useCelebration must be used within a CelebrationProvider');
    }
    return context;
};
