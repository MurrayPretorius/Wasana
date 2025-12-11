'use client';

import React, { useState, useEffect } from 'react';
import styles from '../modals/Modal.module.css';
import { useProject } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { isValidEmail, isValidPassword, PASSWORD_REQUIREMENTS_MSG } from '@/utils/validationUtils';

const ProfileSettingsModal = () => {
    const { isProfileModalOpen, closeModal } = useProject();
    const { user, updateUser } = useAuth();

    const [name, setName] = useState('');
    const [title, setTitle] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Feedback state
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user && isProfileModalOpen) {
            setName(user.name);
            setTitle(user.title || '');
            setEmail(user.email);
            setPassword(user.password || ''); // Pre-fill if available in legacy
            setMessage(null);
        }
    }, [user, isProfileModalOpen]);

    if (!isProfileModalOpen || !user) return null;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!name.trim() || !email.trim()) {
            setMessage({ type: 'error', text: 'Name and Email are required.' });
            return;
        }

        if (!isValidEmail(email)) {
            setMessage({ type: 'error', text: 'Please enter a valid email address.' });
            return;
        }

        if (password && !isValidPassword(password)) {
            setMessage({ type: 'error', text: PASSWORD_REQUIREMENTS_MSG });
            return;
        }

        try {
            updateUser(user.id, {
                name,
                title,
                email,
                password: password || undefined // Only update if provided
            });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // Auto close after meaningful delay or just stay open?
            // User likely wants confirm. Stay open.
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        }
    };

    return (
        <div className={styles.overlay} onClick={closeModal}>
            <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div className={styles.header}>
                    <h2 className={styles.title}>My Profile</h2>
                    <button className={styles.closeBtn} onClick={closeModal}>
                        <XMarkIcon width={24} />
                    </button>
                </div>

                <div className={styles.body}>
                    {message && (
                        <div style={{
                            padding: '0.75rem',
                            marginBottom: '1rem',
                            borderRadius: 'var(--radius)',
                            background: message.type === 'success' ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--destructive) / 0.1)',
                            color: message.type === 'success' ? 'hsl(var(--primary))' : 'hsl(var(--destructive))',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            {message.type === 'success' && <CheckIcon width={16} />}
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label className={styles.label}>Full Name</label>
                            <input
                                className={styles.input}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Your Name"
                            />
                        </div>

                        <div>
                            <label className={styles.label}>Job Title</label>
                            <input
                                className={styles.input}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Senior Designer"
                            />
                        </div>

                        <div>
                            <label className={styles.label}>Email Address</label>
                            <input
                                className={styles.input}
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@company.com"
                            />
                        </div>

                        <div>
                            <label className={styles.label}>Password</label>
                            <input
                                className={styles.input}
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Leave blank to keep current"
                            />
                            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem' }}>
                                For this demo, passwords are stored locally.
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button type="button" onClick={closeModal} className={styles.secondaryBtn} style={{ marginRight: '0.5rem' }}>
                                Cancel
                            </button>
                            <button type="submit" className={styles.primaryBtn}>
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettingsModal;
