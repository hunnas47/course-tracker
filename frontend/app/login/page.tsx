'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, KeyRound, Lock, User, ArrowRight } from 'lucide-react';

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
            setError(err.response?.data?.message || 'Authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative">

            {/* Back Button */}
            <Link href="/" className="absolute top-4 left-4 md:top-8 md:left-8 z-10 text-white">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-white uppercase text-xs tracking-widest hover:bg-transparent">
                    <ArrowLeft className="h-4 w-4" />
                    Return
                </Button>
            </Link>

            {/* Login Card */}
            <Card className="w-full max-w-sm monolith-card border-white/5 bg-card/50">
                <CardHeader className="space-y-4 text-center pb-8 border-b border-white/5">
                    <div className="flex justify-center mb-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                            <KeyRound className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-serif font-bold text-white tracking-wide">Identity Verification</CardTitle>
                        <CardDescription className="text-xs uppercase tracking-widest text-muted-foreground">
                            Access the Sanctuary
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="pt-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Username</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="username"
                                    placeholder="SCHOLAR_ID"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="bg-background border-white/5 pl-10 h-10 focus:border-primary/50 transition-colors font-mono text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-background border-white/5 pl-10 h-10 focus:border-primary/50 transition-colors font-mono text-sm"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-900/10 border border-red-900/20 p-3 rounded-sm">
                                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 btn-primary rounded-sm text-xs mt-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                                    Authenticating...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Enter
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col items-center gap-4 pt-4 pb-6 border-t border-white/5 bg-black/20">
                    <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest">
                        Protected System • Authorized Access Only
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}

