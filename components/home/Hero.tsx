'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Reveal from '@/components/home/Reveal';

export default function Hero() {
    return (
        <section className="relative overflow-hidden rounded-2xl border bg-white/60 p-8 dark:bg-zinc-900/60 dark:border-zinc-800">
            {/* Decorative gradient glow */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/30 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-indigo-500/20 blur-3xl" />
            </div>

            {/* JD tile */}
            <Reveal y={12}>
                <div
                    className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-bold text-white shadow-md"
                    aria-hidden
                >
                    JD
                </div>
            </Reveal>

            <div className="grid gap-4">
                <Reveal>
                    <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
                        I create solutions that reduces your IT-burden
                    </h1>
                </Reveal>

                <Reveal delay={0.1}>
                    <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
                        Focus on infrastructure, automation, migrating systems, and clear outcomes
                    </p>
                </Reveal>

                {/* Badges row */}
                <Reveal delay={0.2}>
                    <div className="mt-1 flex flex-wrap gap-2">
                        {[
                            'Staff Engineer',
                            'Atlassian Expert',
                            'Python & Automation',
                            'macOS • Linux • Windows',
                            'Cost Optimization (60%+)',
                            'Open to Collaboration',
                        ].map((b) => (
                            <span
                                key={b}
                                className="text-xs rounded-full border px-2 py-0.5 bg-white/60 dark:bg-zinc-800/60 dark:border-zinc-700 dark:text-zinc-300"
                            >
                                {b}
                            </span>
                        ))}
                    </div>
                </Reveal>

                <Reveal delay={0.3}>
                    <div className="mt-4 flex gap-3">
                        <Button asChild className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
                            <Link href="/projects">Explore Projects</Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                        >
                            <Link href="/about">About Me</Link>
                        </Button>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
