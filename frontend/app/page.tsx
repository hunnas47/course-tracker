'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trophy, Zap, Sparkles, ArrowRight, Users, Star } from 'lucide-react';
import { SkeletonLeaderboard } from '@/components/ui/skeleton';
import api from '@/lib/api';

interface LeaderboardEntry {
  username: string;
  xp: number;
  level: number;
  percentage: number;
  rank: number;
}

export default function LandingPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/progress/leaderboard');
        setLeaderboard(res.data.slice(0, 5)); // Top 5
      } catch (err) {
        console.log('Leaderboard fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen gradient-bg overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-400" />
          <h1 className="text-2xl font-bold gradient-text">IHYA</h1>
        </div>
        <Link href="/login">
          <Button className="neon-glow rounded-full px-6">
            Login <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4 pt-16 pb-24">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Main Heading */}
          <h2 className="text-5xl sm:text-7xl font-black tracking-tight leading-tight">
            <span className="gradient-text">Level Up</span>
            <br />
            <span className="text-foreground">Your Islamic Knowledge</span>
          </h2>

          {/* Subheading */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track progress, earn XP, unlock achievements, and climb the leaderboard.
            Learning has never been this exciting! 🚀
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/login">
              <Button size="lg" className="neon-glow rounded-full px-10 py-6 text-lg font-bold">
                <Zap className="mr-2 h-5 w-5" />
                Start Your Journey
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 max-w-xl mx-auto">
            <div className="text-center glass rounded-2xl p-4">
              <div className="text-3xl font-bold gradient-text">3</div>
              <div className="text-sm text-muted-foreground">Courses</div>
            </div>
            <div className="text-center glass rounded-2xl p-4">
              <div className="text-3xl font-bold gradient-text">25+</div>
              <div className="text-sm text-muted-foreground">XP/Class</div>
            </div>
            <div className="text-center glass rounded-2xl p-4">
              <div className="text-3xl font-bold gradient-text">∞</div>
              <div className="text-sm text-muted-foreground">Rewards</div>
            </div>
          </div>
        </div>

        {/* Leaderboard Section */}
        <section className="mt-20 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Trophy className="h-7 w-7 text-yellow-400" />
            <h3 className="text-3xl font-bold">Live Leaderboard</h3>
          </div>

          <div className="space-y-4">
            {loading ? (
              <SkeletonLeaderboard count={5} />
            ) : leaderboard.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center space-y-4">
                <div className="text-5xl">🏆</div>
                <p className="text-xl font-semibold">Be the first on the leaderboard!</p>
                <p className="text-muted-foreground">Login and start learning to claim your spot</p>
              </div>
            ) : (
              leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`glass rounded-2xl p-5 flex items-center gap-4 transition-all hover:scale-[1.02] ${entry.rank === 1 ? 'neon-glow border-yellow-400/30' : ''
                    }`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl ${entry.rank === 1
                    ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-black'
                    : entry.rank === 2
                      ? 'bg-gradient-to-br from-gray-200 to-gray-400 text-black'
                      : entry.rank === 3
                        ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-black'
                        : 'bg-muted text-foreground'
                    }`}>
                    {entry.rank === 1 ? '👑' : `#${entry.rank}`}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg">{entry.username}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-purple-400" />
                        Level {entry.level}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        {entry.xp} XP
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold gradient-text">{entry.percentage}%</div>
                    <div className="text-xs text-muted-foreground">Completion</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {leaderboard.length > 0 && (
            <div className="text-center mt-8">
              <Link href="/login">
                <Button variant="outline" size="lg" className="glass rounded-full px-8">
                  <Users className="mr-2 h-5 w-5" />
                  Join the Competition
                </Button>
              </Link>
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-sm text-muted-foreground border-t border-white/5">
        <p>
          © 2026{' '}
          <a
            href="https://linktr.ee/msmvalavannur"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-400 transition-colors"
          >
            MSM Valavannur
          </a>
          {' '}• Built by{' '}
          <a
            href="https://www.instagram.com/hadihunnas/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-400 transition-colors font-medium"
          >
            Hunnas
          </a>
          {' '}with ❤️
        </p>
      </footer>
    </div>
  );
}
