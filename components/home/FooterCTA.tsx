'use client';

import Link from 'next/link';
import Reveal from '@/components/home/Reveal';
import { Button } from '@/components/ui/button';

export default function FooterCTA() {
    const email = 'hello@jdportfolio.dev';
    const linkedIn = 'https://www.linkedin.com/in/jonas-dahlström-53822858/';

    return (
        <section
            aria-label="Contact"
            className="relative overflow-hidden rounded-2xl border bg-white/60 p-8 dark:bg-zinc-900/60 dark:border-zinc-800"
        >
            {/* soft gradient glow */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-20 -left-24 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/25 to-fuchsia-500/20 blur-3xl" />
                <div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-indigo-500/15 blur-3xl" />
            </div>

            <div className="grid gap-3">
                <Reveal>
                    <h2 className="text-2xl font-semibold tracking-tight dark:text-white">
                        Have a project in mind? Let’s talk.
                    </h2>
                </Reveal>

                <Reveal delay={0.06}>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">
                        I’m happy to chat about infrastructure, automation, migrations, and tools that remove busywork.
                    </p>
                </Reveal>

                <Reveal delay={0.12}>
                    <div className="mt-2 flex flex-wrap gap-3">
                        <Button
                            asChild
                            className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                        >
                            <Link href={`mailto:${email}`}>Email me</Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                        >
                            <Link href="/projects">See Projects</Link>
                        </Button>

                        {/* New: LinkedIn secondary link */}
                        <Button
                            asChild
                            variant="ghost"
                            className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                        >
                            <Link href={linkedIn} target="_blank" rel="noopener noreferrer">
                                LinkedIn
                            </Link>
                        </Button>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
