'use client';

import React, { useState } from 'react';
import styles from './Modal.module.css';
import { useProject } from '@/context/ProjectContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';

const CreateProjectModal = () => {
    const { isCreateProjectModalOpen, closeModal, addProject } = useProject();
    const { users } = useAuth(); // To pick members
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

    if (!isCreateProjectModalOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        addProject(name, description, selectedMemberIds);

        // Reset and close
        setName('');
        setDescription('');
        setSelectedMemberIds([]);
        closeModal();
    };

    const toggleMember = (id: string) => {
        setSelectedMemberIds(prev =>
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        );
    };

    return (
        <div className={styles.overlay} onClick={closeModal}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Create New Project</h2>
                    <button className={styles.closeButton} onClick={closeModal}>
                        <XMarkIcon width={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.content}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Project Name</label>
                        <input
                            className={styles.input}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Marketing Launch"
                            autoFocus
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                        <textarea
                            className={styles.textarea}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="What's this project about?"
                            rows={3}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Team Members</label>
                        <div style={{
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.5rem',
                            padding: '0.5rem',
                            maxHeight: '150px',
                            overflowY: 'auto'
                        }}>
                            {users.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => toggleMember(user.id)}
                                    style={{
                                        padding: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        cursor: 'pointer',
                                        background: selectedMemberIds.includes(user.id) ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                                        borderRadius: '4px'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedMemberIds.includes(user.id)}
                                        readOnly
                                        style={{ accentColor: 'hsl(var(--primary))' }}
                                    />
                                    <span>{user.name}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>{user.email}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button type="button" className={styles.secondaryButton} onClick={closeModal}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.primaryButton} disabled={!name.trim()}>
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;
