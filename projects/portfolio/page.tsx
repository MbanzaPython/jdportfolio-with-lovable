"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PortfolioProjectPage() {
    return (
        <div className="mx-auto max-w-3xl space-y-8 py-12 px-6">
            <Card className="shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                        JD Portfolio Website
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 leading-relaxed text-zinc-700 dark:text-zinc-300">
                    <p>
                        This is the very website you’re visiting — a fully custom portfolio and
                        utility dashboard built from the ground up through real-time, iterative
                        collaboration. Every feature, from the live stock quote panel to the CSV
                        export and persistent local data, was written line by line, guided by a
                        mix of experimentation and intuition.
                    </p>

                    <p>
                        The goal was to create a digital home that feels like me — not just a
                        collection of projects, but a space to explore, test, and build freely.
                        Each detail, from button motion to color balance, was refined through
                        hands-on “vibe coding” sessions where design followed curiosity rather
                        than strict specs.
                    </p>

                    <p>
                        Built with <strong>Next.js</strong>, <strong>TypeScript</strong>, and
                        deployed via <strong>Vercel</strong>, it emphasizes performance,
                        maintainability, and a lightweight component system that I can expand
                        with future ideas — finance tools, micro-apps, or experimental features.
                    </p>

                    <Separator className="my-8" />

                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Stack:</strong> Next.js, TypeScript, TailwindCSS, Vercel</p>
                        <p><strong>Design Focus:</strong> Minimal, fast, tactile, modular</p>
                        <p><strong>Scope:</strong> UI/UX, API integration, data persistence, performance optimization</p>
                    </div>

                    <p className="mt-6 italic text-zinc-500 dark:text-zinc-400">
                        “Coded by intuition, refined by iteration — this site is as much a
                        process as it is a project.”
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
