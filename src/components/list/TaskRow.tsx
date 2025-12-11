import React from 'react';
import { Task } from '@/types';
import styles from './TaskRow.module.css';
import { CheckIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useProject } from '@/context/ProjectContext';
import UserPicker from '@/components/common/UserPicker';
import { useAuth } from '@/context/AuthContext';

interface TaskRowProps {
    task: Task;
    isSelected?: boolean;
    onToggleSelection?: (id: string) => void;
    onClick?: (task: Task) => void;
}

const TaskRow = ({ task, isSelected, onToggleSelection, onClick }: TaskRowProps) => {
    const { openEditTaskModal, updateTask } = useProject();

    const [editingField, setEditingField] = React.useState<string | null>(null);
    const [editTitle, setEditTitle] = React.useState(task.title);
    const [editTimeValue, setEditTimeValue] = React.useState(task.timeEstimate?.value || '');
    const [editTimeUnit, setEditTimeUnit] = React.useState(task.timeEstimate?.unit || 'hours');

    const handleToggleComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        updateTask({ ...task, status: newStatus });
    };

    const handleTitleSave = () => {
        if (editTitle.trim() !== task.title) {
            updateTask({ ...task, title: editTitle.trim() });
        }
        setEditingField(null);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleTitleSave();
        } else if (e.key === 'Escape') {
            setEditTitle(task.title);
            setEditingField(null);
        }
    };

    const handleTimeSave = () => {
        const val = typeof editTimeValue === 'string' ? parseInt(editTimeValue) : editTimeValue;
        if (!isNaN(val)) {
            updateTask({ ...task, timeEstimate: { value: val, unit: editTimeUnit as any } });
        }
        setEditingField(null);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateTask({ ...task, dueDate: e.target.value });
        setEditingField(null);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
    };

    return (
        <div
            className={`${styles.row} ${isSelected ? styles.selected : ''}`}
            onClick={(e) => {
                if (e.ctrlKey || e.metaKey) {
                    e.stopPropagation();
                    onToggleSelection?.(task.id);
                } else {
                    // Single click could select the row, but for now we do nothing or just focus
                }
            }}
            onDoubleClick={(e) => {
                onClick?.(task);
            }}
        >
            <div
                className={styles.cell}
                onClick={(e) => {
                    if (editingField !== 'title') {
                        e.stopPropagation();
                        setEditingField('title');
                        setEditTitle(task.title);
                    }
                }}
            >
                <div
                    className={`${styles.check} ${task.status === 'done' ? styles.checked : ''}`}
                    onClick={handleToggleComplete}
                    style={{
                        background: task.status === 'done' ? 'hsl(var(--primary))' : 'transparent',
                        borderColor: task.status === 'done' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'
                    }}
                >
                    <CheckIcon width={12} color={task.status === 'done' ? 'white' : 'currentColor'} />
                </div>

                {editingField === 'title' ? (
                    <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={handleTitleSave}
                        onKeyDown={handleTitleKeyDown}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className={styles.inlineInput}
                    />
                ) : (
                    <span
                        className={styles.taskName}
                        style={{ textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? 'hsl(var(--muted-foreground))' : 'inherit' }}
                    >
                        {task.title}
                    </span>
                )}
            </div>

            <div
                className={styles.cell}
                onClick={(e) => {
                    if (editingField !== 'dueDate') {
                        e.stopPropagation();
                        setEditingField('dueDate');
                    }
                }}
            >
                {editingField === 'dueDate' ? (
                    <input
                        type="date"
                        value={task.dueDate?.split('T')[0] || ''}
                        onChange={handleDateChange}
                        onBlur={() => setEditingField(null)}
                        autoFocus
                        onClick={e => e.stopPropagation()}
                        className={styles.inlineInput}
                    />
                ) : (
                    task.dueDate ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>
                            <CalendarIcon width={14} />
                            {formatDate(task.dueDate)}
                        </span>
                    ) : (
                        <span style={{ color: 'hsl(var(--muted-foreground) / 0.5)' }}>No date</span>
                    )
                )}
            </div>

            <div
                className={styles.cell}
                style={{ overflow: 'visible' }} // Allow popup to overflow
                onClick={(e) => {
                    if (editingField !== 'assignee') {
                        e.stopPropagation();
                        setEditingField('assignee');
                    }
                }}
            >
                {editingField === 'assignee' ? (
                    <div onClick={e => e.stopPropagation()}>
                        <UserPicker
                            selectedUserIds={task.assignee ? [task.assignee.id] : []}
                            onChange={(ids) => {
                                const { users } = useAuth(); // Need access to users list via hook or props
                                const selectedUser = users.find(u => u.id === ids[0]);
                                updateTask({ ...task, assignee: selectedUser });
                                setEditingField(null);
                            }}
                            onClose={() => setEditingField(null)}
                            placeholder="Assign..."
                        />
                    </div>
                ) : (
                    task.assignee ? (
                        <div className={styles.avatar} style={{ background: '#3b82f6', color: 'white' }}>
                            {task.assignee.name.charAt(0)}
                        </div>
                    ) : (
                        <span style={{ color: 'hsl(var(--muted-foreground) / 0.5)' }}>-</span>
                    )
                )}
            </div>

            <div className={styles.cell}>
                <div style={{ display: 'flex', marginLeft: '-0.5rem' }}>
                    {task.collaborators?.map((collab, index) => (
                        <div
                            key={collab.id}
                            className={styles.avatar}
                            style={{
                                background: '#3b82f6',
                                color: 'white',
                                marginLeft: index > 0 ? '-0.5rem' : '0',
                                border: '2px solid white'
                            }}
                        >
                            {collab.name.charAt(0)}
                        </div>
                    ))}
                    {(!task.collaborators || task.collaborators.length === 0) && (
                        <span style={{ color: 'hsl(var(--muted-foreground) / 0.5)' }}>-</span>
                    )}
                </div>
            </div>

            <div className={styles.cell}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {task.tags?.map(tag => (
                        <span key={tag} className={styles.tag} data-tag={tag}>{tag}</span>
                    ))}
                </div>
            </div>

            <div
                className={styles.cell}
                onClick={(e) => {
                    if (editingField !== 'timeEstimate') {
                        e.stopPropagation();
                        setEditingField('timeEstimate');
                        setEditTimeValue(task.timeEstimate?.value || '');
                        setEditTimeUnit(task.timeEstimate?.unit || 'hours');
                    }
                }}
            >
                {editingField === 'timeEstimate' ? (
                    <div style={{ display: 'flex', gap: '0.25rem', width: '100%' }}>
                        <input
                            type="number"
                            value={editTimeValue}
                            onChange={(e) => setEditTimeValue(e.target.value)}
                            onBlur={handleTimeSave} // Simple blur save might be tricky with two fields, but let's try
                            onKeyDown={(e) => { if (e.key === 'Enter') handleTimeSave(); }}
                            autoFocus
                            onClick={e => e.stopPropagation()}
                            className={styles.inlineInput}
                            style={{ flex: 1, minWidth: 0 }}
                        />
                        <select
                            value={editTimeUnit}
                            onChange={(e) => setEditTimeUnit(e.target.value as any)}
                            onClick={e => e.stopPropagation()}
                            onBlur={handleTimeSave}
                            className={styles.inlineInput}
                            style={{ flex: 1, minWidth: 0, padding: 0 }}
                        >
                            <option value="minutes">m</option>
                            <option value="hours">h</option>
                            <option value="days">d</option>
                        </select>
                    </div>
                ) : (
                    task.timeEstimate ? (
                        <span style={{ fontSize: '0.85rem', color: 'hsl(var(--muted-foreground))', background: 'hsl(var(--muted))', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                            {task.timeEstimate.value}
                            {task.timeEstimate.unit === 'minutes' ? 'm' : task.timeEstimate.unit === 'hours' ? 'h' : 'd'}
                        </span>
                    ) : (
                        <span style={{ color: 'hsl(var(--muted-foreground) / 0.5)' }}>-</span>
                    )
                )}
            </div>

            <div className={`${styles.cell} ${styles.action}`}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}>...</button>
            </div>
        </div >
    );
};

export default TaskRow;
