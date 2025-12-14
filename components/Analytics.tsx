'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function Analytics() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const hasLoggedViewRef = useRef(false);

    useEffect(() => {
        // Reset view logging on path change
        hasLoggedViewRef.current = false;
    }, [pathname, searchParams]);

    useEffect(() => {
        if (hasLoggedViewRef.current) return;

        const logView = async () => {
            try {
                await supabase.from('analytics').insert({
                    event_type: 'page_view',
                    path: pathname,
                    meta: { search: searchParams.toString() },
                });
                hasLoggedViewRef.current = true;
            } catch (error) {
                console.error('Analytics view error:', error);
            }
        };

        logView();
    }, [pathname, searchParams]);

    useEffect(() => {
        const handleClick = async (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Basic element info anonymously
            const meta = {
                x: e.clientX,
                y: e.clientY,
                tag: target.tagName,
                id: target.id,
                text: target.innerText?.slice(0, 20), // Truncate text
            };

            try {
                await supabase.from('analytics').insert({
                    event_type: 'click',
                    path: pathname,
                    meta,
                });
            } catch (error) {
                console.error('Analytics click error:', error);
            }
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [pathname]);

    return null;
}
