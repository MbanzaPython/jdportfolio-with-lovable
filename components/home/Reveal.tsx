'use client';

import { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

type RevealProps = {
    children: React.ReactNode;
    className?: string;
    /** initial Y offset (px) for the enter animation */
    y?: number;
    /** delay (s) for the enter animation */
    delay?: number;
    /** how much must be visible before triggering (0–1) */
    amount?: number;
};

export default function Reveal({
    children,
    className,
    y = 10,
    delay = 0,
    amount = 0.6,
}: RevealProps) {
    const controls = useAnimation();
    const ref = useRef<HTMLDivElement | null>(null);
    const inView = useInView(ref, { amount });

    useEffect(() => {
        if (inView) {
            controls.start('visible');
        } else {
            // reset to hidden when leaving so it can replay on re-enter
            controls.set('hidden');
        }
    }, [inView, controls]);

    return (
        <motion.div
            ref={ref}
            className={className}
            variants={{
                hidden: { opacity: 0, y },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.45, ease: 'easeOut', delay },
                },
            }}
            initial="hidden"
            animate={controls}
        >
            {children}
        </motion.div>
    );
}
