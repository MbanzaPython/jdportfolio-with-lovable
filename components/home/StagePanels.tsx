'use client';

import Reveal from '@/components/home/Reveal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PiggyBank, Bot, MonitorSmartphone } from 'lucide-react';

type Panel = {
    title: string;
    blurb: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const PANELS: Panel[] = [
    {
        title: 'Tools that save companies money',
        blurb: 'Small, fast tools that simplify daily work and reduce operational costs—no training required.',
        icon: PiggyBank,
    },
    {
        title: 'Python & Automation',
        blurb: 'From onboarding flows to license audits, I automate the boring stuff and measure the results.',
        icon: Bot,
    },
    {
        title: 'Cross-platform expertise',
        blurb: 'macOS, Linux, and Windows—plus MDM, Atlassian, and SaaS tools.',
        icon: MonitorSmartphone,
    },
];

export default function StagePanels() {
    return (
        <section className="grid gap-4 md:grid-cols-3">
            {PANELS.map(({ title, blurb, icon: Icon }, i) => (
                <Reveal key={title} delay={0.05 * i} y={12}>
                    <Card className="h-full dark:bg-zinc-900 dark:border-zinc-800">
                        <CardHeader className="pb-2">
                            <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
                                <Icon className="h-4 w-4" />
                            </div>
                            <CardTitle className="text-base dark:text-white">{title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-zinc-600 dark:text-zinc-300">{blurb}</p>
                        </CardContent>
                    </Card>
                </Reveal>
            ))}
        </section>
    );
}
