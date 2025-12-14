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
            if (!supabase) {
                console.warn('Analytics: Supabase client is not initialized. Check your .env.local file.');
                return;
            }
            try {
                await supabase.from('analytics').insert({
                    event_type: 'page_view',
                    path: pathname,
                    meta: { search: searchParams.toString() },
                });
                hasLoggedViewRef.current = true;
                console.log('Analytics: Page view logged');
            } catch (error) {
                console.error('Analytics view error:', error);
            }
        };

        logView();
    }, [pathname, searchParams]);

    useEffect(() => {
        const handleClick = async (e: MouseEvent) => {
            if (!supabase) return;

            const target = e.target as HTMLElement;
            const meta = {
                x: e.clientX,
                y: e.clientY,
                tag: target.tagName,
                id: target.id,
                text: target.innerText?.slice(0, 20),
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
