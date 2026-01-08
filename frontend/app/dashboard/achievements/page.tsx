'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Shield, Lock, Medal, Star, Target, Crown } from 'lucide-react';

interface Achievement {
    id: string;
    icon: string;
    name: string;
    desc: string;
    unlocked: boolean;
    unlockedAt?: string;
}

interface UserStats {
    xp: number;
    level: number;
    tier: string;
    achievements: Achievement[];
}

export default function AchievementsPage() {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/progress/stats');
                setStats(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const tiers = [
        { name: 'BRONZE', min: 0, max: 499, color: 'text-orange-400', border: 'border-orange-400/20', bg: 'bg-orange-400/5' },
        { name: 'SILVER', min: 500, max: 999, color: 'text-zinc-400', border: 'border-zinc-400/20', bg: 'bg-zinc-400/5' },
        { name: 'GOLD', min: 1000, max: 2499, color: 'text-yellow-400', border: 'border-yellow-400/20', bg: 'bg-yellow-400/5' },
        { name: 'PLATINUM', min: 2500, max: 4999, color: 'text-cyan-400', border: 'border-cyan-400/20', bg: 'bg-cyan-400/5' },
        { name: 'DIAMOND', min: 5000, max: null, color: 'text-purple-400', border: 'border-purple-400/20', bg: 'bg-purple-400/5' },
    ];

    if (loading) {
        return (
            <div className="container mx-auto px-4 pt-8 max-w-6xl space-y-8">
                <Skeleton className="h-48 w-full bg-muted rounded-sm" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-64 bg-muted rounded-sm" />
                    <Skeleton className="h-64 bg-muted rounded-sm" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-12 pt-8">
            <div className="container mx-auto px-4 max-w-6xl space-y-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-white mb-2">Hall of Honors</h1>
                        <p className="text-muted-foreground">Track your journey through the ranks and milestones of knowledge.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-card border border-white/10 px-6 py-3 rounded-sm">
                        <div className="text-right">
                            <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Current Rank</div>
                            <div className={`text-xl font-bold ${tiers.find(t => t.name === stats?.tier)?.color || 'text-white'}`}>
                                {stats?.tier} LEAGUE
                            </div>
                        </div>
                        <Trophy className={`h-8 w-8 ${tiers.find(t => t.name === stats?.tier)?.color || 'text-white'}`} />
                    </div>
                </div>

                {/* Achievement Grid */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Medal className="h-6 w-6 text-primary" />
                        <h2 className="text-xl font-serif font-bold text-white">Achievements</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats?.achievements.map((ach) => (
                            <div
                                key={ach.id}
                                className={`monolith-card p-4 flex items-start gap-4 transition-all duration-300 ${ach.unlocked ? 'opacity-100' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
                            >
                                <div className={`w-12 h-12 rounded-sm flex items-center justify-center text-2xl bg-black/20 border border-white/5`}>
                                    {ach.unlocked ? ach.icon : <Lock className="h-5 w-5 opacity-50" />}
                                </div>
                                <div>
                                    <h3 className={`font-bold mb-1 ${ach.unlocked ? 'text-primary' : 'text-white'}`}>{ach.name}</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{ach.desc}</p>
                                    {ach.unlocked && <span className="text-[10px] text-green-500 mt-2 block uppercase tracking-widest font-bold">Unlocked</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Leagues Breakdown */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Crown className="h-6 w-6 text-yellow-500" />
                        <h2 className="text-xl font-serif font-bold text-white">League Progression</h2>
                    </div>

                    <div className="grid gap-4">
                        {tiers.map((tier) => {
                            const isCurrent = stats?.tier === tier.name;
                            const isPast = (stats?.xp || 0) >= tier.min;

                            return (
                                <div
                                    key={tier.name}
                                    className={`relative p-6 rounded-sm border transition-all ${isCurrent ? `${tier.bg} ${tier.border}` : 'bg-card/30 border-white/5'} ${isPast && !isCurrent ? 'opacity-70' : ''}`}
                                >
                                    {isCurrent && (
                                        <div className="absolute top-4 right-4 px-3 py-1 bg-black/40 rounded-full border border-white/10 text-xs font-bold text-white flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            CURRENT
                                        </div>
                                    )}

                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${tier.color} border-current bg-black/20`}>
                                            <Shield className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className={`text-lg font-bold ${tier.color} mb-1`}>{tier.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                <span className="text-white font-mono">{tier.min} XP</span>
                                                {tier.max ? ` - ${tier.max} XP` : '+'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

            </div>
        </div>
    );
}
