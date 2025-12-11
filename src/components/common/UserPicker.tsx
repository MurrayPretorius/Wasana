'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/utils/stringUtils';
import { CheckIcon, UserPlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import styles from './UserPicker.module.css';

interface UserPickerProps {
    selectedUserIds: string[]; // For single mode, just pass [id]
    onChange: (ids: string[]) => void;
    placeholder?: string;
    multiple?: boolean;
    onClose?: () => void;
}


const UserPicker = ({ selectedUserIds, onChange, placeholder = "Select user...", multiple = false, onClose }: UserPickerProps) => {
    const { users } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                onClose?.();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const toggleUser = (id: string) => {
        if (multiple) {
            if (selectedUserIds.includes(id)) {
                onChange(selectedUserIds.filter(uid => uid !== id));
            } else {
                onChange([...selectedUserIds, id]);
            }
        } else {
            onChange([id]); // Replace
            setIsOpen(false);
            onClose?.();
        }
    };

    // Derived display
    const selectedUsers = users.filter(u => selectedUserIds.includes(u.id));

    return (
        <div className={styles.container} ref={containerRef}>
            {/* Trigger */}
            <div className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
                {selectedUsers.length === 0 ? (
                    <div className={styles.placeholder}>
                        <div className={styles.dashedAvatar}><UserPlusIcon width={16} /></div>
                        <span>{placeholder}</span>
                    </div>
                ) : (
                    <div className={styles.selection}>
                        {/* Show first few avatars */}
                        {selectedUsers.slice(0, 3).map(user => (
                            <div key={user.id} className={styles.avatar} title={user.name}>
                                {getInitials(user.name)}
                            </div>
                        ))}
                        {selectedUsers.length > 3 && (
                            <div className={styles.moreCount}>+{selectedUsers.length - 3}</div>
                        )}
                        {/* If single, show name */}
                        {!multiple && selectedUsers.length === 1 && (
                            <span className={styles.singleName}>{selectedUsers[0].name}</span>
                        )}
                        {multiple && selectedUsers.length > 0 && (
                            <span className={styles.singleName}>{selectedUsers.length} selected</span>
                        )}
                    </div>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.searchBox}>
                        <MagnifyingGlassIcon width={16} className={styles.searchIcon} />
                        <input
                            placeholder="Search..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className={styles.searchInput}
                            autoFocus
                        />
                    </div>
                    <div className={styles.list}>
                        {filteredUsers.map(user => (
                            <div
                                key={user.id}
                                className={`${styles.item} ${selectedUserIds.includes(user.id) ? styles.selected : ''}`}
                                onClick={() => toggleUser(user.id)}
                            >
                                <div className={styles.itemAvatar}>
                                    {getInitials(user.name)}
                                </div>
                                <div className={styles.itemInfo}>
                                    <div className={styles.itemName}>{user.name}</div>
                                    <div className={styles.itemEmail}>{user.email}</div>
                                </div>
                                {selectedUserIds.includes(user.id) && (
                                    <CheckIcon width={16} className={styles.check} />
                                )}
                            </div>
                        ))}
                        {filteredUsers.length === 0 && (
                            <div className={styles.empty}>No users found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPicker;
