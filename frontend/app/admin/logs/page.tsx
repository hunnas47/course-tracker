'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Clock, Activity, User, Monitor, Sparkles, LogOut } from 'lucide-react';
import { format } from 'date-fns';

interface Log {
    id: string;
    action: string;
    metadata: string | null;
    createdAt: string;
    user: {
        id: string;
        username: string;
    };
}

export default function AdminLogsPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLogs = async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await api.get(`/activity?page=${pageNum}&limit=20`);
            setLogs(res.data.logs);
            setTotalPages(res.data.totalPages);
            setPage(res.data.page);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(1);
    }, []);

    const getActionColor = (action: string) => {
        switch (action) {
            case 'LOGIN': return 'text-green-400';
            case 'LOGOUT': return 'text-yellow-400';
            case 'WATCH_CLASS': return 'text-blue-400';
            case 'UNWATCH_CLASS': return 'text-red-400';
            default: return 'text-white';
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'LOGIN':
            case 'LOGOUT': return <User className="h-4 w-4" />;
            case 'WATCH_CLASS':
            case 'UNWATCH_CLASS': return <Monitor className="h-4 w-4" />;
            default: return <Activity className="h-4 w-4" />;
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout logging failed', error);
        } finally {
            localStorage.removeItem('token');
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/5 bg-background/50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div
                            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => router.push('/admin')}
                        >
                            <Sparkles className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-amber-200">
                                IHYA Admin
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => router.push('/admin')} className="gap-2 text-muted-foreground hover:text-white">
                                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 border-white/10 hover:bg-white/5">
                                <LogOut className="h-4 w-4" /> Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                        <Clock className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Activity Audit Logs</h1>
                        <p className="text-muted-foreground">Track and monitor system access and student progress.</p>
                    </div>
                </div>

                <Card className="bg-card/50 border-white/5 backdrop-blur-sm shadow-xl overflow-hidden">
                    <div className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/5 bg-white/5 hover:bg-white/5">
                                    <TableHead className="text-white/60 pl-6 w-[200px]">Time</TableHead>
                                    <TableHead className="text-white/60 w-[200px]">User</TableHead>
                                    <TableHead className="text-white/60 w-[200px]">Action</TableHead>
                                    <TableHead className="text-white/60">Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                Loading logs...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">
                                            No records found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                            <TableCell className="pl-6 font-mono text-sm text-muted-foreground group-hover:text-white/80 transition-colors">
                                                {format(new Date(log.createdAt), 'MMM d, yyyy h:mm:ss a')}
                                            </TableCell>
                                            <TableCell className="font-medium text-white group-hover:text-primary transition-colors">
                                                {log.user.username}
                                            </TableCell>
                                            <TableCell>
                                                <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/5 w-fit border border-transparent ${getActionColor(log.action)}`}>
                                                    {getActionIcon(log.action)}
                                                    {log.action.replace('_', ' ')}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-white/60 text-sm">
                                                {log.metadata || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center p-4 border-t border-white/5 bg-white/[0.02]">
                        <span className="text-xs text-muted-foreground font-mono">
                            Page {page} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchLogs(page - 1)}
                                disabled={page <= 1 || loading}
                                className="h-8 text-xs border-white/10 hover:bg-white/5"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchLogs(page + 1)}
                                disabled={page >= totalPages || loading}
                                className="h-8 text-xs border-white/10 hover:bg-white/5"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </Card>
            </main>
        </div>
    );
}
