import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { TrashIcon } from '@heroicons/react/24/outline';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Column as ColumnType } from '@/types';

interface ColumnProps {
    column: ColumnType;
    selectedTaskIds?: Set<string>;
    onToggleSelection?: (id: string) => void;
    onTaskClick?: (task: TaskType) => void;
}
import { Task as TaskType } from '@/types';

import { useProject } from '@/context/ProjectContext';
import { useState, useRef, useEffect } from 'react';

const Column = ({ column, selectedTaskIds, onToggleSelection, onTaskClick }: ColumnProps) => {
    const { setNodeRef } = useDroppable({
        id: column.id,
    });
    const { updateColumnTitle, deleteColumn } = useProject();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(column.title);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        if (title.trim()) {
            updateColumnTitle(column.id, title);
        } else {
            setTitle(column.title); // Revert if empty
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBlur();
        }
        if (e.key === 'Escape') {
            setIsEditing(false);
            setTitle(column.title);
        }
    };

    return (
        <div style={{
            flex: '0 0 300px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxHeight: '100%',
        }}>
            <div style={{
                padding: '0 0.5rem 1rem 0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontWeight: '600',
                color: 'hsl(var(--muted-foreground))'
            }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            style={{
                                background: 'transparent',
                                border: '1px solid hsl(var(--primary))',
                                borderRadius: '4px',
                                padding: '0.25rem 0.5rem',
                                fontSize: 'inherit',
                                fontWeight: 'inherit',
                                color: 'inherit',
                                width: '100%',
                                outline: 'none'
                            }}
                        />
                    ) : (
                        <div
                            onClick={() => setIsEditing(true)}
                            style={{
                                cursor: 'text',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                flex: 1
                            }}
                        >
                            {column.title}
                            <span style={{
                                background: 'hsl(var(--muted))',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '999px',
                                fontSize: '0.75rem'
                            }}>{column.tasks.length}</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => { if (confirm('Delete column?')) deleteColumn(column.id); }}
                    style={{ background: 'none', border: 'none', color: 'hsl(var(--muted-foreground))', cursor: 'pointer', padding: '0.25rem' }}
                    title="Delete column"
                >
                    <TrashIcon width={16} />
                </button>
            </div>

            <div
                ref={setNodeRef}
                style={{
                    flex: 1,
                    background: 'hsl(var(--muted) / 0.5)',
                    borderRadius: '1rem',
                    padding: '0.75rem',
                    border: '1px solid transparent', // Fallback
                    overflowY: 'auto'
                }}>
                <SortableContext
                    items={column.tasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {column.tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            isSelected={selectedTaskIds?.has(task.id)}
                            onToggleSelection={onToggleSelection}
                            onClick={onTaskClick}
                        />
                    ))}
                </SortableContext>
            </div>
        </div >
    );
};

export default Column;
