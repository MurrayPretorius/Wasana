import React, { useState, useRef, useEffect } from 'react';
import { AdjustmentsHorizontalIcon, CheckIcon } from '@heroicons/react/24/outline';

interface FilterDropdownProps {
    currentFilter: 'all' | 'incomplete' | 'completed';
    onFilterChange: (filter: 'all' | 'incomplete' | 'completed') => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ currentFilter, onFilterChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (filter: 'all' | 'incomplete' | 'completed') => {
        onFilterChange(filter);
        setIsOpen(false);
    };

    const options: { value: 'all' | 'incomplete' | 'completed'; label: string }[] = [
        { value: 'incomplete', label: 'Incomplete tasks' },
        { value: 'completed', label: 'Completed tasks' },
        { value: 'all', label: 'All tasks' },
    ];

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid transparent',
                    background: isOpen ? 'hsl(var(--accent))' : 'transparent',
                    color: 'hsl(var(--foreground))',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                }}
                className="btn-filter" // Identifier for testing
            >
                <AdjustmentsHorizontalIcon width={16} />
                Filter
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    minWidth: '200px',
                    zIndex: 50,
                }}>
                    <div style={{ padding: '0.5rem', borderBottom: '1px solid hsl(var(--border))', fontWeight: 600, fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))' }}>
                        Quick filters
                    </div>

                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => handleSelect(opt.value)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                padding: '0.5rem 1rem',
                                border: 'none',
                                background: 'transparent',
                                textAlign: 'left',
                                cursor: 'pointer',
                                color: 'hsl(var(--foreground))',
                                fontSize: '0.9rem',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--accent))'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <span style={{ flex: 1 }}>{opt.label}</span>
                            {currentFilter === opt.value && <CheckIcon width={16} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;
