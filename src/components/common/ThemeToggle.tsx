'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { MoonIcon, SunIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div style={{ display: 'flex', background: 'hsl(var(--muted))', padding: '0.2rem', borderRadius: '0.5rem', gap: '0.2rem' }}>
            <button
                onClick={() => setTheme('light')}
                style={{
                    background: theme === 'light' ? 'white' : 'transparent',
                    border: 'none',
                    borderRadius: '0.3rem',
                    padding: '0.25rem',
                    cursor: 'pointer',
                    color: theme === 'light' ? 'black' : 'hsl(var(--muted-foreground))',
                    boxShadow: theme === 'light' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                }}
                title="Light Mode"
            >
                <SunIcon width={16} />
            </button>
            <button
                onClick={() => setTheme('dark')}
                style={{
                    background: theme === 'dark' ? 'hsl(var(--background))' : 'transparent',
                    border: 'none',
                    borderRadius: '0.3rem',
                    padding: '0.25rem',
                    cursor: 'pointer',
                    color: theme === 'dark' ? 'white' : 'hsl(var(--muted-foreground))',
                    boxShadow: theme === 'dark' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                }}
                title="Dark Mode"
            >
                <MoonIcon width={16} />
            </button>
            <button
                onClick={() => setTheme('system')}
                style={{
                    background: theme === 'system' ? 'hsl(var(--background))' : 'transparent',
                    border: 'none',
                    borderRadius: '0.3rem',
                    padding: '0.25rem',
                    cursor: 'pointer',
                    color: theme === 'system' ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                    boxShadow: theme === 'system' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                }}
                title="System"
            >
                <ComputerDesktopIcon width={16} />
            </button>
        </div>
    );
};

export default ThemeToggle;
