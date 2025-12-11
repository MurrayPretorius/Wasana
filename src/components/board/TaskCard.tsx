import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import styles from './TaskCard.module.css';
import { useProject } from '@/context/ProjectContext';
import { getInitials } from '@/utils/stringUtils';

interface TaskCardProps {
    task: Task;
    isSelected?: boolean;
    onToggleSelection?: (id: string) => void;
    onClick?: (task: Task) => void;
}

const TaskCard = ({ task, isSelected, onToggleSelection, onClick }: TaskCardProps) => {
    const { openEditTaskModal } = useProject();
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
    };

    const priorityClass = task.priority === 'high' ? styles['badge-high'] :
        task.priority === 'medium' ? styles['badge-medium'] :
            styles['badge-low'];

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`${styles.card} ${isDragging ? styles.cardDragging : ''} ${isSelected ? styles.selected : ''}`}
            onClick={(e) => {
                if (e.ctrlKey || e.metaKey) {
                    e.stopPropagation();
                    onToggleSelection?.(task.id);
                } else {
                    onClick?.(task);
                }
            }}
        >
            <div className={styles.title}>{task.title}</div>
            <div className={styles.meta}>
                <span className={`${styles.badge} ${priorityClass}`}>{task.priority}</span>
                {task.assignee && (
                    <div className={styles.avatars}>
                        <div className={styles.avatar} style={{ background: '#3b82f6' }}>
                            {getInitials(task.assignee.name)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskCard;
