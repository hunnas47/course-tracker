'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AlertCircle, Sparkles, ArrowLeft, Zap } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', { username, password });
            const { access_token } = res.data;
            localStorage.setItem('token', access_token);

            // Decode token to get role
            const payload = JSON.parse(atob(access_token.split('.')[1]));
            if (payload.role === 'ADMIN') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            </div>

            {/* Back Button */}
            <Link href="/" className="absolute top-6 left-6 z-10">
                <Button variant="ghost" size="sm" className="gap-2 glass">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </Link>

            {/* Login Card */}
            <Card className="w-full max-w-md glass border-white/10 z-10">
                <CardHeader className="space-y-3 text-center">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center neon-glow">
                            <Sparkles className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold gradient-text">Welcome Back!</CardTitle>
                    <CardDescription>
                        Sign in to continue your learning journey ✨
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                            <Input
                                id="username"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="glass border-white/10 focus:border-purple-500/50 h-12"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="glass border-white/10 focus:border-purple-500/50 h-12"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg font-semibold neon-glow"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Zap className="h-5 w-5" />
                                    Sign In
                                </span>
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col items-center gap-4 pt-0">
                    <p className="text-sm text-muted-foreground text-center">
                        Contact your mentor if you forgot your credentials 💜
                    </p>
                </CardFooter>
            </Card>

            {/* Demo Hint */}
            <div className="mt-6 glass rounded-lg px-4 py-2 text-sm text-muted-foreground z-10">
                <span className="text-purple-400 font-semibold">Demo:</span> admin / adminpassword
            </div>
        </div>
    );
}
