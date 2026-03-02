'use client';

import { useState, useEffect } from 'react';
import { X, Monitor } from 'lucide-react';

export default function MobileWarningBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Show only on screens narrower than 1024px (tablets & phones)
        const check = () => setVisible(window.innerWidth < 1024);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    if (!visible) return null;

    return (
        <div
            role="alert"
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                borderTop: '1px solid rgba(99, 102, 241, 0.4)',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 -4px 24px rgba(99, 102, 241, 0.15)',
            }}
        >
            {/* Icon */}
            <div
                style={{
                    flexShrink: 0,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Monitor size={18} color="#818cf8" />
            </div>

            {/* Message */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p
                    style={{
                        margin: 0,
                        fontSize: '0.82rem',
                        color: '#c7d2fe',
                        lineHeight: 1.4,
                    }}
                >
                    <span style={{ fontWeight: 700, color: '#a5b4fc' }}>
                        Best experienced on a wider screen.&nbsp;
                    </span>
                    Open this on a laptop or desktop computer for the full experience.
                </p>
            </div>

            {/* Dismiss */}
            <button
                onClick={() => setVisible(false)}
                aria-label="Dismiss"
                style={{
                    flexShrink: 0,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    borderRadius: 6,
                    color: '#818cf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#e0e7ff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#818cf8')}
            >
                <X size={16} />
            </button>
        </div>
    );
}
