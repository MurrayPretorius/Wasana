'use client';

import React from 'react';
import styles from './Sidebar.module.css';
import { HomeIcon, Squares2X2Icon, CalendarIcon, UserGroupIcon, Cog6ToothIcon, InboxIcon } from '@heroicons/react/24/outline'; // Check if InboxIcon exists, otherwise use EnvelopeIcon
import { useProject } from '@/context/ProjectContext';
import { useNotification } from '@/context/NotificationContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const Sidebar = () => {
    const { openUserModal, openProfileModal, projects, activeProjectId, setActiveProjectId, openCreateProjectModal } = useProject();
    const { unreadCount } = useNotification();
    const pathname = usePathname();
    const router = useRouter();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <span>Antigravity</span>
            </div>

            <nav className={styles.nav}>
                <Link href="/" className={`${styles.navItem} ${pathname === '/' && activeProjectId === null ? styles.active : ''}`}>
                    <HomeIcon width={20} />
                    Home
                </Link>
                <Link href="/my-tasks" className={`${styles.navItem} ${pathname === '/my-tasks' ? styles.active : ''}`}>
                    <Squares2X2Icon width={20} />
                    My Tasks
                </Link>
                <Link href="/inbox" className={`${styles.navItem} ${pathname === '/inbox' ? styles.active : ''}`}>
                    <div style={{ position: 'relative' }}>
                        <InboxIcon width={20} />
                        {unreadCount > 0 && (
                            <div style={{
                                position: 'absolute', top: -2, right: -2,
                                background: 'hsl(var(--destructive))', color: 'white',
                                borderRadius: '50%', width: 8, height: 8
                            }} />
                        )}
                    </div>
                    <span>Inbox</span>
                    {unreadCount > 0 && (
                        <span style={{
                            marginLeft: 'auto',
                            background: 'hsl(var(--destructive))',
                            color: 'white',
                            fontSize: '0.7rem',
                            padding: '0 0.4rem',
                            borderRadius: '10px'
                        }}>
                            {unreadCount}
                        </span>
                    )}
                </Link>

                <div className={styles.sectionTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Projects</span>
                    <button
                        onClick={(e) => { e.preventDefault(); openCreateProjectModal(); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '0.2rem' }}
                        title="Add Project"
                    >
                        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span>
                    </button>
                </div>

                {projects.map(project => (
                    <button
                        key={project.id}
                        className={`${styles.navItem} ${project.id === activeProjectId && pathname === '/' ? styles.active : ''}`}
                        onClick={() => {
                            setActiveProjectId(project.id);
                            if (pathname !== '/my-tasks') router.push('/my-tasks');
                        }}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', width: '100%', fontSize: 'inherit', fontFamily: 'inherit' }}
                    >
                        <span style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: project.id === activeProjectId ? 'hsl(var(--primary))' : '#cbd5e1'
                        }}></span>
                        {project.name}
                    </button>
                ))}

                <div style={{ marginTop: 'auto' }}></div>
                <button
                    onClick={openUserModal}
                    className={styles.navItem}
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                    <UserGroupIcon width={20} />
                    Team
                </button>
                <button
                    onClick={openProfileModal}
                    className={styles.navItem}
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                    <Cog6ToothIcon width={20} />
                    Settings
                </button>
            </nav>
        </aside>
    );
};

export default Sidebar;
