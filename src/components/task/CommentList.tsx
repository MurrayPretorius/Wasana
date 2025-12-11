'use client';

import React, { useState } from 'react';
import { Comment } from '@/types';
import { getInitials } from '@/utils/stringUtils';

interface CommentListProps {
    comments: Comment[];
}

const CommentItem = ({ comment }: { comment: Comment }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLong = comment.content.length > 150;

    return (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'hsl(var(--primary))', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', flexShrink: 0
            }}>
                {getInitials(comment.author.name)}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{comment.author.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                        {new Date(comment.createdAt).toLocaleString()}
                    </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'hsl(var(--foreground))', lineHeight: '1.4' }}>
                    {isExpanded || !isLong ? comment.content : `${comment.content.substring(0, 150)}...`}
                    {isLong && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            style={{
                                background: 'none', border: 'none', padding: '0 0.25rem',
                                color: 'hsl(var(--primary))', cursor: 'pointer', fontSize: '0.8rem'
                            }}
                        >
                            {isExpanded ? 'See Less' : 'See More'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const CommentList = ({ comments }: CommentListProps) => {
    if (!comments || comments.length === 0) return null;

    return (
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid hsl(var(--border))' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Comments ({comments.length})</h3>
            {comments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
            ))}
        </div>
    );
};

export default CommentList;
