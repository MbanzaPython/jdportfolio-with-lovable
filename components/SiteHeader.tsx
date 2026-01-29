'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SiteHeader() {
    const pathname = usePathname();
    const [dark, setDark] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('avgcalc-theme');
        if (saved) setDark(saved === 'dark');
    }, []);
    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
        localStorage.setItem('avgcalc-theme', dark ? 'dark' : 'light');
    }, [dark]);

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        // keep section tabs active on nested pages, e.g. /projects/* 
        return pathname === href || pathname.startsWith(href + '/');
    };

    const link = (href: string, label: string) => {
        const active = isActive(href);
        return (
            <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`group relative px-3 py-2 rounded-lg text-sm
          ${active
                        ? 'bg-zinc-200 dark:bg-zinc-800 font-medium'
                        : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'}
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2`}
            >
                <span>{label}</span>
                {/* underline */}
                <span
                    className={`pointer-events-none absolute left-2 right-2 -bottom-[2px] h-0.5 rounded-full
                      bg-fuchsia-600 dark:bg-fuchsia-400 origin-left
                      motion-safe:transition-transform motion-safe:duration-300
                      ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
                />
            </Link>
        );
    };

    return (
        <header className="sticky top-0 z-10 border-b border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur bg-white/60 dark:bg-zinc-900/60">
            <div className="mx-auto max-w-5xl flex items-center justify-between h-14 px-4">
                <div className="flex items-center gap-3">
                    {/* JD icon + 'Portfolio' text (your version) */}
                    <Link href="/" className="flex items-center gap-2 group" aria-label="Home">
                        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                            JD
                        </div>
                        <span className="text-sm font-semibold tracking-tight group-hover:opacity-90">
                            Portfolio
                        </span>
                    </Link>

                    <nav className="ml-3 flex items-center gap-1">
                        {link('/projects', 'Projects')}
                        {link('/about', 'About')}
                    </nav>
                </div>

                <button
                    aria-label="Toggle dark mode"
                    onClick={() => setDark(d => !d)}
                    className="rounded-lg px-3 py-2 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                    {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
            </div>
        </header>
    );
}
