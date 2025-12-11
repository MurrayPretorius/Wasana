'use client';

import React from 'react';
import styles from './Header.module.css';
import { MagnifyingGlassIcon, BellIcon, PlusIcon } from '@heroicons/react/24/outline';
import ThemeToggle from '../common/ThemeToggle';
import { useProject } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/utils/stringUtils';

const Header = () => {
    const { searchQuery, setSearchQuery } = useProject();
    const { user } = useAuth();

    return (
        <header className={styles.header}>
            <div className={styles.title}>Marketing Launch</div>

            <div className={styles.actions}>
                <div className={styles.search}>
                    <MagnifyingGlassIcon width={18} className={styles.icon} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className={styles.input}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <button className="btn-icon">
                    <PlusIcon width={24} style={{ color: 'hsl(var(--muted-foreground))', cursor: 'pointer' }} />
                </button>

                <ThemeToggle />

                <button className="btn-icon">
                    <BellIcon width={24} style={{ color: 'hsl(var(--muted-foreground))', cursor: 'pointer' }} />
                </button>

                <div className={styles.profile} title={user?.name}>
                    {user ? getInitials(user.name) : '?'}
                </div>
            </div>
        </header>
    );
};

export default Header;
