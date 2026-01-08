import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
    constructor(private prisma: PrismaService) { }

    // Mark class as watched
    async markClassWatched(userId: string, classId: string, isWatched: boolean = true) {
        return this.prisma.progress.upsert({
            where: { userId_classId: { userId, classId } },
            update: { isWatched, watchedAt: isWatched ? new Date() : null },
            create: { userId, classId, isWatched, watchedAt: isWatched ? new Date() : null },
        });
    }

    // Get all progress for a user
    async getUserProgress(userId: string) {
        return this.prisma.progress.findMany({
            where: { userId },
            include: { class: { include: { subject: true } } },
        });
    }

    // Get progress for a specific subject
    async getSubjectProgress(userId: string, subjectId: string) {
        const totalClasses = await this.prisma.class.count({ where: { subjectId } });
        const watchedClasses = await this.prisma.progress.count({
            where: { userId, class: { subjectId }, isWatched: true },
        });
        return {
            subjectId,
            totalClasses,
            watchedClasses,
            percentage: totalClasses > 0 ? Math.round((watchedClasses / totalClasses) * 100) : 0,
        };
    }

    // Get all subjects with progress
    async getAllSubjectsProgress(userId: string) {
        const subjects = await this.prisma.subject.findMany({
            include: { classes: { orderBy: { date: 'asc' } } }
        });
        const progressPromises = subjects.map(async (subject) => {
            const progress = await this.getSubjectProgress(userId, subject.id);
            return { ...subject, ...progress };
        });
        return Promise.all(progressPromises);
    }

    // Calculate user's streak based on consecutive days of activity
    async calculateStreak(userId: string): Promise<number> {
        const progress = await this.prisma.progress.findMany({
            where: { userId, isWatched: true },
            select: { watchedAt: true },
            orderBy: { watchedAt: 'desc' },
        });

        if (progress.length === 0) return 0;

        // Get unique dates (days only)
        const uniqueDates = [...new Set(
            progress
                .filter(p => p.watchedAt)
                .map(p => {
                    const d = new Date(p.watchedAt!);
                    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                })
        )].sort().reverse();

        if (uniqueDates.length === 0) return 0;

        const today = new Date();
        const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;

        // Check if streak includes today or yesterday
        if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
            return 0; // Streak broken
        }

        let streak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
            const prevDate = new Date(uniqueDates[i - 1].replace(/-/g, '/'));
            const currDate = new Date(uniqueDates[i].replace(/-/g, '/'));
            const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    // Calculate XP from watched classes
    async calculateXP(userId: string): Promise<number> {
        const watchedCount = await this.prisma.progress.count({
            where: { userId, isWatched: true }
        });
        return watchedCount * 25; // 25 XP per class
    }

    // Get leaderboard (all students ranked by XP)
    async getLeaderboard() {
        const students = await this.prisma.user.findMany({
            where: { role: 'STUDENT' },
            select: { id: true, username: true, mentorName: true },
        });

        const leaderboardPromises = students.map(async (student) => {
            const xp = await this.calculateXP(student.id);
            const totalWatched = await this.prisma.progress.count({
                where: { userId: student.id, isWatched: true }
            });
            const totalClasses = await this.prisma.class.count();
            const percentage = totalClasses > 0 ? Math.round((totalWatched / totalClasses) * 100) : 0;

            return {
                id: student.id,
                username: student.username,
                mentorName: student.mentorName,
                xp,
                level: Math.floor(xp / 100) + 1,
                percentage,
            };
        });

        const leaderboard = await Promise.all(leaderboardPromises);
        return leaderboard.sort((a, b) => b.xp - a.xp).map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }));
    }

    // Get user stats (XP, streak, rank, achievements)
    async getUserStats(userId: string) {
        const xp = await this.calculateXP(userId);
        const streak = await this.calculateStreak(userId);
        const leaderboard = await this.getLeaderboard();
        const userRank = leaderboard.find(e => e.id === userId)?.rank || leaderboard.length + 1;

        const watchedCount = await this.prisma.progress.count({
            where: { userId, isWatched: true }
        });
        const totalClasses = await this.prisma.class.count();

        // Calculate achievements
        const achievements = [
            { id: 'first_steps', icon: '🎯', name: 'First Steps', desc: 'Joined IHYA', unlocked: true },
            { id: 'on_fire', icon: '🔥', name: 'On Fire', desc: '5 day streak', unlocked: streak >= 5 },
            { id: 'bookworm', icon: '📚', name: 'Bookworm', desc: 'Watch 10 classes', unlocked: watchedCount >= 10 },
            { id: 'champion', icon: '🏆', name: 'Champion', desc: 'Complete all courses', unlocked: watchedCount >= totalClasses && totalClasses > 0 },
            { id: 'dedicated', icon: '💪', name: 'Dedicated', desc: '7 day streak', unlocked: streak >= 7 },
            { id: 'top_3', icon: '🥇', name: 'Top 3', desc: 'Reach top 3 on leaderboard', unlocked: userRank <= 3 },
        ];

        return {
            xp,
            level: Math.floor(xp / 100) + 1,
            xpForNextLevel: 100 - (xp % 100),
            streak,
            rank: userRank,
            totalStudents: leaderboard.length,
            watchedCount,
            totalClasses,
            percentage: totalClasses > 0 ? Math.round((watchedCount / totalClasses) * 100) : 0,
            achievements,
        };
    }

    // Get analytics for admin dashboard
    async getAnalytics() {
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Daily activity for last 7 days
        const recentProgress = await this.prisma.progress.findMany({
            where: {
                isWatched: true,
                watchedAt: { gte: sevenDaysAgo }
            },
            select: { watchedAt: true }
        });

        const dailyActivity: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            dailyActivity[dateStr] = 0;
        }

        recentProgress.forEach(p => {
            if (p.watchedAt) {
                const dateStr = p.watchedAt.toISOString().split('T')[0];
                if (dailyActivity[dateStr] !== undefined) {
                    dailyActivity[dateStr]++;
                }
            }
        });

        // Completion rates by subject
        const subjects = await this.prisma.subject.findMany({
            include: { classes: true }
        });

        const totalStudents = await this.prisma.user.count({ where: { role: 'STUDENT' } });

        const subjectCompletionPromises = subjects.map(async (subject) => {
            const totalPossible = subject.classes.length * totalStudents;
            const totalWatched = await this.prisma.progress.count({
                where: {
                    isWatched: true,
                    class: { subjectId: subject.id }
                }
            });
            return {
                name: subject.name.replace('_', ' '),
                completionRate: totalPossible > 0 ? Math.round((totalWatched / totalPossible) * 100) : 0,
                totalClasses: subject.classes.length,
                totalWatched
            };
        });

        const subjectCompletion = await Promise.all(subjectCompletionPromises);

        // Top performers (top 5 by XP)
        const leaderboard = await this.getLeaderboard();
        const topPerformers = leaderboard.slice(0, 5);

        // Overall stats
        const totalClasses = await this.prisma.class.count();
        const totalWatchedAll = await this.prisma.progress.count({ where: { isWatched: true } });
        const avgCompletionRate = totalStudents > 0 && totalClasses > 0
            ? Math.round((totalWatchedAll / (totalStudents * totalClasses)) * 100)
            : 0;

        // Active students today
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const activeToday = await this.prisma.progress.findMany({
            where: {
                isWatched: true,
                watchedAt: { gte: todayStart }
            },
            select: { userId: true },
            distinct: ['userId']
        });

        return {
            dailyActivity: Object.entries(dailyActivity).map(([date, count]) => ({
                date,
                classesWatched: count
            })),
            subjectCompletion,
            topPerformers,
            overview: {
                totalStudents,
                totalClasses,
                avgCompletionRate,
                activeToday: activeToday.length
            }
        };
    }
}
