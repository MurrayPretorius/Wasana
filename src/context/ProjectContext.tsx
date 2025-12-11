'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { Column, Task, Priority, Project, User } from '@/types'; // Added Project, User
import { useCelebration } from './CelebrationContext';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext'; // Need auth for creator

interface ProjectContextType {
    projects: Project[];
    activeProjectId: string | null;
    activeProject: Project | null;
    columns: Column[]; // Derived from active project
    filteredColumns: Column[];

    // Actions
    setColumns: React.Dispatch<React.SetStateAction<Column[]>>; // Updates active project's columns
    addProject: (name: string, description: string, members: string[]) => void;
    deleteProject: (id: string) => void;
    archiveCompletedTasks: () => void;
    setActiveProjectId: (id: string) => void;

    addTask: (title: string, description: string, priority: Priority, columnId: string, overrides?: Partial<Task>) => void;
    updateTask: (task: Task) => void;
    moveTask: (activeId: string, overId: string) => void; // Keeping signature, logic inside
    updateColumnTitle: (columnId: string, newTitle: string) => void;
    addColumn: (title: string) => void;
    deleteColumn: (columnId: string) => void;

    // Modal State
    isModalOpen: boolean;
    isUserModalOpen: boolean;
    isProfileModalOpen: boolean;
    isCreateProjectModalOpen: boolean; // New
    modalTask: Task | null;

    openNewTaskModal: () => void;
    openEditTaskModal: (task: Task) => void;
    openUserModal: () => void;
    openProfileModal: () => void;
    openCreateProjectModal: () => void; // New
    closeModal: () => void;

    // Search State
    searchQuery: string;
    setSearchQuery: (query: string) => void;

    // Filter State
    filterStatus: 'all' | 'incomplete' | 'completed';
    setFilterStatus: (status: 'all' | 'incomplete' | 'completed') => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const INITIAL_COLUMNS: Column[] = [
    { id: 'col-1', title: 'To Do', tasks: [] },
    { id: 'col-2', title: 'In Progress', tasks: [] },
    { id: 'col-3', title: 'Review', tasks: [] },
    { id: 'col-4', title: 'Done', tasks: [] }
];

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
    const [modalTask, setModalTask] = useState<Task | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { triggerCelebration } = useCelebration();
    const { addNotification } = useNotification();

    // Load from Local Storage on mount
    useEffect(() => {
        const savedProjects = localStorage.getItem('asana-clone-projects');
        const savedOldData = localStorage.getItem('asana-clone-data');

        if (savedProjects) {
            try {
                const parsed = JSON.parse(savedProjects);
                setProjects(parsed);
                if (parsed.length > 0) {
                    setActiveProjectId(parsed[0].id);
                }
            } catch (e) {
                console.error("Failed to load projects", e);
            }
        } else if (savedOldData) {
            // Migration: Convert old columns data to a Default Project
            try {
                const columns = JSON.parse(savedOldData);
                const defaultProject: Project = {
                    id: 'proj-default',
                    name: 'Marketing Launch', // Assuming name from mock
                    description: 'Migrated from previous version',
                    members: [], // Public
                    columns: columns,
                    createdAt: new Date().toISOString(),
                    createdBy: 'system'
                };
                setProjects([defaultProject]);
                setActiveProjectId('proj-default');
            } catch (e) {
                console.error("Failed to migrate data", e);
                // Init with empty
                initDefaultProject();
            }
        } else {
            initDefaultProject();
        }
    }, []);

    const initDefaultProject = () => {
        const defaultProject: Project = {
            id: `proj-${Date.now()}`,
            name: 'My First Project',
            description: 'Welcome to your new project board',
            members: [],
            columns: INITIAL_COLUMNS,
            createdAt: new Date().toISOString(),
            createdBy: user?.id || 'anon'
        };
        setProjects([defaultProject]);
        setActiveProjectId(defaultProject.id);
    };

    // Save to Local Storage on change
    useEffect(() => {
        if (projects.length > 0) {
            localStorage.setItem('asana-clone-projects', JSON.stringify(projects));
        }
    }, [projects]);

    // Derived: Active Project
    const activeProject = useMemo(() =>
        projects.find(p => p.id === activeProjectId) || null
        , [projects, activeProjectId]);

