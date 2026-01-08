'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ArrowLeft, Calendar, Video, CheckCircle2, Circle,
    Zap, Trophy, Sparkles, Lock
} from 'lucide-react';

interface ClassItem {
    id: string;
    title: string;
    date: string;
    isWatched: boolean;
}

interface Subject {
    id: string;
    name: string;
    classes: Array<{
        id: string;
        title: string;
        date: string;
    }>;
}

export default function CoursePage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params; // This is now the subject ID
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [courseName, setCourseName] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    const subjectEmojis: Record<string, string> = {
        AQEEDHA: '🕌',
        SELF_DEVELOPMENT: '🌟',
        TAFSEER: '📖',
    };

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                // Get subjects with classes
                const subjectsRes = await api.get('/progress/subjects');
                const subject = subjectsRes.data.find((s: Subject) => s.id === id);

                if (subject) {
                    setCourseName(subject.name);

                    // Get user's progress
                    const progressRes = await api.get('/progress/my-progress');
                    const progressMap = new Map(
                        progressRes.data.map((p: any) => [p.classId, p.isWatched])
                    );

                    // Map classes with watched status
                    const classesWithProgress = subject.classes.map((c: any) => ({
                        id: c.id,
                        title: c.title,
                        date: new Date(c.date).toLocaleDateString(),
                        isWatched: progressMap.get(c.id) || false,
                    }));

                    setClasses(classesWithProgress);
                } else {
                    // If subject not found (might be using old URL format)
                    router.push('/dashboard');
                }
            } catch (err) {
                console.error('Failed to fetch classes:', err);
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, [id, router]);

    const toggleWatched = async (classId: string, currentStatus: boolean) => {
        setUpdating(classId);
        try {
            await api.post('/progress', { classId, isWatched: !currentStatus });
            setClasses(classes.map(c =>
                c.id === classId ? { ...c, isWatched: !c.isWatched } : c
            ));
        } catch (err) {
            console.error('Failed to update progress:', err);
        } finally {
            setUpdating(null);
        }
    };

    const completedCount = classes.filter(c => c.isWatched).length;
    const progress = classes.length > 0 ? Math.round((completedCount / classes.length) * 100) : 0;

    if (loading) {
        return (
            <div className="space-y-8 max-w-4xl mx-auto">
                {/* Header Skeleton */}
                <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </div>

                {/* Progress Card Skeleton */}
                <div className="monolith-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-8 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full rounded-sm" />
                </div>

                {/* Classes List Skeleton */}
                <div className="space-y-4">
                    <Skeleton className="h-6 w-28" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="monolith-card p-4">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="w-12 h-12 rounded-sm" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                    <Skeleton className="h-9 w-28 rounded-sm" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push('/dashboard')}
                    className="btn-outline rounded-full w-10 h-10 border-white/10 hover:border-primary/50 text-muted-foreground hover:text-white"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-3">
                    <span className="text-4xl">{subjectEmojis[courseName] || '📚'}</span>
                    <div>
                        <h1 className="text-2xl font-bold gradient-text">
                            {courseName.replace('_', ' ')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {completedCount}/{classes.length} classes completed
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress Card */}
            <div className="monolith-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-white">Course Progress</span>
                    </div>
                    <span className="text-2xl font-serif font-bold text-primary">{progress}%</span>
                </div>
                <div className="h-4 rounded-sm overflow-hidden bg-white/5 border border-white/5">
                    <div
                        className="h-full bg-primary transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                {progress === 100 && (
                    <div className="flex items-center justify-center gap-2 text-primary font-semibold animate-pulse">
                        <Sparkles className="h-5 w-5" />
                        Course Completed! +100 XP Bonus!
                    </div>
                )}
            </div>

            {/* Classes List */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                    <Video className="h-5 w-5 text-primary" />
                    Classes ({classes.length})
                </h2>

                {classes.length === 0 ? (
                    <div className="monolith-card p-8 text-center text-muted-foreground">
                        No classes added yet. Ask your admin to add classes.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {classes.map((c, index) => {
                            // Sequential unlocking - can only mark if previous is done (or first)
                            const isLocked = index > 0 && !classes[index - 1].isWatched;

                            return (
                                <div
                                    key={c.id}
                                    className={`monolith-card p-4 transition-all ${c.isWatched
                                        ? 'border-primary/40 bg-primary/5'
                                        : isLocked
                                            ? 'opacity-50'
                                            : 'hover:border-primary/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Status Icon */}
                                        <div className={`w-12 h-12 rounded-sm flex items-center justify-center border border-white/5 ${c.isWatched
                                            ? 'bg-primary/20 text-primary'
                                            : isLocked
                                                ? 'bg-muted text-muted-foreground'
                                                : 'bg-card text-muted-foreground'
                                            }`}>
                                            {c.isWatched ? (
                                                <CheckCircle2 className="h-6 w-6" />
                                            ) : isLocked ? (
                                                <Lock className="h-5 w-5" />
                                            ) : (
                                                <Circle className="h-6 w-6" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-semibold truncate ${c.isWatched ? 'text-white' : 'text-zinc-300'}`}>{c.title}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1 font-mono uppercase tracking-wider">
                                                <Calendar className="h-3 w-3" />
                                                {c.date}
                                                {c.isWatched && (
                                                    <span className="text-primary flex items-center gap-1 ml-2">
                                                        <Zap className="h-3 w-3" /> +25 XP
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        {!isLocked && (
                                            <Button
                                                variant={c.isWatched ? "outline" : "default"}
                                                size="sm"
                                                onClick={() => toggleWatched(c.id, c.isWatched)}
                                                disabled={updating === c.id}
                                                className={c.isWatched
                                                    ? 'btn-outline border-white/10 text-muted-foreground hover:text-white hover:border-white/30'
                                                    : 'btn-primary'}
                                            >
                                                {updating === c.id ? (
                                                    'Saving...'
                                                ) : c.isWatched ? (
                                                    'Completed'
                                                ) : (
                                                    'Mark Complete'
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Motivation Section */}
            {progress < 100 && classes.length > 0 && (
                <div className="monolith-card p-6 text-center space-y-2">
                    <div className="text-4xl opacity-50">⚡</div>
                    <p className="text-lg font-serif font-bold text-white">Keep climbing</p>
                    <p className="text-sm text-muted-foreground">
                        Complete {classes.length - completedCount} more {classes.length - completedCount === 1 ? 'class' : 'classes'} to finish this course and earn a +100 XP bonus.
                    </p>
                </div>
            )}
        </div>
    );
}
