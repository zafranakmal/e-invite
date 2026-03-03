'use client';

import { useState, useEffect } from 'react';

interface BottomNavProps {
  visible: boolean; // only show after invitation is revealed
}

const NAV_ITEMS = [
  {
    id: 'invitation',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    id: 'itinerary',
    label: 'Itinerary',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="15" x2="16" y2="15" />
      </svg>
    ),
  },
  {
    id: 'rsvp',
    label: 'RSVP',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'gift',
    label: 'Gift',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
  {
    id: 'wishes',
    label: 'Wishes',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
];

export default function BottomNav({ visible }: BottomNavProps) {
  const [activeId, setActiveId] = useState<string>('invitation');

  // Highlight nav item based on scroll position
  useEffect(() => {
    if (!visible) return;

    let rafId: number;
    const handleScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const ids = NAV_ITEMS.map((item) => item.id);
        for (let i = ids.length - 1; i >= 0; i--) {
          const el = document.getElementById(ids[i]);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 0.45) {
              setActiveId(ids[i]);
              break;
            }
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [visible]);

  const handleNav = (id: string) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <nav className={`bottom-nav${visible ? ' visible' : ''}`} role="navigation" aria-label="Page sections">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => handleNav(item.id)}
          className={`nav-item${activeId === item.id ? ' active' : ''}`}
          aria-label={item.label}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}

      <style jsx>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: #2c2218;
          display: flex;
          align-items: stretch;
          justify-content: space-around;
          /* Hidden until invitation is revealed */
          opacity: 0;
          transform: translateY(100%);
          transition: opacity 0.6s ease 0.5s, transform 0.6s ease 0.5s;
          pointer-events: none;
          /* Safe area for mobile home indicator */
          padding-bottom: env(safe-area-inset-bottom, 0px);
          min-height: 5vh;
        }

        .bottom-nav.visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          padding: 0.65rem 0.25rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #a09080;
          transition: color 0.2s ease, background 0.2s ease;
          position: relative;
        }

        .nav-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 20%;
          right: 20%;
          height: 2px;
          background: #8faa6e;
          border-radius: 0 0 2px 2px;
          transform: scaleX(0);
          transition: transform 0.25s ease;
        }

        .nav-item.active {
          color: #f0e8dc;
        }

        .nav-item.active::before {
          transform: scaleX(1);
        }

        .nav-item:hover:not(.active) {
          color: #c8b8a8;
          background: rgba(255, 255, 255, 0.04);
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .nav-label {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.62rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          line-height: 1;
          white-space: nowrap;
        }
      `}</style>
    </nav>
  );
}
