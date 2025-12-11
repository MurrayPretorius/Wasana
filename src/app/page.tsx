'use client';

import { useAuth } from "@/context/AuthContext";
import { useProject } from "@/context/ProjectContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { CheckCircleIcon, PlusIcon } from '@heroicons/react/24/outline';
import TaskModal from "@/components/modals/TaskModal";
import UserManagementModal from "@/components/admin/UserManagementModal";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function Home() {
  const { user, users } = useAuth();
  const router = useRouter();
  const {
    projects,
    openNewTaskModal,
    openCreateProjectModal,
    openUserModal,
    openEditTaskModal, // To open task details
    setActiveProjectId // To navigate to project
  } = useProject();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'overdue' | 'completed'>('upcoming');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  // Aggregate all tasks assigned to current user
  const myTasks = projects.flatMap(p => p.columns.flatMap(c => c.tasks))
    .filter(t => t.assignee?.id === user.id);

  const filteredTasks = myTasks.filter(t => {
    if (activeTab === 'completed') return t.status === 'done';
    if (activeTab === 'overdue') {
      // Simple overdue check if due date exists
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date() && t.status !== 'done';
    }
    // Upcoming (default for others)
    if (activeTab === 'upcoming') {
      // Include tasks without due date or future due date, and not done
      if (t.status === 'done') return false;
      if (!t.dueDate) return true;
      return new Date(t.dueDate) >= new Date();
    }
    return false;
  });

  const frequentCollaborators = users.filter(u => u.id !== user.id).slice(0, 5);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: 'hsl(var(--foreground))' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>
          {formatDate()}
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          {getGreeting()}, {user.name}
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Column: My Tasks */}
        <div style={{ background: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', padding: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ background: 'hsl(var(--primary) / 0.1)', padding: '6px', borderRadius: '50%', color: 'hsl(var(--primary))' }}>
                <CheckCircleIcon width={20} />
              </div>
              <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>My tasks</span>
            </div>
            <button style={{ fontSize: '1.5rem', color: 'hsl(var(--muted-foreground))' }}>...</button>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid hsl(var(--border))', marginBottom: '1rem' }}>
            <button
              onClick={() => setActiveTab('upcoming')}
              style={{ paddingBottom: '0.5rem', borderBottom: activeTab === 'upcoming' ? '2px solid hsl(var(--primary))' : 'none', fontWeight: activeTab === 'upcoming' ? 600 : 400, color: activeTab === 'upcoming' ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))', background: 'none', border: 'none', cursor: 'pointer', borderBottomWidth: activeTab === 'upcoming' ? '2px' : '0' }}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('overdue')}
              style={{ paddingBottom: '0.5rem', borderBottom: activeTab === 'overdue' ? '2px solid hsl(var(--destructive))' : 'none', fontWeight: activeTab === 'overdue' ? 600 : 400, color: activeTab === 'overdue' ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))', background: 'none', border: 'none', cursor: 'pointer', borderBottomWidth: activeTab === 'overdue' ? '2px' : '0' }}
            >
              Overdue
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              style={{ paddingBottom: '0.5rem', borderBottom: activeTab === 'completed' ? '2px solid hsl(var(--green-500))' : 'none', fontWeight: activeTab === 'completed' ? 600 : 400, color: activeTab === 'completed' ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))', background: 'none', border: 'none', cursor: 'pointer', borderBottomWidth: activeTab === 'completed' ? '2px' : '0' }}
            >
              Completed
            </button>
          </div>

          <button
            onClick={openNewTaskModal}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--muted-foreground))', marginBottom: '1rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <PlusIcon width={16} />
            <span>Create task</span>
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
            {filteredTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--muted-foreground))' }}>
                No tasks found in {activeTab}.
              </div>
            ) : (
              filteredTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => openEditTaskModal(task)}
                  style={{ padding: '0.75rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                  className={styles.taskItem} // Add hover effect in CSS if needed or inline
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: '1px solid hsl(var(--muted-foreground))',
                    background: task.status === 'done' ? 'hsl(var(--green-500))' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {task.status === 'done' && <CheckCircleIcon width={14} color="white" />}
                  </div>
                  <span style={{ textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? 'hsl(var(--muted-foreground))' : 'inherit' }}>
                    {task.title}
                  </span>
                  {/* Find project name for task if possible */}
                  {task.projects && task.projects.length > 0 && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '2px 8px', background: 'hsl(var(--primary) / 0.1)', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                      {projects.find(p => p.id === task.projects![0])?.name || 'Project'}
                    </span>
                  )}
                  {task.dueDate && (
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', whiteSpace: 'nowrap' }}>
                      {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Projects & People */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Projects Widget */}
          <div style={{ background: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontWeight: '600' }}>Projects</span>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Recents</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={openCreateProjectModal}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  background: 'transparent', border: '1px dashed hsl(var(--muted-foreground))',
                  padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', width: '100%'
                }}
              >
                <div style={{ background: 'hsl(var(--background))', padding: '8px', borderRadius: '50%' }}>
                  <PlusIcon width={16} />
                </div>
                Create project
              </button>

              {projects.slice(0, 3).map(p => (
                <button
                  onClick={() => {
                    setActiveProjectId(p.id);
                    router.push('/my-tasks');
                  }} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                >
                  <div style={{ width: 32, height: 32, background: 'hsl(var(--primary))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Squares2X2Icon width={16} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>{p.description || "Project"}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* People Widget */}
          <div style={{ background: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontWeight: '600' }}>People</span>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>Frequent collaborators</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={openUserModal}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  background: 'transparent', border: 'none',
                  padding: '0.5rem', cursor: 'pointer', textAlign: 'left', width: '100%'
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1px dashed hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PlusIcon width={16} />
                </div>
                <span>Invite</span>
              </button>

              {frequentCollaborators.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'hsl(var(--primary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                    {u.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 500 }}>{u.name}</span>
                </div>
              ))}

              {frequentCollaborators.length === 0 && (
                <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  No other team members yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Include Modals here to ensure they render on this page too */}
      <TaskModal />
      <UserManagementModal />
    </div>
  );
}

import { Squares2X2Icon } from '@heroicons/react/24/outline'; // Late import to fix reference in render
