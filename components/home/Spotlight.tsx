'use client';

import Link from 'next/link';
import Image from 'next/image';
import Reveal from '@/components/home/Reveal';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Spotlight() {
    return (
        <section className="grid gap-4">
            <Reveal y={10}>
                <Card className="overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg dark:text-white">Average Purchase Price Calculator</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        {/* Visual with sheen overlay */}
                        <div className="rounded-xl border bg-white/60 p-4 dark:bg-zinc-800/60 dark:border-zinc-700">
                            <div className="relative aspect-video w-full overflow-hidden rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700 group">
                                <Image
                                    src="/media/home/Gemini_stocks.png"
                                    alt="Preview image for the Average Purchase Price Calculator"
                                    fill
                                    className="object-cover"
                                    sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
                                />

                                {/* Hover sheen layers */}
                                <motion.div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0"
                                    initial={{ opacity: 0.12, x: 0, y: 0 }}
                                    whileHover={{ opacity: 0.2, x: -6, y: -6 }}
                                    transition={{ type: 'spring', stiffness: 140, damping: 18, mass: 0.4 }}
                                    style={{
                                        background:
                                            'radial-gradient(120% 120% at 0% 0%, rgba(99,102,241,0.28), rgba(236,72,153,0.22) 40%, transparent 70%), linear-gradient(to bottom right, rgba(255,255,255,0.06), rgba(0,0,0,0.10))',
                                        mixBlendMode: 'screen',
                                    }}
                                />
                                <motion.div
                                    aria-hidden
                                    className="pointer-events-none absolute -inset-1 rounded-[inherit] blur-lg"
                                    initial={{ opacity: 0.0, rotate: 0 }}
                                    whileHover={{ opacity: 0.12, rotate: 2 }}
                                    transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                                    style={{
                                        background:
                                            'linear-gradient( 120deg, transparent 40%, rgba(255,255,255,0.35) 48%, transparent 56% )',
                                    }}
                                />
                                <motion.div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 rounded-[inherit]"
                                    initial={{ opacity: 0 }}
                                    whileHover={{ opacity: 1 }}
                                    transition={{ duration: 0.25, ease: 'easeOut' }}
                                    style={{
                                        boxShadow:
                                            'inset 0 0 0 1px rgba(99,102,241,0.25), inset 0 0 0 2px rgba(236,72,153,0.15)',
                                    }}
                                />
                            </div>
                            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Preview</p>
                        </div>

                        {/* Copy + CTA */}
                        <div className="grid content-between gap-3">
                            <div className="grid gap-2">
                                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                                    Run scenarios, get new averages, and export CSV. Inputs are validated and persisted so you can pick up where you left off.
                                </p>
                                <ul className="ml-4 list-disc text-sm text-zinc-600 dark:text-zinc-300">
                                    <li>Invest / Shares / Target modes</li>
                                    <li>CSV export with UI parity</li>
                                    <li>Inline validation &amp; dark mode</li>
                                </ul>
                            </div>
                            <div>
                                <Button
                                    asChild
                                    className="focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                >
                                    <Link href="/projects/calculator">Open Calculator</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Reveal>
        </section>
    );
}
