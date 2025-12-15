'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

type AnalyticsEvent = {
    id: number;
    created_at: string;
    event_type: string;
    path: string;
    meta: any;
};

export default function AdminPage() {
    // Auth state
    const [user, setUser] = useState<User | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [checkingAuth, setCheckingAuth] = useState(true);

    // Data state
    const [events, setEvents] = useState<AnalyticsEvent[]>([]);
    const [loading, setLoading] = useState(false); // Only load data when authenticated
    const [stats, setStats] = useState({ views: 0, clicks: 0 });

    useEffect(() => {
        if (!supabase) {
            setCheckingAuth(false);
            return;
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setCheckingAuth(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            fetchAnalytics();
        }
    }, [user]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');

        if (!supabase) {
            setAuthError('Supabase client not initialized');
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setAuthError(error.message);
        }
    };

    const handleLogout = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
    };

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            if (!supabase) return;

            // Fetch all events ordered by date
            const { data, error } = await supabase
                .from('analytics')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;

            if (data) {
                setEvents(data);

                const { count: viewCount } = await supabase
                    .from('analytics')
                    .select('*', { count: 'exact', head: true })
                    .eq('event_type', 'page_view');

                const { count: clickCount } = await supabase
                    .from('analytics')
                    .select('*', { count: 'exact', head: true })
                    .eq('event_type', 'click');

                setStats({
                    views: viewCount || 0,
                    clicks: clickCount || 0
                });
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                            Admin Login
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Sign in with your Supabase credentials
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="email-address" className="sr-only">Email address</label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-800 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {authError && (
                            <div className="text-red-500 text-sm text-center">
                                {authError}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen p-8 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Welcome, {user.email}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                        Logout
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Page Views</h3>
                        <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{stats.views}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Clicks</h3>
                        <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{stats.clicks}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-750">
                                <tr>
                                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Time</th>
                                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Event</th>
                                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Path</th>
                                    <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {events.map((event) => (
                                    <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {new Date(event.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${event.event_type === 'page_view'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                }`}>
                                                {event.event_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 dark:text-white">
                                            {event.path}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
                                            {JSON.stringify(event.meta)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
