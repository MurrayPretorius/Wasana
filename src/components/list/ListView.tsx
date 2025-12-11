'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import styles from './ListView.module.css';
import SortableTaskRow from './SortableTaskRow'; // Use Sortable wrapper
import { ChevronDownIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import {
    DndContext,
    DragOverlay,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
    useSensor,
    useSensors,
    PointerSensor,
    closestCorners
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Task } from '@/types';
import TaskRow from './TaskRow'; // For overlay

const ListView = () => {
    const { filteredColumns: columns, setColumns, searchQuery, openEditTaskModal, addColumn, deleteColumn, updateColumnTitle, addTask } = useProject(); // Ensure openEditTaskModal is available
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [isAddingTask, setIsAddingTask] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const handleAddTaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, columnId: string) => {
        if (e.key === 'Enter') {
            const val = e.currentTarget.value.trim();
            if (val) {
                addTask(val, '', 'medium', columnId);
                setIsAddingTask(null);
            }
        } else if (e.key === 'Escape') {
            setIsAddingTask(null);
        }
    };

    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        'col-1': true,
        'col-2': true,
        'col-3': true,
        'col-4': true
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const findColumn = (id: string | null) => {
        if (!id) return null;
        if (columns.some(c => c.id === id)) return columns.find(c => c.id === id) ?? null;
        return columns.find(c => c.tasks.some(t => t.id === id)) ?? null;
    };

    const handleTaskClick = (id: string) => {
        setSelectedTaskIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const onDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = columns.flatMap(c => c.tasks).find(t => t.id === active.id);
        if (task) {
            setActiveTask(task);
            if (!selectedTaskIds.has(task.id)) {
                setSelectedTaskIds(new Set([task.id]));
            }
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        const overId = over?.id;
        if (!overId || active.id === overId) return;

        const activeColumn = findColumn(active.id as string);
        const overColumn = findColumn(overId as string);

        if (!activeColumn || !overColumn) return;

        if (activeColumn.id !== overColumn.id) {
            setColumns((prev) => {
                const activeItems = activeColumn.tasks;
                const overItems = overColumn.tasks;
                const activeIndex = activeItems.findIndex((t) => t.id === active.id);
                const overIndex = overItems.findIndex((t) => t.id === overId);
                let newIndex;
                if (overId === overColumn.id) {
                    newIndex = overItems.length + 1;
                } else {
                    const isBelowOverItem =
                        over &&
                        active.rect.current.translated &&
                        active.rect.current.translated.top >
                        over.rect.top + over.rect.height;
                    const modifier = isBelowOverItem ? 1 : 0;
                    newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
                }

                return prev.map((c) => {
                    if (c.id === activeColumn.id) {
                        return { ...c, tasks: c.tasks.filter((t) => t.id !== active.id) };
                    } else if (c.id === overColumn.id) {
                        const newTasks = [...c.tasks];
                        const task = activeItems[activeIndex];
                        const taskToMove = { ...task, columnId: overColumn.id };
                        newTasks.splice(newIndex, 0, taskToMove);
                        return { ...c, tasks: newTasks };
                    } else {
                        return c;
                    }
                });
            });
        }
    };

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const activeId = active.id;
        const overId = over?.id;

        if (!overId || activeId === overId) {
            setActiveTask(null);
            return;
        }

        const activeColumn = findColumn(activeId as string);
        const overColumn = findColumn(overId as string); // In list view, overId might be a task or section header (if we make headers droppable)

        // Handling multi-move
        if (activeColumn && overColumn) {
            const tasksToMoveIds = Array.from(selectedTaskIds);
            if (tasksToMoveIds.length === 0) tasksToMoveIds.push(activeId as string);

            setColumns((prev) => {
                const newColumns = prev.map(c => ({ ...c, tasks: [...c.tasks] }));

                // Remove from source
                const allTasks = prev.flatMap(c => c.tasks);
                const selectedTasksInOrder = allTasks.filter(t => selectedTaskIds.has(t.id));

                newColumns.forEach(col => {
                    col.tasks = col.tasks.filter(t => !selectedTaskIds.has(t.id));
                });

                // Insert logic
                const targetColIndex = newColumns.findIndex(c => c.id === overColumn.id);
                if (targetColIndex === -1) return prev;
                const targetCol = newColumns[targetColIndex];

                let insertIndex = targetCol.tasks.length;
                if (overId !== overColumn.id) {
                    const overTaskIndex = targetCol.tasks.findIndex(t => t.id === overId);
                    if (overTaskIndex !== -1) {
                        // Simple simplified insertion
                        const isBelow = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
                        insertIndex = overTaskIndex + (isBelow ? 1 : 0);
                    }
                }

                const movedTasks = selectedTasksInOrder.map(t => ({ ...t, columnId: overColumn.id }));
                targetCol.tasks.splice(insertIndex, 0, ...movedTasks);

                return newColumns;
            });
        }

        setActiveTask(null);
    };

    const toggleSection = (id: string) => {
        setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
    }

    return (
        <DndContext
            sensors={searchQuery ? [] : sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
        >
            <div className={styles.container}>
                <div className={styles.headerRow}>
                    <div className={styles.headerCell}>Name</div>
                    <div className={styles.headerCell}>Due date</div>
                    <div className={styles.headerCell}>Assignee</div>
                    <div className={styles.headerCell}>Collaborators</div>
                    <div className={styles.headerCell}>Tags</div>
                    <div className={styles.headerCell}>Story Points</div>
                    <div className={styles.headerCell}>
                        <button
                            onClick={() => addColumn('New Section')}
                            style={{ background: 'none', border: 'none', color: 'hsl(var(--primary))', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                            <PlusIcon width={16} />
                            Add Section
                        </button>
                    </div>
                </div>

                <div className={styles.body}>
                    {columns.map(column => (
                        <div key={column.id} className={styles.section}>
                            <div // Make header droppable? For now, dropping on items is enough, but dropping on header is good UX.
                                className={styles.sectionHeader}
                                onClick={() => toggleSection(column.id)}
                            >
                                {expandedSections[column.id] ? (
                                    <ChevronDownIcon width={16} />
                                ) : (
                                    <ChevronRightIcon width={16} />
                                )}
                                {editingSectionId === column.id ? (
                                    <input
                                        value={editingTitle}
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        onBlur={() => {
                                            if (editingTitle.trim()) updateColumnTitle(column.id, editingTitle);
                                            setEditingSectionId(null);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                if (editingTitle.trim()) updateColumnTitle(column.id, editingTitle);
                                                setEditingSectionId(null);
                                            }
                                        }}
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ background: 'transparent', border: '1px solid hsl(var(--primary))', borderRadius: '4px', padding: '0 0.5rem', fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}
                                    />
                                ) : (
                                    <span
                                        className={styles.sectionTitle}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingSectionId(column.id);
                                            setEditingTitle(column.title);
                                        }}
                                    >
                                        {column.title}
                                    </span>
                                )}
                                <span className={styles.count}>{column.tasks.length}</span>
                                <div className={styles.sectionActions}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); if (confirm('Delete section?')) deleteColumn(column.id); }}
                                        style={{ background: 'none', border: 'none', color: 'hsl(var(--destructive))', cursor: 'pointer', fontSize: '0.8rem' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                                {/* CSS hack to show on hover: .sectionHeader:hover .section-actions { display: block !important; } */}
                            </div>

                            {expandedSections[column.id] && (
                                <SortableContext
                                    items={column.tasks.map(t => t.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className={styles.taskList}>
                                        {column.tasks.map(task => (
                                            <SortableTaskRow
                                                key={task.id}
                                                task={task}
                                                isSelected={selectedTaskIds.has(task.id)}
                                                onToggleSelection={handleTaskClick}
                                                onClick={openEditTaskModal}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            )}

                            {/* Add Task Row - Moved Outside SortableContext */}
                            {expandedSections[column.id] && (
                                isAddingTask === column.id ? (
                                    <div className={styles.addTaskInputRow}>
                                        <div style={{ width: '18px', marginRight: '0.75rem' }} /> {/* Spacer for checkbox */}
                                        <input
                                            autoFocus
                                            className={styles.inlineInput}
                                            placeholder="Write a task name..."
                                            onKeyDown={(e) => handleAddTaskKeyDown(e, column.id)}
                                            onBlur={() => setIsAddingTask(null)}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className={styles.addTaskRow}
                                        onClick={() => {
                                            console.log('Clicked Add Task for column:', column.id);
                                            setIsAddingTask(column.id);
                                        }}
                                    >
                                        <PlusIcon width={16} />
                                        <span>Add task...</span>
                                    </div>
                                )
                            )}
                        </div>
                    ))}
                </div>
                <DragOverlay>
                    {activeTask ? (
                        <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: '4px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>
                            <TaskRow task={activeTask} isSelected={true} />
                            {selectedTaskIds.size > 1 && (
                                <div style={{
                                    position: 'absolute', top: -5, right: -5,
                                    background: 'hsl(var(--primary))', color: 'white', borderRadius: '50%',
                                    width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.7rem', fontWeight: 'bold'
                                }}>
                                    {selectedTaskIds.size}
                                </div>
                            )}
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
};

export default ListView;
