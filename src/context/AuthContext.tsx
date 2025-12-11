'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    users: User[]; // All users in the system
    login: (email: string, password?: string, rememberMe?: boolean) => boolean;
    logout: () => void;
    addUser: (email: string, name: string, role: 'admin' | 'member', password?: string) => void;
    removeUser: (id: string) => void;
    updateUser: (id: string, updates: Partial<User>) => void;
    isAdmin: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ADMIN: User = {
    id: 'u-admin',
    email: 'murraypretorius@gmail.com',
    name: 'Murray Pretorius',
    role: 'admin',
    avatar: '',
    password: 'password' // Mock password
};

const SEED_USERS: User[] = [
    DEFAULT_ADMIN,
    { id: 'u-2', email: 'alex@example.com', name: 'Alex', role: 'member', password: 'password' },
    { id: 'u-3', email: 'sam@example.com', name: 'Sam', role: 'member', password: 'password' }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    console.log("AuthProvider Rendering...");
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const router = useRouter();

    useEffect(() => {
        // Load from local storage
        try {
            // Check both local (persistent) and session (temporary) storage
            const storedUser = localStorage.getItem('asana_user') || sessionStorage.getItem('asana_user');
            const storedUsers = localStorage.getItem('asana_users_list');

            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser && parsedUser.email) {
                    setUser(parsedUser);
                }
            }

            if (storedUsers) {
                const parsedUsers = JSON.parse(storedUsers);
                // Simple validation to ensure it's an array and has valid user objects
                if (Array.isArray(parsedUsers) && parsedUsers.length > 0 && parsedUsers[0].email) {
                    setUsers(parsedUsers);
                } else {
                    setUsers(SEED_USERS);
                    localStorage.setItem('asana_users_list', JSON.stringify(SEED_USERS));
                }
            } else {
                setUsers(SEED_USERS);
                localStorage.setItem('asana_users_list', JSON.stringify(SEED_USERS));
            }
        } catch (e) {
            console.error("Failed to load auth data", e);
            setUsers(SEED_USERS);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = (email: string, password?: string, rememberMe?: boolean) => {
        const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        // Simple password check - in a real app this would be hashed and on the server
        if (foundUser) {
            const userPassword = foundUser.password || 'password'; // Default password for legacy/seed users

            if (password && password !== userPassword) {
                return false;
            }

            setUser(foundUser);

            if (rememberMe) {
                localStorage.setItem('asana_user', JSON.stringify(foundUser));
                sessionStorage.removeItem('asana_user'); // Clear other storage to avoid conflicts
            } else {
                sessionStorage.setItem('asana_user', JSON.stringify(foundUser));
                localStorage.removeItem('asana_user'); // Clear other storage
            }

            router.push('/');
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('asana_user');
        sessionStorage.removeItem('asana_user');
        router.push('/login');
    };

    const addUser = (email: string, name: string, role: 'admin' | 'member', password?: string) => {
        const newUser: User = {
            id: `u-${Date.now()}`,
            email,
            name,
            role,
            avatar: '',
            password: password || 'password', // Use provided password or default
            mustChangePassword: true // Force password change for new users
        };
        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        localStorage.setItem('asana_users_list', JSON.stringify(updatedUsers));
    };

    const removeUser = (id: string) => {
        const updatedUsers = users.filter(u => u.id !== id);
        setUsers(updatedUsers);
        localStorage.setItem('asana_users_list', JSON.stringify(updatedUsers));
    };

    const updateUser = (id: string, updates: Partial<User>) => {
        const updatedUsers = users.map(u => {
            if (u.id === id) {
                return { ...u, ...updates };
            }
            return u;
        });
        setUsers(updatedUsers);
        localStorage.setItem('asana_users_list', JSON.stringify(updatedUsers));

        // If updating the current user, update session as well
        if (user && user.id === id) {
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);

            // Update storage depending on where it's stored
            if (localStorage.getItem('asana_user')) {
                localStorage.setItem('asana_user', JSON.stringify(updatedUser));
            } else if (sessionStorage.getItem('asana_user')) {
                sessionStorage.setItem('asana_user', JSON.stringify(updatedUser));
            }
        }
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, users, login, logout, addUser, removeUser, updateUser, isAdmin, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
