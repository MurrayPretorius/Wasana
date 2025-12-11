export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'review' | 'done';

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'member';
    title?: string; // Job title
    avatar?: string;
    password?: string; // For MVP client-side auth
    mustChangePassword?: boolean;
}

export interface Comment {
    id: string;
    content: string;
    author: User;
    createdAt: string; // ISO string
}

export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: Status;
    priority: Priority;
    assignee?: User;
    assigner?: User; // New
    collaborators?: User[]; // New
    dueDate?: string; // ISO date string
    tags?: string[];
    columnId: string; // For Kanban
    subtasks?: Subtask[];
    projects?: string[];  // Project IDs
    dependencies: string[]; // Task IDs
    timeEstimate?: { value: number; unit: 'minutes' | 'hours' | 'days' };
    comments?: Comment[];
}

export interface Column {
    id: string;
    title: string;
    tasks: Task[];
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    members: string[]; // User IDs (entire team access)
    columns: Column[]; // Each project has its own board state
    createdAt: string;
    createdBy: string; // User ID
}

export interface Notification {
    id: string;
    recipientId: string; // User who sees this
    actorId: string; // User who performed the action
    resourceId: string; // Task ID etc
    resourceType: 'task' | 'comment' | 'project';
    action: 'assigned' | 'commented' | 'completed' | 'mentioned' | 'updated';
    message: string;
    isRead: boolean;
    createdAt: string;
}
