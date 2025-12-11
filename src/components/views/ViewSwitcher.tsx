import React from 'react';
import { ListBulletIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import styles from './ViewSwitcher.module.css';

interface ViewSwitcherProps {
    currentView: 'board' | 'list';
    onViewChange: (view: 'board' | 'list') => void;
}

const ViewSwitcher = ({ currentView, onViewChange }: ViewSwitcherProps) => {
    return (
        <div className={styles.switcher}>
            <button
                className={`${styles.option} ${currentView === 'list' ? styles.active : ''}`}
                onClick={() => onViewChange('list')}
            >
                <ListBulletIcon width={16} />
                List
            </button>
            <button
                className={`${styles.option} ${currentView === 'board' ? styles.active : ''}`}
                onClick={() => onViewChange('board')}
            >
                <Squares2X2Icon width={16} />
                Board
            </button>
        </div>
    );
};

export default ViewSwitcher;
