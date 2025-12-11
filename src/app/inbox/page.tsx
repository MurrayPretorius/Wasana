'use client';

import React from 'react';
import { useNotification } from '@/context/NotificationContext';
import { useProject } from '@/context/ProjectContext';
import { useRouter } from 'next/navigation';
import { CheckIcon, TrashIcon, EnvelopeOpenIcon } from '@heroicons/react/24/outline';

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
}


const InboxPage = () => {
    const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotification();
    const { openEditTaskModal, columns } = useProject(); // We might need a better way to find tasks if they are in other projects/not loaded
    const router = useRouter();

    const handleNotificationClick = (notification: any) => {
        markAsRead(notification.id);
        if (notification.resourceType === 'task') {
            // Find task - simplified logic assuming task is in currently loaded columns
            // In a real app we'd fetch the task by ID
            const task = columns.flatMap(c => c.tasks).find(t => t.id === notification.resourceId);
            if (task) {
                openEditTaskModal(task);
            } else {
                // Fallback or fetch logic
                console.warn('Task not found in current view');
            }
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Inbox</h1>
                {notifications.length > 0 && (
                    <button
                        onClick={markAllAsRead}
                        style={{
                            background: 'transparent',
                            border: '1px solid hsl(var(--border))',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <EnvelopeOpenIcon width={16} />
                        Mark all as read
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'hsl(var(--muted-foreground))' }}>
                        <p>You're all caught up!</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                background: notification.isRead ? 'transparent' : 'hsl(var(--card))',
                                border: `1px solid ${notification.isRead ? 'transparent' : 'hsl(var(--border))'}`,
                                borderBottom: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--muted) / 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = notification.isRead ? 'transparent' : 'hsl(var(--card))'}
                        >
                            {!notification.isRead && (
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'hsl(var(--primary))',
                                    flexShrink: 0
                                }} />
                            )}

                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                                    {notification.message}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                                    {formatTimeAgo(notification.createdAt)}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                                {!notification.isRead && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                                        title="Mark as read"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}
                                    >
                                        <CheckIcon width={18} />
                                    </button>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                                    title="Delete"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}
                                >
                                    <TrashIcon width={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default InboxPage;
