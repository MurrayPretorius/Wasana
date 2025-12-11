'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification } from '@/types';
import { useAuth } from './AuthContext';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (recipientId: string, actorId: string, resourceId: string, resourceType: 'task' | 'comment' | 'project', action: 'assigned' | 'commented' | 'completed' | 'mentioned' | 'updated', message: string) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('asana-clone-notifications');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setNotifications(parsed);
            } catch (e) {
                console.error("Failed to parse notifications", e);
            }
        }
    }, []);

    // Save to local storage
    useEffect(() => {
        localStorage.setItem('asana-clone-notifications', JSON.stringify(notifications));
    }, [notifications]);

    const userNotifications = notifications.filter(n => n.recipientId === user?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const unreadCount = userNotifications.filter(n => !n.isRead).length;

    const addNotification = (recipientId: string, actorId: string, resourceId: string, resourceType: 'task' | 'comment' | 'project', action: 'assigned' | 'commented' | 'completed' | 'mentioned' | 'updated', message: string) => {
        const newNotification: Notification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            recipientId,
            actorId,
            resourceId,
            resourceType,
            action,
            message,
            isRead: false,
            createdAt: new Date().toISOString()
        };
        setNotifications(prev => [newNotification, ...prev]);
        console.log('Notification Added:', newNotification);
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const markAllAsRead = () => {
        if (!user) return;
        setNotifications(prev => prev.map(n => n.recipientId === user.id ? { ...n, isRead: true } : n));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{
            notifications: userNotifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            deleteNotification
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
