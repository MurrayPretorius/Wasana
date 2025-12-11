'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

import { usePathname } from 'next/navigation';
import ProtectedRoute from './ProtectedRoute';

import ProfileSettingsModal from '../profile/ProfileSettingsModal';
import ForceChangePasswordModal from '../auth/ForceChangePasswordModal';
import CreateProjectModal from '../modals/CreateProjectModal';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    if (isLoginPage) {
        return (
            <main style={{ height: '100vh', width: '100vw', background: 'hsl(var(--background))' }}>
                {children}
            </main>
        );
    }

    return (
        <ProtectedRoute>
            <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'hsl(var(--background))' }}>
                <Sidebar />
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    position: 'relative'
                }}>
                    <Header />
                    <main style={{
                        flex: 1,
                        overflow: 'auto',
                        padding: '2rem',
                        position: 'relative'
                    }}>
                        {children}
                    </main>
                    {/* Modals placed here to be within Protected context */}
                    <ProfileSettingsModal />
                    <ForceChangePasswordModal />
                    <CreateProjectModal />
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default MainLayout;
