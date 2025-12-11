'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskRow from './TaskRow';
import { Task } from '@/types';

interface SortableTaskRowProps {
    task: Task;
    isSelected: boolean;
    onToggleSelection: (id: string) => void;
    onClick: (task: Task) => void;
}

const SortableTaskRow = ({ task, isSelected, onToggleSelection, onClick }: SortableTaskRowProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id, data: { ...task } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as 'relative',
        zIndex: isDragging ? 1000 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskRow
                task={task}
                isSelected={isSelected}
                onToggleSelection={onToggleSelection}
                onClick={onClick}
            />
        </div>
    );
};

export default SortableTaskRow;
