'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Sparkles, LogOut, Home, Menu, X, Scroll, Trophy, Settings } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

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
        <div className="min-h-screen gradient-bg">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            </div>

            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 flex items-center justify-center rounded border border-primary/20">
                                <Scroll className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-xl font-serif font-bold text-white tracking-tight">IHYA</span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <Home className="h-4 w-4" />
                                    Dashboard
                                </Button>
                            </Link>
                            <Link href="/dashboard/achievements">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <Trophy className="h-4 w-4" />
                                    Honors
                                </Button>
                            </Link>
                            <Link href="/dashboard/settings">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <Settings className="h-4 w-4" />
                                    Settings
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="gap-2 glass"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </Button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden py-4 space-y-2 border-t border-white/5">
                            <Link href="/dashboard">
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                    <Home className="h-4 w-4" />
                                    Dashboard
                                </Button>
                            </Link>
                            <Link href="/dashboard/achievements">
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                    <Trophy className="h-4 w-4" />
                                    Honors
                                </Button>
                            </Link>
                            <Link href="/dashboard/settings">
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                    <Settings className="h-4 w-4" />
                                    Settings
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-2"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 relative z-10">
                {children}
            </main>
        </div>
    );
}
