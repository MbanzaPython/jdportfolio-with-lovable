'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github } from 'lucide-react';

type AppCardProps = {
    title: string;
    description: string;
    href: string;            // live route or external URL
    repo?: string;           // optional GitHub URL
    tags?: string[];
};

export default function AppCard({ title, description, href, repo, tags = [] }: AppCardProps) {
    return (
        <Card className="h-full dark:bg-zinc-900 dark:border-zinc-800">
            <CardHeader>
                <CardTitle className="text-base dark:text-white">{title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-300">{description}</p>
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((t) => (
                            <span
                                key={t}
                                className="text-xs rounded-full border px-2 py-0.5 dark:border-zinc-700 dark:text-zinc-300"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                )}
                <div className="mt-1 flex gap-2">
                    <Button asChild size="sm">
                        <Link href={href} target={href.startsWith('http') ? '_blank' : undefined}>
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Open
                        </Link>
                    </Button>
                    {repo && (
                        <Button asChild variant="outline" size="sm">
                            <Link href={repo} target="_blank">
                                <Github className="h-4 w-4 mr-1" />
                                Source
                            </Link>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
