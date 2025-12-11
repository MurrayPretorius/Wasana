'use client';

import React, { useState } from 'react';
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
import { arrayMove } from '@dnd-kit/sortable';
import Column from './Column';
import TaskCard from './TaskCard';
import { Task } from '@/types';
import { useProject } from '@/context/ProjectContext';
import { useCelebration } from '@/context/CelebrationContext';

const BoardView = () => {
    const { filteredColumns: columns, setColumns, searchQuery, openEditTaskModal, addColumn } = useProject();
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

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

    const onDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = columns.flatMap(c => c.tasks).find(t => t.id === active.id);
        if (task) {
            setActiveTask(task);
            // Ensure the dragged task is in the selection if properly selected
            // But if user just drags an unselected item, it should become the ONLY selection
            if (!selectedTaskIds.has(task.id)) {
                setSelectedTaskIds(new Set([task.id]));
            }
        }
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
                    newIndex =
                        overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
                }

                // Return new state deeply to avoid mutation
                return prev.map((c) => {
                    if (c.id === activeColumn.id) {
                        return {
                            ...c,
                            tasks: c.tasks.filter((t) => t.id !== active.id),
                        };
                    } else if (c.id === overColumn.id) {
                        const newTasks = [...c.tasks];
                        const task = activeItems[activeIndex]; // Original task
                        // Create copy of task with new columnId
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

    const { triggerCelebration } = useCelebration();

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const activeId = active.id;
        const overId = over?.id;

        if (!overId || activeId === overId) {
            setActiveTask(null);
            return;
        }

        const activeColumn = findColumn(activeId as string);
        const overColumn = findColumn(overId as string);

        if (activeColumn && overColumn) {
            // Find all tasks to move: all selected tasks that are in the source columns
            const tasksToMoveIds = Array.from(selectedTaskIds);
            // Fallback if somehow empty or dragging unselected (should utilize logic in dragStart but safety first)
            if (tasksToMoveIds.length === 0) tasksToMoveIds.push(activeId as string);

            setColumns((prev) => {
                // deep copy
                const newColumns = prev.map(c => ({ ...c, tasks: [...c.tasks] }));

                // 1. Remove all selected tasks from their source columns
                const tasksToInsert: Task[] = [];

                // We need to maintain relative order of selected tasks?
                // Simple approach: Collect them in order of appearance in columns
                const allTasks = prev.flatMap(c => c.tasks);
                // Filter to only those in selection
                const selectedTasksInOrder = allTasks.filter(t => selectedTaskIds.has(t.id));

                // If dragging a single item outside selection? handled by dragStart clearing selection

                // Remove from source
                newColumns.forEach(col => {
                    col.tasks = col.tasks.filter(t => !selectedTaskIds.has(t.id));
                });

                // 2. Insert into destination
                const targetColIndex = newColumns.findIndex(c => c.id === overColumn.id);
                if (targetColIndex === -1) return prev;

                const targetCol = newColumns[targetColIndex];

                // Find insertion index
                let insertIndex = targetCol.tasks.length; // Default to end
                if (overId !== overColumn.id) {
                    const overTaskIndex = targetCol.tasks.findIndex(t => t.id === overId);
                    if (overTaskIndex !== -1) {
                        const isBelow = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height;
                        insertIndex = overTaskIndex + (isBelow ? 1 : 0);
                    }
                }

                // Insert
                // Update columnId for moved tasks
                const movedTasks = selectedTasksInOrder.map(t => ({ ...t, columnId: overColumn.id }));
                targetCol.tasks.splice(insertIndex, 0, ...movedTasks);

                return newColumns;
            });

            if (overColumn.title === 'Done') {
                triggerCelebration();
            }
        }

        setActiveTask(null);
    };

    return (
        <DndContext
            sensors={searchQuery ? [] : sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
        >
            <div style={{ display: 'flex', gap: '1.5rem', height: '100%', overflowX: 'auto', paddingBottom: '1rem' }}>
                {columns.map(column => (
                    <Column
                        key={column.id}
                        column={{
                            ...column,
                            tasks: column.tasks.map(t => ({ ...t })) // ensure clean props
                        }}
                        selectedTaskIds={selectedTaskIds}
                        onToggleSelection={handleTaskClick}
                        onTaskClick={openEditTaskModal}
                    />
                ))}

                {/* Add Column Button */}
                <div style={{ flex: '0 0 300px', padding: '0.5rem' }}>
                    <button
                        onClick={() => addColumn('New Column')}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px dashed hsl(var(--border))',
                            background: 'transparent',
                            color: 'hsl(var(--muted-foreground))',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontWeight: 500
                        }}
                    >
                        + Add Column
                    </button>
                </div>
            </div>
            {/* We need to pass props to Column, so let's check Column.tsx */}
            <DragOverlay>
                {activeTask ? (
                    <div style={{ transform: 'rotate(2deg)' }}>
                        <TaskCard
                            task={activeTask}
                            isSelected={true}
                        />
                        {/* Selection Badge */}
                        {selectedTaskIds.size > 1 && (
                            <div style={{
                                position: 'absolute', top: -4, left: -4, right: -4, bottom: -4,
                                background: 'white', border: '1px solid #ccc', borderRadius: '0.75rem', zIndex: -1,
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }} />
                        )}
                        {selectedTaskIds.size > 1 && (
                            <div style={{
                                position: 'absolute', top: -5, right: -5,
                                background: 'red', color: 'white', borderRadius: '50%',
                                width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.7rem', fontWeight: 'bold'
                            }}>
                                {selectedTaskIds.size}
                            </div>
                        )}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default BoardView;
