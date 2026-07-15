import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { FadeIn, StaggerGroup, StaggerItem } from '../../components/ui/motion';
import { mockLeaderboard } from '../../utils/mockData';

import { useAuth } from '../../context/AuthContext';
import { MemberProfileModal } from '../../components/ui/MemberProfileModal';
import { useState } from 'react';

const podiumIcons = [Trophy, Medal, Award];
const podiumColors = ['#F59E0B', '#9CA3AF', '#CD7F32'];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [selectedMemberName, setSelectedMemberName] = useState<string | null>(null);
  
  const leaderboardData = mockLeaderboard.map((p) => {
    if (p.rank === 7 && user) {
      return {
        ...p,
        name: user.name || p.name,
        club: user.club || p.club,
        avatarUrl: user.avatarUrl || p.avatarUrl,
        points: p.points
      };
    }
    return p;
  });

  const top3 = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Leaderboard</h1>
          <p className="mt-1 text-sm text-ink-soft">Top contributors across all clubs this semester.</p>
        </div>
      </FadeIn>

      {/* Podium */}
      <FadeIn delay={0.08}>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 0, 2].map((idx, displayIdx) => {
            const p = top3[idx];
            const Icon = podiumIcons[idx];
            const color = podiumColors[idx];
            return (
              <motion.div
                key={p.rank}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: displayIdx * 0.1, type: 'spring', stiffness: 200 }}
                className={displayIdx === 0 ? 'sm:-mt-4' : ''}
              >
                <div
                  onClick={() => setSelectedMemberName(p.name)}
                  className={`card-surface flex flex-col items-center p-6 text-center cursor-pointer hover:border-navy/20 hover:shadow-lift transition-all ${
                    idx === 0 ? 'shadow-lift ring-2 ring-navy/10' : ''
                  }`}
                >
                  <div className="relative">
                    <Avatar name={p.name} src={p.avatarUrl} size="xl" ring />
                    <span
                      className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-soft"
                      style={{ backgroundColor: color }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-ink">{p.name}</h3>
                  <p className="text-xs text-ink-soft">{p.club}</p>
                  <p className="mt-3 text-2xl font-bold tracking-tight text-navy">{p.points.toLocaleString()}</p>
                  <p className="text-xs text-ink-soft">points</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </FadeIn>

      {/* Rest */}
      <StaggerGroup>
        <Card>
          <div className="divide-y divide-border-soft">
            {rest.map((p, i) => (
              <StaggerItem key={p.rank}>
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setSelectedMemberName(p.name)}
                  className="flex items-center gap-4 py-3.5 cursor-pointer hover:bg-cream-100/40 px-3 rounded-xl transition-all"
                >
                  <span className="w-8 text-center text-sm font-bold text-ink-soft">{p.rank}</span>
                  <Avatar name={p.name} src={p.avatarUrl} size="md" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">{p.name}</p>
                    <p className="text-xs text-ink-soft">{p.club}</p>
                  </div>
                  <div className="hidden items-center gap-1.5 text-xs font-medium text-success sm:flex">
                    <TrendingUp className="h-3.5 w-3.5" /> +{Math.floor(Math.random() * 80 + 20)}
                  </div>
                  <span className="w-20 text-right text-sm font-bold text-navy">{p.points.toLocaleString()}</span>
                </motion.div>
              </StaggerItem>
            ))}
          </div>
        </Card>
      </StaggerGroup>

      <MemberProfileModal
        memberName={selectedMemberName}
        onClose={() => setSelectedMemberName(null)}
      />
    </div>
  );
}
