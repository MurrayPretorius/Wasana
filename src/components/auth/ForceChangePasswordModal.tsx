'use client';

import React, { useState } from 'react';
import styles from '../modals/Modal.module.css';
import { useAuth } from '@/context/AuthContext';
import { isValidPassword, PASSWORD_REQUIREMENTS_MSG } from '@/utils/validationUtils';
import { CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ForceChangePasswordModal = () => {
    const { user, updateUser } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!user || !user.mustChangePassword) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!isValidPassword(newPassword)) {
            setError(PASSWORD_REQUIREMENTS_MSG);
            return;
        }

        try {
            updateUser(user.id, {
                password: newPassword,
                mustChangePassword: false
            });
            setSuccess(true);
        } catch (err) {
            setError("Failed to update password. Please try again.");
        }
    };

    if (success) {
        return null; // Don't render if success (state update will likely unmount it anyway via parent)
    }

    return (
        <div className={styles.overlay} style={{ zIndex: 9999, backdropFilter: 'blur(5px)' }}>
            <div className={styles.modal} style={{ maxWidth: '450px' }}>
                <div className={styles.header}>
                    <h2 className={styles.title} style={{ color: 'hsl(var(--destructive))', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ExclamationTriangleIcon width={24} />
                        Security Update Required
                    </h2>
                </div>
                <div className={styles.body}>
                    <p style={{ marginBottom: '1.5rem', color: 'hsl(var(--muted-foreground))' }}>
                        You are using a temporary password. Please set a new secure password to continue accessing your account.
                    </p>

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            marginBottom: '1rem',
                            background: 'hsl(var(--destructive) / 0.1)',
                            color: 'hsl(var(--destructive))',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label className={styles.label}>New Password</label>
                            <input
                                className={styles.input}
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="Enter strong password"
                            />
                        </div>
                        <div>
                            <label className={styles.label}>Confirm Password</label>
                            <input
                                className={styles.input}
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                            />
                        </div>

                        <div style={{ marginTop: '0.5rem' }}>
                            <button type="submit" className={styles.primaryBtn} style={{ width: '100%' }}>
                                Update Password & Continue
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForceChangePasswordModal;
