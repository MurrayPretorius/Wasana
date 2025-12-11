'use client';

import React, { useState } from 'react';
import styles from './SubtaskList.module.css';
import { Subtask, Task } from '@/types';
import { CheckIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

import { useCelebration } from '@/context/CelebrationContext';

interface SubtaskListProps {
    subtasks: Subtask[];
    onChange: (subtasks: Subtask[]) => void;
}

const SubtaskList = ({ subtasks = [], onChange }: SubtaskListProps) => {
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const { triggerMiniCelebration } = useCelebration();

    const toggleSubtask = (id: string) => {
        const updated = subtasks.map(st => {
            if (st.id === id) {
                const newCompleted = !st.completed;
                if (newCompleted) {
                    triggerMiniCelebration();
                }
                return { ...st, completed: newCompleted };
            }
            return st;
        });
        onChange(updated);
    };

    const addSubtask = () => {
        if (!newSubtaskTitle.trim()) {
            setIsAdding(false);
            return;
        }

        const newSubtask: Subtask = {
            id: `st-${Date.now()}`,
            title: newSubtaskTitle,
            completed: false
        };

        onChange([...subtasks, newSubtask]);
        setNewSubtaskTitle('');
        setIsAdding(false); // Optionally keep adding
    };

    const deleteSubtask = (id: string) => {
        const updated = subtasks.filter(st => st.id !== id);
        onChange(updated);
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            addSubtask();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.title}>Subtasks</div>

            {subtasks.map(st => (
                <div key={st.id} className={styles.item}>
                    <div
                        className={`${styles.checkbox} ${st.completed ? styles.completed : ''}`}
                        onClick={() => toggleSubtask(st.id)}
                    >
                        {st.completed && <CheckIcon width={12} />}
                    </div>
                    <input
                        className={`${styles.input} ${st.completed ? styles.completed : ''}`}
                        value={st.title}
                        onChange={(e) => {
                            const val = e.target.value;
                            onChange(subtasks.map(s => s.id === st.id ? { ...s, title: val } : s));
                        }}
                    />
                    <button onClick={() => deleteSubtask(st.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}>
                        <XMarkIcon width={16} />
                    </button>
                </div>
            ))}

            {isAdding ? (
                <div className={styles.item}>
                    <div className={styles.checkbox} />
                    <input
                        className={styles.input}
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Write a subtask name..."
                        autoFocus
                        onBlur={addSubtask}
                    />
                </div>
            ) : (
                <div className={styles.addBtn} onClick={() => setIsAdding(true)}>
                    <PlusIcon width={16} />
                    <span>Add subtask</span>
                </div>
            )}
        </div>
    );
};

export default SubtaskList;
