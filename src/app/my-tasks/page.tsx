'use client';

import BoardView from "@/components/board/BoardView";
import ListView from "@/components/list/ListView";
import ViewSwitcher from "@/components/views/ViewSwitcher";
import styles from "../page.module.css";
import TaskModal from "@/components/modals/TaskModal";
import UserManagementModal from "@/components/admin/UserManagementModal";
import FilterDropdown from "@/components/common/FilterDropdown";
import { useProject } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyTasksPage() {
    const { openNewTaskModal, archiveCompletedTasks, filterStatus, setFilterStatus } = useProject();
    const { user } = useAuth();
    const router = useRouter();
    const [currentView, setCurrentView] = useState<'board' | 'list'>('list');

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    if (!user) return null;

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0 1.5rem', marginBottom: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>My Tasks</h1>
                    <ViewSwitcher currentView={currentView} onViewChange={setCurrentView} />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className={styles.btn}
                        onClick={archiveCompletedTasks}
                        title="Move completed tasks to 'Completed [Date]'"
                    >
                        Move Completed
                    </button>
                    <FilterDropdown currentFilter={filterStatus} onFilterChange={setFilterStatus} />
                    <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={openNewTaskModal}
                    >
                        New Task
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, overflow: 'hidden', padding: currentView === 'board' ? '0 1.5rem' : '0' }}>
                {currentView === 'board' ? <BoardView /> : <ListView />}
            </div>

            <TaskModal />
            <UserManagementModal />
        </div>
    );
}