    // Derived: Active Columns
    const columns = useMemo(() => activeProject?.columns || [], [activeProject]);

    // Filter State
    const [filterStatus, setFilterStatus] = useState<'all' | 'incomplete' | 'completed'>('incomplete');

    // Derived: Filtered Columns
    const filteredColumns = useMemo(() => {
        let cols = columns;

        // 1. Search Filter
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            cols = cols.map(col => ({
                ...col,
                tasks: col.tasks.filter(task =>
                    task.title.toLowerCase().includes(lowerQuery) ||
                    (task.description && task.description.toLowerCase().includes(lowerQuery)) ||
                    (task.tags && task.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
                )
            }));
        }

        // 2. Status Filter
        if (filterStatus === 'incomplete') {
            cols = cols.map(col => ({
                ...col,
                tasks: col.tasks.filter(t => t.status !== 'done')
            }));
        } else if (filterStatus === 'completed') {
            cols = cols.map(col => ({
                ...col,
                tasks: col.tasks.filter(t => t.status === 'done')
            }));
        }

        return cols;
    }, [columns, searchQuery, filterStatus]);

    // Actions
    const setColumns: React.Dispatch<React.SetStateAction<Column[]>> = (action) => {
        if (!activeProjectId) return;

        setProjects(prev => prev.map(p => {
            if (p.id === activeProjectId) {
                const newCols = typeof action === 'function' ? action(p.columns) : action;
                return { ...p, columns: newCols };
            }
            return p;
        }));
    };

    const addProject = (name: string, description: string, members: string[]) => {
        const newProject: Project = {
            id: `proj-${Date.now()}`,
            name,
            description,
            members,
            columns: [
                { id: `col-${Date.now()}-1`, title: 'Section 1', tasks: [] }
            ],
            createdAt: new Date().toISOString(),
            createdBy: user?.id || 'anon'
        };
        setProjects(prev => [...prev, newProject]);
        setActiveProjectId(newProject.id);
    };

    const deleteProject = (id: string) => {
        setProjects(prev => prev.filter(p => p.id !== id));
        if (activeProjectId === id) {
            setActiveProjectId(null); // Or pick first
        }
    };

    const archiveCompletedTasks = () => {
        if (!activeProjectId) return;
        const dateStr = new Date().toLocaleDateString('en-US'); // MM/DD/YYYY format or similar
        const targetTitle = `Completed ${dateStr}`;

        setColumns(prev => {
            // Find tasks to move
            const tasksToMove: Task[] = [];
            prev.forEach(col => {
                if (col.title.toLowerCase().includes('completed')) return;
                col.tasks.forEach(t => {
                    if (t.status === 'done') tasksToMove.push(t);
                });
            });

            if (tasksToMove.length === 0) return prev;

            // Remove from old columns
            const newCols = prev.map(col => {
                if (col.title.toLowerCase().includes('completed')) return col;
                return {
                    ...col,
                    tasks: col.tasks.filter(t => t.status !== 'done')
                };
            });

            // Find or Create Target Column
            let targetColIndex = newCols.findIndex(c => c.title === targetTitle);
            let targetColId = targetColIndex !== -1 ? newCols[targetColIndex].id : `col-${Date.now()}-archive`;

            if (targetColIndex === -1) {
                const newCol: Column = {
                    id: targetColId,
                    title: targetTitle,
                    tasks: []
                };
                newCols.push(newCol);
                targetColIndex = newCols.length - 1;
            }

            // Move tasks
            const movedTasks = tasksToMove.map(t => ({ ...t, columnId: targetColId }));

            newCols[targetColIndex] = {
                ...newCols[targetColIndex],
                tasks: [...newCols[targetColIndex].tasks, ...movedTasks]
            };

            return newCols;
        });
    };

    const addTask = (title: string, description: string, priority: Priority, columnId: string, overrides?: Partial<Task>) => {
        console.log('addTask called:', { title, description, priority, columnId, activeProjectId });
        if (!activeProjectId) {
            console.error('No activeProjectId!');
            return;
        }

        const newTask: Task = {
            id: `t-${Date.now()}`,
            title,
            description,
            priority,
            status: 'todo',
            columnId,
            assignee: user || undefined,
            assigner: user || undefined, // Set creator as assigner
            collaborators: [],
            subtasks: [],
            projects: [activeProjectId],
            dependencies: [],
            ...overrides // Apply overrides
        };

        console.log('Creating new task:', newTask);

        if (newTask.assignee && newTask.assignee.id !== user?.id) {
            addNotification(
                newTask.assignee.id,
                user?.id || 'system',
                newTask.id,
                'task',
                'assigned',
                `${user?.name || 'Someone'} assigned you a new task: "${newTask.title}"`
            );
        }

        setColumns(prev => prev.map(col =>
            col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col
        ));
    };

