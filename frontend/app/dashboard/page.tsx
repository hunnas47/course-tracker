'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton, SkeletonCourseCard, SkeletonListItem } from '@/components/ui/skeleton';
import {
    BookOpen, Flame, Zap, Trophy, Star, Sparkles,
    Target, ChevronRight, TrendingUp, Users
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
            <div className="space-y-8 pb-8">
                {/* Header Skeleton */}
                <div className="glass rounded-3xl p-6 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-3">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-20 h-20 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                    </div>
                    <div className="glass rounded-2xl p-4 space-y-3">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>

                {/* Daily Goals Skeleton */}
                <div className="glass rounded-2xl p-6">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} className="h-14 rounded-xl" />
                        ))}
                    </div>
                </div>

                {/* Leaderboard Skeleton */}
                <div className="glass rounded-2xl p-6">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <SkeletonListItem key={i} />
                        ))}
                    </div>
                </div>

                {/* Courses Skeleton */}
                <div className="space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <div className="grid gap-6 md:grid-cols-3">
                        {[1, 2, 3].map(i => (
                            <SkeletonCourseCard key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const subjectIcons: Record<string, string> = {
        AQEEDHA: '🕌',
        SELF_DEVELOPMENT: '🌟',
        TAFSEER: '📖',
    };

    const subjectColors: Record<string, string> = {
        AQEEDHA: 'from-purple-500 to-indigo-600',
        SELF_DEVELOPMENT: 'from-pink-500 to-rose-600',
        TAFSEER: 'from-cyan-500 to-blue-600',
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Header with XP and Level */}
            <div className="glass rounded-3xl p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    {/* Welcome Section */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold">
                                Welcome back, <span className="gradient-text">{username}</span>!
                            </h1>
                            <span className="animate-float">👋</span>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Flame className="h-5 w-5 streak-fire" />
                                <span className="font-semibold">{stats?.streak || 0} day streak!</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Trophy className="h-5 w-5 text-yellow-400" />
                                <span>Rank #{stats?.rank || '-'} of {stats?.totalStudents || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Level Badge */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center neon-glow">
                                <span className="text-2xl font-black text-white">{stats?.level || 1}</span>
                            </div>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-0.5 rounded-full text-xs font-bold">
                                LEVEL
                            </div>
                        </div>
                        <div className="space-y-2 w-40">
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-1">
                                    <Zap className="h-4 w-4 text-yellow-400" />
                                    {stats?.xp || 0} XP
                                </span>
                                <span className="text-muted-foreground">{stats?.xpForNextLevel || 100} to next</span>
                            </div>
                            <div className="h-3 rounded-full overflow-hidden bg-muted">
                                <div
                                    className="h-full xp-gradient transition-all duration-500"
                                    style={{ width: `${100 - (stats?.xpForNextLevel || 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Overall Progress */}
                <div className="glass rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-purple-400" />
                            <span className="font-semibold">Overall Progress</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold gradient-text">{stats?.percentage || 0}%</span>
                            <TrendingUp className="h-5 w-5 text-green-400" />
                        </div>
                    </div>
                    <Progress value={stats?.percentage || 0} className="h-4" />
                    <div className="text-sm text-muted-foreground text-center">
                        {stats?.watchedCount || 0} of {stats?.totalClasses || 0} classes completed
                    </div>
                </div>
            </div>

            {/* Daily Goals */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <h2 className="text-lg font-bold">Today&apos;s Goals</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                            ✅
                        </div>
                        <span className="text-sm">Login daily (1/1)</span>
                    </div>
                    <div className={`flex items-center gap-3 p-3 rounded-xl ${(stats?.watchedCount || 0) >= 2
                        ? 'bg-green-500/10 border border-green-500/20'
                        : 'bg-purple-500/10 border border-purple-500/20'
                        }`}>
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            📚
                        </div>
                        <span className="text-sm">Watch 2 classes ({Math.min(stats?.watchedCount || 0, 2)}/2)</span>
                    </div>
                    <div className={`flex items-center gap-3 p-3 rounded-xl ${subjects.some(s => s.percentage === 100)
                        ? 'bg-green-500/10 border border-green-500/20'
                        : 'bg-pink-500/10 border border-pink-500/20'
                        }`}>
                        <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">
                            🏆
                        </div>
                        <span className="text-sm">Complete a course ({subjects.filter(s => s.percentage === 100).length}/1)</span>
                    </div>
                </div>
            </div>

            {/* Leaderboard */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-yellow-400" />
                        <h2 className="text-lg font-bold">Leaderboard</h2>
                    </div>
                </div>
                <div className="space-y-3">
                    {leaderboard.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">No students on leaderboard yet</p>
                    ) : (
                        leaderboard.map((entry) => (
                            <div
                                key={entry.id}
                                className={`glass rounded-xl p-3 flex items-center gap-4 ${entry.username === username ? 'neon-glow border-purple-500/30' : ''
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${entry.rank === 1 ? 'bg-yellow-400 text-black' :
                                    entry.rank === 2 ? 'bg-gray-300 text-black' :
                                        entry.rank === 3 ? 'bg-orange-400 text-black' :
                                            'bg-muted text-foreground'
                                    }`}>
                                    #{entry.rank}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold">{entry.username}</div>
                                    <div className="text-xs text-muted-foreground">
                                        Level {entry.level} • {entry.xp} XP
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-purple-400">{entry.percentage}%</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Courses Grid */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-400" />
                    <h2 className="text-xl font-bold">Your Courses</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {subjects.map((subject) => (
                        <Card
                            key={subject.id}
                            className="glass overflow-hidden hover:scale-[1.02] transition-all duration-300 group cursor-pointer"
                        >
                            {/* Gradient Header */}
                            <div className={`h-24 bg-gradient-to-br ${subjectColors[subject.name] || 'from-purple-500 to-pink-500'} flex items-center justify-center relative`}>
                                <span className="text-5xl">{subjectIcons[subject.name] || '📚'}</span>
                                <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold">
                                    {subject.watchedClasses}/{subject.totalClasses} classes
                                </div>
                            </div>

                            <CardContent className="p-5 space-y-4">
                                <div>
                                    <h3 className="font-bold text-lg">{subject.name.replace('_', ' ')}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        +25 XP per class completed
                                    </p>
                                </div>

                                {/* Progress */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-semibold text-purple-400">{subject.percentage}%</span>
                                    </div>
                                    <div className="h-2 rounded-full overflow-hidden bg-muted">
                                        <div
                                            className={`h-full bg-gradient-to-r ${subjectColors[subject.name] || 'from-purple-500 to-pink-500'} transition-all duration-500`}
                                            style={{ width: `${subject.percentage}%` }}
                                        />
                                    </div>
                                </div>

                                <Link href={`/dashboard/course/${subject.id}`}>
                                    <Button className="w-full group-hover:neon-glow transition-all">
                                        Continue Learning
                                        <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Achievements */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-400" />
                        <h2 className="text-lg font-bold">Achievements</h2>
                    </div>
                    <span className="text-sm text-muted-foreground">
                        {stats?.achievements.filter(a => a.unlocked).length || 0}/{stats?.achievements.length || 0} unlocked
                    </span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {(stats?.achievements || []).map((achievement) => (
                        <div
                            key={achievement.id}
                            className={`flex-shrink-0 w-32 p-4 rounded-xl text-center space-y-2 transition-all ${achievement.unlocked
                                ? 'glass neon-glow'
                                : 'bg-muted/50 opacity-50'
                                }`}
                        >
                            <div className="text-3xl">{achievement.unlocked ? achievement.icon : '🔒'}</div>
                            <div className="text-sm font-semibold">{achievement.name}</div>
                            <div className="text-xs text-muted-foreground">{achievement.desc}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
