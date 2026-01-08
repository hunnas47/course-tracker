'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton, SkeletonCourseCard, SkeletonListItem } from '@/components/ui/skeleton';
import {
    BookOpen, Flame, Zap, Trophy, Star, Sparkles,
    Target, ChevronRight, TrendingUp, Users, Scroll
} from 'lucide-react';

interface SubjectProgress {
    id: string;
    name: string;
    totalClasses: number;
    watchedClasses: number;
    percentage: number;
    classes?: any[];
}

interface UserStats {
    xp: number;
    level: number;
    xpForNextLevel: number;
    streak: number;
    rank: number;
    totalStudents: number;
    watchedCount: number;
    totalClasses: number;
    percentage: number;
    achievements: Array<{
        id: string;
        icon: string;
        name: string;
        desc: string;
        unlocked: boolean;
    }>;
}

interface LeaderboardEntry {
    id: string;
    username: string;
    xp: number;
    level: number;
    percentage: number;
    rank: number;
}

export default function StudentDashboard() {
    const [subjects, setSubjects] = useState<SubjectProgress[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [username, setUsername] = useState('Student');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get username from token
                const token = localStorage.getItem('token');
                if (token) {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setUsername(payload.username);
                }

                // Fetch all data in parallel
                const [subjectsRes, statsRes, leaderboardRes] = await Promise.all([
                    api.get('/progress/subjects'),
                    api.get('/progress/stats'),
                    api.get('/progress/leaderboard'),
                ]);

                setSubjects(subjectsRes.data);
                setStats(statsRes.data);
                setLeaderboard(leaderboardRes.data.slice(0, 5)); // Top 5

            } catch (err) {
                console.error('Failed to fetch data:', err);
                // Set defaults on error
                setStats({
                    xp: 0, level: 1, xpForNextLevel: 100, streak: 0,
                    rank: 1, totalStudents: 1, watchedCount: 0, totalClasses: 0,
                    percentage: 0, achievements: []
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8 pb-8 container mx-auto px-4 pt-8 max-w-6xl">
                {/* Header Skeleton */}
                <div className="bg-card border border-white/5 rounded-sm p-6 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-3">
                            <Skeleton className="h-8 w-64 bg-muted" />
                            <Skeleton className="h-4 w-48 bg-muted" />
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-16 h-16 rounded-full bg-muted" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Skeleton className="h-64 md:col-span-3 bg-muted rounded-sm" />
                    <Skeleton className="h-64 bg-muted rounded-sm" />
                </div>
            </div>
        );
    }

    const subjectImages: Record<string, string> = {
        AQEEDHA: '/aqeedha.webp',
        SELF_DEVELOPMENT: '/self_dev.webp',
        TAFSEER: '/tafseer.webp',
    };

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Top Bar / HUD */}
            <div className="border-b border-white/5 bg-card/30 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 flex items-center justify-center rounded border border-primary/20">
                            <Scroll className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-serif font-bold tracking-wide hidden sm:block">IHYA SYSTEM</span>
                    </div>

                    <div className="flex items-center gap-6 text-sm font-mono">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Flame className="h-4 w-4 text-orange-600" />
                            <span className="text-foreground font-bold">{stats?.streak || 0}</span>
                        </div>
                        <div className="h-4 w-px bg-white/10"></div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="text-foreground font-bold">{stats?.xp || 0} XP</span>
                        </div>
                        <div className="h-4 w-px bg-white/10"></div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary text-black font-bold flex items-center justify-center text-xs rounded-sm">
                                {stats?.level || 1}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pt-8 space-y-8 max-w-6xl">

                {/* Welcome & Daily Goals Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Welcome Card - 2 Cols */}
                    <div className="md:col-span-2 monolith-card p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/10 transition-colors"></div>

                        <div className="relative z-10">
                            <h1 className="text-3xl font-serif font-bold text-white mb-2">
                                Salaam, <span className="text-primary">{username}</span>.
                            </h1>
                            <p className="text-muted-foreground max-w-md mb-6">
                                Your pursuit of knowledge continues. You are <span className="text-white font-bold">{stats?.xpForNextLevel} XP</span> away from the next rank.
                            </p>

                            <div className="space-y-4">
                                <div className="flex justify-between text-xs uppercase tracking-widest text-muted-foreground font-bold">
                                    <span>Current Rank Progress</span>
                                    <span>{stats?.percentage || 0}%</span>
                                </div>
                                <Progress value={stats?.percentage || 0} className="h-1 bg-white/10" />
                            </div>
                        </div>
                    </div>

                    {/* Daily Goals - 1 Col */}
                    <div className="monolith-card p-6 bg-card/50">
                        <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                            <Star className="h-4 w-4 text-primary" />
                            <h2 className="text-sm font-bold uppercase tracking-widest text-white">Daily Mandates</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-[10px] border border-green-500/30">✓</div>
                                <span className="text-muted-foreground line-through decoration-white/30">Login to system</span>
                            </div>

                            <div className={`flex items-center gap-3 text-sm ${(stats?.watchedCount || 0) >= 2 ? 'opacity-50' : ''}`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border 
                                    ${(stats?.watchedCount || 0) >= 2
                                        ? 'bg-green-500/20 text-green-500 border-green-500/30'
                                        : 'bg-transparent text-muted-foreground border-white/10'}`}>
                                    {(stats?.watchedCount || 0) >= 2 ? '✓' : ''}
                                </div>
                                <span className={(stats?.watchedCount || 0) >= 2 ? 'text-muted-foreground line-through' : 'text-white'}>
                                    Complete 2 Classes
                                </span>
                            </div>

                            <div className={`flex items-center gap-3 text-sm ${subjects.some(s => s.percentage === 100) ? 'opacity-50' : ''}`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border 
                                    ${subjects.some(s => s.percentage === 100)
                                        ? 'bg-green-500/20 text-green-500 border-green-500/30'
                                        : 'bg-transparent text-muted-foreground border-white/10'}`}>
                                    {subjects.some(s => s.percentage === 100) ? '✓' : ''}
                                </div>
                                <span className={subjects.some(s => s.percentage === 100) ? 'text-muted-foreground line-through' : 'text-white'}>
                                    Master a Subject
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Courses Grid */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-serif font-bold text-white">Active Curriculum</h2>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {subjects.map((subject) => (
                            <Link href={`/dashboard/course/${subject.id}`} key={subject.id}>
                                <div className="group relative h-80 bg-card border border-white/5 hover:border-primary/50 transition-all duration-300 overflow-hidden cursor-pointer shadow-2xl">
                                    {/* Image Background with Overlay */}
                                    <div className="absolute inset-0">
                                        <Image
                                            src={subjectImages[subject.name] || '/aqeedha.png'}
                                            alt={subject.name.replace('_', ' ')}
                                            fill
                                            className="object-cover opacity-40 group-hover:opacity-20 group-hover:scale-105 transition-all duration-700 grayscale group-hover:grayscale-0"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                                    </div>

                                    {/* Content */}
                                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                        <div className="space-y-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <div>
                                                <div className="text-[10px] uppercase tracking-widest text-primary mb-1 font-bold">Subject Module</div>
                                                <h3 className="font-serif font-bold text-2xl text-white leading-tight">
                                                    {subject.name.replace('_', ' ')}
                                                </h3>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>{subject.watchedClasses}/{subject.totalClasses} Completed</span>
                                                    <span>{subject.percentage}%</span>
                                                </div>
                                                <div className="h-[2px] w-full bg-white/10">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-500"
                                                        style={{ width: `${subject.percentage}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 flex items-center text-xs text-primary font-bold uppercase tracking-widest">
                                                Continue <ChevronRight className="ml-1 h-3 w-3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Leaderboard */}
                    <div className="md:col-span-2 monolith-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-serif font-bold text-white">Top Scholars</h2>
                            </div>
                        </div>
                        <div className="space-y-1">
                            {leaderboard.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">No data available</p>
                            ) : (
                                leaderboard.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className={`flex items-center gap-4 p-3 rounded-sm transition-colors
                                            ${entry.username === username ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-white/5'}
                                        `}
                                    >
                                        <div className={`w-8 h-8 flex items-center justify-center font-bold text-sm bg-card border border-white/10
                                            ${entry.rank <= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                                            #{entry.rank}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`font-bold text-sm ${entry.username === username ? 'text-primary' : 'text-white'}`}>
                                                {entry.username}
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-4">
                                            <div className="text-xs text-muted-foreground text-right hidden sm:block">
                                                LVL {entry.level}
                                            </div>
                                            <div className="text-sm font-bold font-mono text-zinc-400">{entry.percentage}%</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="monolith-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                <h2 className="text-lg font-serif font-bold text-white">Honors</h2>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {stats?.achievements.filter(a => a.unlocked).length || 0} Acquired
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {(stats?.achievements || []).map((achievement) => (
                                <div
                                    key={achievement.id}
                                    className={`p-3 border rounded-sm flex flex-col items-center text-center gap-2 transition-all
                                        ${achievement.unlocked
                                            ? 'bg-primary/5 border-primary/20 text-white'
                                            : 'bg-transparent border-white/5 opacity-40 grayscale'
                                        }`}
                                >
                                    <div className="text-xl">{achievement.unlocked ? achievement.icon : '🔒'}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider">{achievement.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
