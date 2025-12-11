'use client';

import React, { useState } from 'react';
import styles from '../modals/Modal.module.css';
import { useProject } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { XMarkIcon, UserPlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getInitials } from '@/utils/stringUtils';
import { isValidEmail } from '@/utils/validationUtils';

const UserManagementModal = () => {
    const { isUserModalOpen, closeModal } = useProject();
    const { users, addUser, removeUser, updateUser, user: currentUser, isAdmin } = useAuth();

    const [newEmail, setNewEmail] = useState('');
    const [newName, setNewName] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [newRole, setNewRole] = useState<'admin' | 'member'>('member');
    const [error, setError] = useState('');

    // Edit Mode State
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editRole, setEditRole] = useState<'admin' | 'member'>('member');
    const [editTitle, setEditTitle] = useState('');
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');

    // New User Credentials Modal State
    const [createdUser, setCreatedUser] = useState<{ name: string, email: string, password: string } | null>(null);

    // Generate strict password
    const generateStrictPassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        // Ensure at least one of each required type
        let password = "";
        password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 26));
        password += "abcdefghijklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * 26));
        password += "0123456789".charAt(Math.floor(Math.random() * 10));
        password += "!@#$%^&*".charAt(Math.floor(Math.random() * 8));

        // Fill rest to 12 chars
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Shuffle
        return password.split('').sort(() => 0.5 - Math.random()).join('');
    };

    if (!isUserModalOpen) return null;

    if (!isAdmin) {
        return (
            <div className={styles.overlay} onClick={closeModal}>
                <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                    <div className={styles.header}>
                        <h2 className={styles.title}>Access Denied</h2>
                        <button className={styles.closeBtn} onClick={closeModal}>
                            <XMarkIcon width={24} />
                        </button>
                    </div>
                    <div className={styles.body}>
                        <p>Only admins can manage users.</p>
                    </div>
                </div>
            </div>
        );
    }

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!newEmail || !newName) {
            setError('Email and Name are required');
            return;
        }

        if (!isValidEmail(newEmail)) {
            setError('Please enter a valid email address');
            return;
        }

        if (users.some(u => u.email.toLowerCase() === newEmail.toLowerCase())) {
            setError('User already exists');
            return;
        }

        const generatedPassword = generateStrictPassword();
        addUser(newEmail, newName, newRole, generatedPassword);

        setCreatedUser({
            name: newName,
            email: newEmail,
            password: generatedPassword
        });

        // Reset form
        setNewEmail('');
        setNewName('');
        setNewTitle('');
        setNewRole('member');
    };

    const copyCredentials = () => {
        if (!createdUser) return;
        const text = `Name: ${createdUser.name}\nEmail: ${createdUser.email}\nPassword: ${createdUser.password}`;
        navigator.clipboard.writeText(text);
        alert("Credentials copied to clipboard!");
    };


    const startEditing = (user: any) => {
        setEditingUserId(user.id);
        setEditRole(user.role);
        setEditTitle(user.title || '');
        setEditName(user.name);
        setEditEmail(user.email);
    };

    return (
        <div className={styles.overlay} onClick={closeModal}>
            <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ width: '600px', maxWidth: '90vw' }}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Manage Team</h2>
                    <button className={styles.closeBtn} onClick={closeModal}>
                        <XMarkIcon width={24} />
                    </button>
                </div>

                {/* Success / Credentials Screen */}
                {createdUser ? (
                    <div className={styles.body} style={{ textAlign: 'center' }}>
                        <div style={{
                            background: 'hsl(var(--primary) / 0.1)',
                            color: 'hsl(var(--primary))',
                            width: 64, height: 64, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem auto'
                        }}>
                            <UserPlusIcon width={32} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>User Added Successfully</h3>
                        <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '1.5rem' }}>
                            Share these credentials with the user. They will be asked to change their password on first login.
                        </p>

                        <div style={{
                            background: 'hsl(var(--muted))',
                            padding: '1.5rem',
                            borderRadius: '0.5rem',
                            textAlign: 'left',
                            marginBottom: '1.5rem',
                            fontFamily: 'monospace'
                        }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <span style={{ color: 'hsl(var(--muted-foreground))' }}>Full Name:</span> <strong>{createdUser.name}</strong>
                            </div>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <span style={{ color: 'hsl(var(--muted-foreground))' }}>Email:</span> <strong>{createdUser.email}</strong>
                            </div>
                            <div>
                                <span style={{ color: 'hsl(var(--muted-foreground))' }}>Password:</span> <strong style={{ background: 'hsl(var(--background))', padding: '0.125rem 0.25rem', borderRadius: '0.25rem' }}>{createdUser.password}</strong>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyItems: 'center', justifyContent: 'center' }}>
                            <button className={styles.secondaryBtn} onClick={() => setCreatedUser(null)}>
                                Close
                            </button>
                            <button className={styles.primaryBtn} onClick={copyCredentials}>
                                Copy Credentials
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.body} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>


                        {/* Add User Form */}
                        <div style={{ background: 'hsl(var(--background))', padding: '1rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))' }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Add New Member</h3>
                            {error && <div style={{ color: 'red', marginBottom: '0.5rem', fontSize: '0.875rem' }}>{error}</div>}
                            <form onSubmit={handleAddUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '0.5rem', alignItems: 'end' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>Full Name</label>
                                    <input
                                        className={styles.input}
                                        placeholder="John Doe"
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>Email</label>
                                    <input
                                        className={styles.input}
                                        placeholder="john@example.com"
                                        value={newEmail}
                                        onChange={e => setNewEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>Role</label>
                                    <select
                                        className={styles.input}
                                        value={newRole}
                                        onChange={e => setNewRole(e.target.value as 'admin' | 'member')}
                                    >
                                        <option value="member">Member</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <button type="submit" className={styles.saveBtn} style={{ marginBottom: '2px' }}>
                                    <UserPlusIcon width={20} />
                                </button>
                            </form>
                        </div>

                        {/* User List */}
                        <div>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Team Members ({users.length})</h3>
                            <div style={{ border: '1px solid hsl(var(--border))', borderRadius: '0.5rem', overflow: 'hidden' }}>
                                {users.map(u => (
                                    <div key={u.id} style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        padding: '0.75rem 1rem',
                                        borderBottom: '1px solid hsl(var(--border))',
                                        background: currentUser?.id === u.id ? 'hsl(var(--muted))' : 'transparent'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: '50%',
                                                    background: 'hsl(var(--primary))', color: 'white',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.875rem', fontWeight: 600
                                                }}>
                                                    {getInitials(u.name)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{u.name} {currentUser?.id === u.id && '(You)'}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                                                        {u.email} {u.title && `• ${u.title}`}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {editingUserId !== u.id ? (
                                                    <>
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '999px',
                                                            background: u.role === 'admin' ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--muted))',
                                                            color: u.role === 'admin' ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'
                                                        }}>
                                                            {u.role}
                                                        </span>
                                                        <button onClick={() => startEditing(u)} style={{ cursor: 'pointer', border: 'none', background: 'none' }}>✏️</button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => setEditingUserId(null)} style={{ fontSize: '0.75rem', cursor: 'pointer' }}>❌</button>
                                                )}

                                                {currentUser?.id !== u.id && (
                                                    <button
                                                        onClick={() => removeUser(u.id)}
                                                        style={{ background: 'none', border: 'none', color: 'hsl(var(--destructive))', cursor: 'pointer' }}
                                                        title="Remove User"
                                                    >
                                                        <TrashIcon width={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Edit Form - now correctly placed below the row info */}
                                        {editingUserId === u.id && (
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr 1fr',
                                                gap: '0.5rem',
                                                width: '100%',
                                                marginTop: '0.5rem',
                                                paddingTop: '0.5rem',
                                                borderTop: '1px dashed hsl(var(--border))'
                                            }}>
                                                <input
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value)}
                                                    placeholder="Full Name"
                                                    style={{ fontSize: '0.75rem', padding: '0.25rem', width: '100%' }}
                                                />
                                                <input
                                                    value={editEmail}
                                                    onChange={e => setEditEmail(e.target.value)}
                                                    placeholder="Email"
                                                    style={{ fontSize: '0.75rem', padding: '0.25rem', width: '100%' }}
                                                />
                                                <input
                                                    value={editTitle}
                                                    onChange={e => setEditTitle(e.target.value)}
                                                    placeholder="Job Title"
                                                    style={{ fontSize: '0.75rem', padding: '0.25rem', width: '100%' }}
                                                />
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <select
                                                        value={editRole}
                                                        onChange={e => setEditRole(e.target.value as any)}
                                                        style={{ fontSize: '0.75rem', padding: '0.25rem', flex: 1 }}
                                                    >
                                                        <option value="member">Member</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                    <button onClick={() => {
                                                        if (!editName.trim() || !editEmail.trim()) {
                                                            alert("Name and Email are required");
                                                            return;
                                                        }
                                                        if (!isValidEmail(editEmail)) {
                                                            alert("Please enter a valid email address");
                                                            return;
                                                        }
                                                        updateUser(u.id, {
                                                            name: editName,
                                                            email: editEmail,
                                                            role: editRole,
                                                            title: editTitle
                                                        });
                                                        setEditingUserId(null);
                                                    }} style={{ fontSize: '0.75rem', cursor: 'pointer' }}>💾</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagementModal;
