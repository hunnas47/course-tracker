'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trophy, Zap, ArrowRight, Users, Star, Crown, Scroll } from 'lucide-react';
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
    <div className="min-h-screen bg-background overflow-hidden selection:bg-primary selection:text-primary-foreground">

      {/* Header */}
      <header className="relative z-10 px-8 py-6 flex items-center justify-between border-b border-white/5 backdrop-blur-sm bg-background/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded border border-primary/20">
            <Scroll className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">IHYA</h1>
        </div>
        <Link href="/login">
          <Button variant="outline" className="btn-outline rounded-none px-6 h-10 text-xs border-primary/50 text-primary hover:text-primary-foreground hover:bg-primary hover:border-primary">
            Student Portal
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4 pt-20 pb-24">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Main Heading */}
          <div className="space-y-4 animate-fade-in">
            <div className="inline-block px-3 py-1 mb-4 border border-primary/30 rounded-full bg-primary/5">
              <span className="text-xs font-bold text-primary tracking-[0.2em] uppercase">The Knowledge Sanctuary</span>
            </div>

            <h2 className="text-5xl sm:text-7xl font-serif font-bold tracking-tight text-white leading-[1.1]">
              Elevate Your <br />
              <span className="text-gold-gradient">Spirit & Intellect</span>
            </h2>
          </div>

          {/* Subheading */}
          <p className="text-lg text-muted-foreground max-w-xl mx-auto font-light leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            A disciplined path to mastering Aqeedha, Tafseer, and Self Development.
            Track your progress through the ranks of knowledge.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/login">
              <Button size="lg" className="btn-primary rounded-sm h-14 px-10 text-sm">
                Begin The Path
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Stats - Monolith Style */}
          <div className="grid grid-cols-3 gap-px bg-white/5 max-w-2xl mx-auto mt-16 border border-white/10 rounded-sm overflow-hidden animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="bg-card p-6 hover:bg-white/5 transition-colors">
              <div className="text-3xl font-serif font-bold text-white mb-1">3</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Sciences</div>
            </div>
            <div className="bg-card p-6 hover:bg-white/5 transition-colors">
              <div className="text-3xl font-serif font-bold text-white mb-1">25+</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Lessons</div>
            </div>
            <div className="bg-card p-6 hover:bg-white/5 transition-colors">
              <div className="text-3xl font-serif font-bold text-white mb-1">∞</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Reward</div>
            </div>
          </div>
        </div>

        {/* Leaderboard Section - The Stone Tablet */}
        <section className="mt-24 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-10">
            <Trophy className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-serif font-bold text-white tracking-wide">Elite Scholars</h3>
          </div>

          <div className="space-y-1">
            {loading ? (
              <SkeletonLeaderboard count={5} />
            ) : leaderboard.length === 0 ? (
              <div className="monolith-card p-12 text-center space-y-4">
                <div className="text-4xl opacity-20">🏆</div>
                <p className="text-lg font-serif text-white">The tablet is empty.</p>
                <p className="text-sm text-muted-foreground">Be the first to inscribe your name.</p>
              </div>
            ) : (
              leaderboard.map((entry, index) => (
                <div
                  key={entry.rank}
                  className={`relative flex items-center gap-6 p-5 transition-all
                    ${index === 0 ? 'bg-primary/10 border border-primary/40 z-10' : 'bg-card border border-white/5 hover:border-white/10'}
                  `}
                >
                  <div className={`w-12 h-12 flex items-center justify-center font-bold text-lg font-serif border
                    ${index === 0
                      ? 'bg-primary text-black border-primary'
                      : 'bg-transparent text-muted-foreground border-white/10'
                    }`}>
                    {index === 0 ? <Crown className="h-5 w-5" /> : `#${entry.rank}`}
                  </div>

                  <div className="flex-1">
                    <div className={`font-bold text-base tracking-wide ${index === 0 ? 'text-white' : 'text-zinc-300'}`}>
                      {entry.username}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1 font-mono uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        LEVEL {entry.level}
                      </span>
                      <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                      <span className="flex items-center gap-1 text-primary/80">
                        {entry.xp} XP
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-serif font-bold text-white">{entry.percentage}%</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Mastery</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {leaderboard.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-white uppercase text-xs tracking-[0.2em] hover:bg-transparent">
                  View Full Roster
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </Link>
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center border-t border-white/5 bg-black/20">
        <div className="text-xs text-muted-foreground font-mono tracking-wider">
          <p className="mb-2">EST. 2026 • MSM VALAVANNUR</p>
          <div className="flex justify-center gap-4 opacity-50">
            <span>BUILT WITH PRECISION</span>
            <span>•</span>
            <span>HONOR THE CRAFT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

