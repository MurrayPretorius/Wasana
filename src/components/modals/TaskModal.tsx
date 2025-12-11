
import React, { useState, useEffect } from 'react';
import styles from './Modal.module.css';
import { useProject } from '@/context/ProjectContext';
import { XMarkIcon, ChevronDownIcon, CheckIcon, TrashIcon, UserIcon, UserGroupIcon, CalendarIcon, PlusIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Priority, Subtask, Comment, User } from '@/types';
import SubtaskList from '@/components/task/SubtaskList';
import CommentList from '@/components/task/CommentList';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/utils/stringUtils';
import UserPicker from '@/components/common/UserPicker'; // Import popup picker
import { useNotification } from '@/context/NotificationContext';

const TaskModal = () => {
    const { isModalOpen, closeModal, addTask, updateTask, modalTask } = useProject();
    const { user, users } = useAuth();
    const { addNotification } = useNotification();

    // State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [projects, setProjects] = useState<string[]>([]);
    const [dependencies, setDependencies] = useState<string[]>([]);
    const [dueDate, setDueDate] = useState<string>('');
    const [timeEstimate, setTimeEstimate] = useState<{ value: number, unit: 'minutes' | 'hours' | 'days' } | undefined>(undefined);
    const [isCompleted, setIsCompleted] = useState(false);
    const [assignee, setAssignee] = useState<User | undefined>(undefined);
    const [assigner, setAssigner] = useState<User | undefined>(undefined);
    const [collaborators, setCollaborators] = useState<User[]>([]);


    useEffect(() => {
        if (modalTask) {
            setTitle(modalTask.title);
            setDescription(modalTask.description || '');
            setPriority(modalTask.priority);
            setSubtasks(modalTask.subtasks || []);
            setComments(modalTask.comments || []);
            setProjects(modalTask.projects || []);
            setDependencies(modalTask.dependencies || []);
            setDueDate(modalTask.dueDate || '');
            setTimeEstimate(modalTask.timeEstimate);
            setIsCompleted(modalTask.status === 'done');
            setAssignee(modalTask.assignee);
            setAssigner(modalTask.assigner);
            setCollaborators(modalTask.collaborators || []);
        } else {
            setTitle('');
            setDescription('');
            setPriority('medium');
            setSubtasks([]);
            setComments([]);
            setProjects(['Marketing Launch']); // Default
            setDependencies([]);
            setDueDate('');
            setTimeEstimate(undefined);
            setIsCompleted(false);
            setAssignee(undefined);
            setAssigner(undefined);
            setCollaborators([]);
        }
    }, [modalTask, isModalOpen]);

    useEffect(() => {
        // Auto-save logic could go here, but for now we rely on explicit save or close.
        // Actually Asana saves on blur/change. For MVP, we'll save on close or specific actions?
        // Let's keep the "Save" button for creation, but for Edit, maybe we should auto-save?
        // The user asked for "Edit Task" capability previously.
        // Let's stick to explicit Save for clarity, OR make it feel like a real pane.
        // "Mark complete" is a clear action.
    }, [title, description, subtasks]);

    if (!isModalOpen) return null;

    const handleUpdate = (fields: Partial<typeof modalTask>) => {
        if (modalTask) {
            updateTask({ ...modalTask, ...fields } as any);
        }
    };

    const handleSave = () => {
        if (!title.trim()) return;

        const taskData = {
            title,
            description,
            priority,
            subtasks,
            comments,
            projects,
            dependencies,
            dueDate,
            timeEstimate,
            status: isCompleted ? 'done' : (modalTask?.status || 'todo'),
            assignee,
            assigner,
            collaborators,
        };

        if (modalTask) {
            updateTask({ ...modalTask, ...taskData } as any);
        } else {
            // Pass all fields including new ones
            addTask(title, description, priority, 'col-1', {
                assignee,
                assigner,
                collaborators,
                dueDate,
                timeEstimate,
                projects,
                dependencies
            });
        }
        closeModal();
    };

    const handleAddComment = () => {
        if (!newComment.trim() || !user) return;

        const comment: Comment = {
            id: `c - ${Date.now()} `,
            content: newComment,
            author: user,
            createdAt: new Date().toISOString()
        };

        const updatedComments = [...comments, comment];
        setComments(updatedComments);
        setNewComment('');

        // Immediate save for comments if editing existing task
        if (modalTask) {
            updateTask({ ...modalTask, comments: updatedComments } as any);

            // Notify Assignee
            if (modalTask.assignee && modalTask.assignee.id !== user?.id) {
                addNotification(
                    modalTask.assignee.id,
                    user?.id || 'system',
                    modalTask.id,
                    'task',
                    'commented',
                    `${user?.name || 'Someone'} commented on task: "${modalTask.title}"`
                );
            }
            // Notify Collaborators (excluding self and assignee to avoid double notify)
            modalTask.collaborators?.forEach(collab => {
                if (collab.id !== user?.id && collab.id !== modalTask.assignee?.id) {
                    addNotification(
                        collab.id,
                        user?.id || 'system',
                        modalTask.id,
                        'task',
                        'commented',
                        `${user?.name || 'Someone'} commented on task: "${modalTask.title}"`
                    );
                }
            });
        }
    };

    // We can also have a "silent save" or save on close?
    // For now, let's just save on close? No, that's risky.
    // Let's add a reliable Save/Close flow.

    return (
        <div className={styles.overlay} onClick={closeModal}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <button
                        className={`${styles.markCompleteBtn} ${isCompleted ? styles.completed : ''} `}
                        onClick={() => setIsCompleted(!isCompleted)}
                    >
                        <CheckIcon width={16} />
                        {isCompleted ? 'Completed' : 'Mark complete'}
                    </button>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={closeModal} className={styles.close} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0.25rem' }}>
                            <XMarkIcon width={24} color="hsl(var(--muted-foreground))" />
                        </button>
                    </div>
                </div>

                <div className={styles.body}>
                    <input
                        className={styles.titleInput}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Write a task name"
                        autoFocus={!modalTask}
                    />

                    <div className={styles.metadataGrid}>
                        <div className={styles.fieldGroup}>
                            <div className={styles.fieldLabel}>
                                <UserIcon width={16} />
                                Assignee
                            </div>
                            <UserPicker
                                selectedUserIds={assignee ? [assignee.id] : []}
                                onChange={(ids) => {
                                    const selectedUser = users.find(u => u.id === ids[0]);
                                    setAssignee(selectedUser);
                                    handleUpdate({ assignee: selectedUser });
                                }}
                                placeholder="Unassigned"
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <div className={styles.fieldLabel}>
                                <UserIcon width={16} />
                                Assigner
                            </div>
                            <UserPicker
                                selectedUserIds={assigner ? [assigner.id] : []}
                                onChange={(ids) => {
                                    const selectedUser = users.find(u => u.id === ids[0]);
                                    setAssigner(selectedUser);
                                    handleUpdate({ assigner: selectedUser });
                                }}
                                placeholder="Set assigner..."
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <div className={styles.fieldLabel}>
                                <UserGroupIcon width={16} />
                                Collaborators
                            </div>
                            <UserPicker
                                selectedUserIds={collaborators?.map(u => u.id) || []}
                                onChange={(ids) => {
                                    const newCollaborators = users.filter(u => ids.includes(u.id));
                                    setCollaborators(newCollaborators);
                                    handleUpdate({ collaborators: newCollaborators });
                                }}
                                multiple={true}
                                placeholder="Add collaborators..."
                            />
                        </div>

                        <div className={styles.metaRow}>
                            <div className={styles.metaLabel}>Due date</div>
                            <div className={styles.metaValue}>
                                <div className={styles.datePill}>
                                    <CalendarIcon width={16} />
                                    <span>{dueDate || 'No due date'}</span>
                                    {dueDate && <XMarkIcon width={12} onClick={() => setDueDate('')} style={{ marginLeft: '0.25rem' }} />}
                                </div>
                            </div>
                        </div>

                        <div className={styles.metaRow}>
                            <div className={styles.metaLabel}>Projects</div>
                            <div className={styles.metaValue}>
                                {projects.map((p, i) => (
                                    <div key={i} className={styles.projectPill}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'hsl(var(--primary))' }}></span>
                                        {p}
                                    </div>
                                ))}
                                <button style={{ background: 'none', border: 'none', color: 'hsl(var(--muted-foreground))', cursor: 'pointer', marginLeft: '0.5rem' }}>
                                    <PlusIcon width={16} />
                                </button>
                            </div>
                        </div>

                        <div className={styles.metaRow}>
                            <div className={styles.metaLabel}>Dependencies</div>
                            <div className={styles.metaValue}>
                                {dependencies.length > 0 ? (
                                    dependencies.map(d => <span key={d}>{d}</span>)
                                ) : (
                                    <span style={{ fontStyle: 'italic', color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem' }}>Add dependencies</span>
                                )}
                            </div>
                        </div>

                        <div className={styles.metaRow}>
                            <div className={styles.metaLabel}>
                                <ClockIcon width={16} />
                                Time Estimate
                            </div>
                            <div className={styles.metaValue} style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="number"
                                    min="0"
                                    value={timeEstimate?.value || ''}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (!isNaN(val)) {
                                            setTimeEstimate(prev => ({ value: val, unit: prev?.unit || 'hours' }));
                                        } else {
                                            if (e.target.value === '') {
                                                setTimeEstimate(undefined);
                                            }
                                        }
                                    }}
                                    placeholder="Value"
                                    style={{ background: 'transparent', border: '1px solid hsl(var(--border))', borderRadius: '4px', color: 'inherit', fontSize: 'inherit', padding: '0.1rem 0.3rem', width: '60px' }}
                                />
                                <select
                                    value={timeEstimate?.unit || 'hours'}
                                    onChange={(e) => {
                                        const unit = e.target.value as 'minutes' | 'hours' | 'days';
                                        setTimeEstimate(prev => prev ? { ...prev, unit } : { value: 0, unit });
                                    }}
                                    style={{ background: 'transparent', border: '1px solid hsl(var(--border))', borderRadius: '4px', color: 'inherit', fontSize: 'inherit', padding: '0.1rem' }}
                                >
                                    <option value="minutes">Minutes</option>
                                    <option value="hours">Hours</option>
                                    <option value="days">Days</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.metaRow}>
                            <div className={styles.metaLabel}>Priority</div>
                            <div className={styles.metaValue}>
                                <select
                                    value={priority}
                                    onChange={e => setPriority(e.target.value as Priority)}
                                    style={{ padding: '0.2rem', borderRadius: '0.3rem', border: '1px solid hsl(var(--border))' }}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <SubtaskList subtasks={subtasks} onChange={setSubtasks} />

                    <div className={styles.sectionHeader}>Description</div>
                    <textarea
                        className={styles.descriptionBox}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What is this task about?"
                    />

                    <CommentList comments={comments} />
                </div>

                <div className={styles.footer}>
                    <div className={styles.userPill} style={{ padding: 0 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'hsl(var(--primary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                            {getInitials(user?.name || '')}
                        </div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
                        <input
                            className={styles.commentInput}
                            placeholder="Ask a question or post an update..."
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment();
                                }
                            }}
                        />
                        <button
                            className={styles.btn}
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            style={{ opacity: !newComment.trim() ? 0.5 : 1 }}
                        >
                            Comment
                        </button>
                    </div>

                    <button className={styles.btnPrimary} onClick={handleSave} style={{ marginLeft: 'auto', padding: '0.6rem 1.5rem', borderRadius: '0.75rem', border: 'none', background: 'hsl(var(--primary))', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                        {modalTask ? 'Save Changes' : 'Create Task'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;