    const updateTask = (updatedTask: Task) => {
        // Find previous state for comparison
        const currentTask = columns.flatMap(c => c.tasks).find(t => t.id === updatedTask.id);

        if (currentTask) {
            // 1. Assignment Change
            if (updatedTask.assignee?.id && updatedTask.assignee.id !== currentTask.assignee?.id && updatedTask.assignee.id !== user?.id) {
                addNotification(
                    updatedTask.assignee.id,
                    user?.id || 'system',
                    updatedTask.id,
                    'task',
                    'assigned',
                    `${user?.name || 'Someone'} assigned you a task: "${updatedTask.title}"`
                );
            }

            // 2. Completion - Notify Assigner
            if (updatedTask.status === 'done' && currentTask.status !== 'done') {
                triggerCelebration(); // Keep existing logic including celebration
                if (updatedTask.assigner && updatedTask.assigner.id !== user?.id) {
                    addNotification(
                        updatedTask.assigner.id,
                        user?.id || 'system',
                        updatedTask.id,
                        'task',
                        'completed',
                        `${user?.name || 'Someone'} completed a task you assigned: "${updatedTask.title}"`
                    );
                }
            }
        } else if (updatedTask.status === 'done') {
            triggerCelebration();
        }

        setColumns(prev => prev.map(col => {
            const taskIndex = col.tasks.findIndex(t => t.id === updatedTask.id);
            if (taskIndex !== -1) {
                const newTasks = [...col.tasks];
                newTasks[taskIndex] = updatedTask;
                return { ...col, tasks: newTasks };
            }
            return col;
        }));
    };

    const updateColumnTitle = (columnId: string, newTitle: string) => {
        setColumns(prev => prev.map(col =>
            col.id === columnId ? { ...col, title: newTitle } : col
        ));
    };

    const addColumn = (title: string) => {
        if (!activeProjectId) return;
        const newColumn: Column = {
            id: `col-${Date.now()}`,
            title,
            tasks: []
        };
        setColumns(prev => [...prev, newColumn]);
    };

    const deleteColumn = (columnId: string) => {
        if (!activeProjectId) return;
        setColumns(prev => prev.filter(col => col.id !== columnId));
    };

    const moveTask = (activeId: string, overId: string) => {
        // This is handled by setColumns in BoardView/ListView typically via dnd-kit logic
        // But if we needed a programmatic move, we'd implement it here.
    };

    // Modal Helpers
    const openNewTaskModal = () => { setModalTask(null); setIsModalOpen(true); };
    const openEditTaskModal = (task: Task) => { setModalTask(task); setIsModalOpen(true); };
    const openUserModal = () => setIsUserModalOpen(true);
    const openProfileModal = () => setIsProfileModalOpen(true);
    const openCreateProjectModal = () => setIsCreateProjectModalOpen(true);

    const closeModal = () => {
        setIsModalOpen(false);
        setIsUserModalOpen(false);
        setIsProfileModalOpen(false);
        setIsCreateProjectModalOpen(false);
        setModalTask(null);
    };

    return (
        <ProjectContext.Provider value={{
            projects,
            activeProjectId,
            activeProject,
            columns,
            filteredColumns,
            setColumns,
            addProject,
            deleteProject,
            archiveCompletedTasks,
            setActiveProjectId,
            addTask,
            updateTask,
            moveTask,
            updateColumnTitle,
            addColumn,
            deleteColumn,
            isModalOpen,
            isUserModalOpen,
            isProfileModalOpen,
            isCreateProjectModalOpen,
            modalTask,
            openNewTaskModal,
            openEditTaskModal,
            openUserModal,
            openProfileModal,
            openCreateProjectModal,
            closeModal,
            searchQuery,
            setSearchQuery,
            filterStatus,
            setFilterStatus
        }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};
