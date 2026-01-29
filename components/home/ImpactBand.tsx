'use client';

import Reveal from '@/components/home/Reveal';

type Metric = { heading: string; sub: string };

const METRICS: Metric[] = [
    { heading: '5/5', sub: 'Customer feedback (YoY)' },
    { heading: 'Get better deals', sub: 'Cost reduction via procurement' },
    { heading: 'Experience in Migrating IT Environments', sub: 'Google • Atlassian • Office Space' },
    { heading: 'Supporting Globally', sub: 'No timezone restrictions' },
];

export default function ImpactBand() {
    return (
        <section className="rounded-2xl border bg-white/60 p-6 dark:bg-zinc-900/60 dark:border-zinc-800">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {METRICS.map((m, i) => (
                    <Reveal key={m.heading + m.sub} delay={0.04 * i} y={8}>
                        <div className="grid gap-1">
                            <div className="text-lg font-semibold tracking-tight dark:text-white">{m.heading}</div>
                            <div className="text-sm text-zinc-600 dark:text-zinc-300">{m.sub}</div>
                        </div>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}
