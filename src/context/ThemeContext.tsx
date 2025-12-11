'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
export type ThemeColor = 'purple' | 'blue' | 'green' | 'orange' | 'pink';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    color: ThemeColor;
    setColor: (color: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// HSL values for colors
const COLORS: Record<ThemeColor, string> = {
    purple: '250 80% 60%',
    blue: '220 80% 60%',
    green: '142 70% 45%',
    orange: '24 95% 53%',
    pink: '330 80% 60%'
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<Theme>('system');
    const [color, setColor] = useState<ThemeColor>('purple');

    useEffect(() => {
        // Initial load from local storage
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) setTheme(savedTheme);

        const savedColor = localStorage.getItem('themeColor') as ThemeColor;
        if (savedColor && COLORS[savedColor]) setColor(savedColor);
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const root = window.document.documentElement;
        // Apply primary color variable
        root.style.setProperty('--primary', COLORS[color]);

        localStorage.setItem('themeColor', color);
    }, [color]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, color, setColor }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
