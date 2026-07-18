import { useEffect, useState } from 'react';
import { UserX, UserCheck, AlertCircle } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { Avatar } from '../../components/ui/Avatar';
import { FadeIn } from '../../components/ui/motion';
import { useToast } from '../../context/ToastContext';
import { mockClubMembers } from '../../utils/mockData';
import { MemberProfileModal } from '../../components/ui/MemberProfileModal';
import { Modal } from '../../components/ui/Modal';
import { DEPARTMENTS, YEARS } from '../../utils/constants';
import { Dropdown } from '../../components/ui/Dropdown';
import { api } from '../../services/api';

interface MemberRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  year: string;
  club: string;
  points: number;
  status: string;
  joinedDate: string;
  avatarUrl?: string;
}

export default function MembersPage() {
  const { toast } = useToast();
  const [, setLoading] = useState(false);

  const [members, setMembers] = useState<MemberRecord[]>(() => {
    const saved = localStorage.getItem('campusos_club_members');
    return saved ? JSON.parse(saved) : [];
  });

  const [query, setQuery] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Developer');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [year, setYear] = useState(YEARS[1]); // e.g. 2nd Year
  const [club, setClub] = useState('Developers Club');
  const [points, setPoints] = useState('0');

  const normalizeMembers = (payload: unknown): MemberRecord[] => {
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as { members?: unknown })?.members)
        ? (payload as { members: unknown[] }).members
        : Array.isArray((payload as { data?: unknown })?.data)
          ? (payload as { data: unknown[] }).data
          : [];

    return list.map((member: Record<string, unknown>, index: number) => {
      const fullName = (member.fullName as string | undefined) || (member.name as string | undefined) || [(member.firstName as string | undefined), (member.lastName as string | undefined)].filter(Boolean).join(' ');
      return {
        id: (member.id as string | undefined) || (member._id as string | undefined) || (member.userId as string | undefined) || `member-${index}`,
        name: fullName || 'Unnamed Member',
        email: (member.email as string | undefined) || '',
        role: (member.role as string | undefined) || (member.position as string | undefined) || (member.title as string | undefined) || 'member',
        department: (member.department as string | undefined) || '',
        year: (member.year as string | undefined) || '',
        club: (member.club as string | undefined) || (member.clubName as string | undefined) || (member.assignedClub as string | undefined) || 'Unassigned',
        points: Number((member.points as number | undefined) ?? (member.pointsEarned as number | undefined) ?? 0),
        status: (member.status as string | undefined) || 'active',
        joinedDate: (member.joinedDate as string | undefined) || (member.createdAt as string | undefined) || '—',
        avatarUrl: member.avatarUrl as string | undefined,
      };
    });
  };

  useEffect(() => {
    let active = true;

    const loadMembers = async () => {
      setLoading(true);

      try {
        const { data } = await api.get('/members');
        const nextMembers = normalizeMembers(data);

        if (!active) return;

        if (nextMembers.length > 0) {
          setMembers(nextMembers);
          localStorage.setItem('campusos_club_members', JSON.stringify(nextMembers));
        } else {
          const fallback = JSON.parse(localStorage.getItem('campusos_club_members') || 'null') || mockClubMembers.map((member) => ({
            id: member.id,
            name: member.name,
            email: '',
            role: member.role,
            department: member.department,
            year: '',
            club: '',
            points: member.points,
            status: member.status,
            joinedDate: member.joinedDate,
            avatarUrl: member.avatarUrl,
          }));
          setMembers(fallback);
        }
      } catch (error) {
        if (!active) return;

        const fallback = JSON.parse(localStorage.getItem('campusos_club_members') || 'null') || mockClubMembers.map((member) => ({
          id: member.id,
          name: member.name,
          email: '',
          role: member.role,
          department: member.department,
          year: '',
          club: '',
          points: member.points,
          status: member.status,
          joinedDate: member.joinedDate,
          avatarUrl: member.avatarUrl,
        }));
        setMembers(fallback);

        const message = error instanceof Error ? error.message : 'Unable to load members right now.';
        toast({
          title: 'Members Unavailable',
          description: message,
          variant: 'warning',
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    loadMembers();

    return () => {
      active = false;
    };
  }, [toast]);

  const handleStatusToggle = (id: string, name: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const updated = members.map((m) => (m.id === id ? { ...m, status: nextStatus } : m));
    setMembers(updated);
    localStorage.setItem('campusos_club_members', JSON.stringify(updated));

    toast({
      title: 'Status Updated',
      description: `${name} has been ${nextStatus === 'active' ? 'activated' : 'deactivated'}.`,
      variant: nextStatus === 'active' ? 'success' : 'warning',
    });
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please complete all required fields.',
        variant: 'warning',
      });
      return;
    }

    const newMember = {
      id: 'm_' + Date.now(),
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      joinedDate: 'Jul 2026',
      department,
      year,
      club: club.trim(),
      points: Number(points) || 0,
      status: 'active',
      avatarUrl: undefined
    };

    const updated = [newMember, ...members];
    setMembers(updated);
    localStorage.setItem('campusos_club_members', JSON.stringify(updated));

    // Pro-dev integration: Sync new member default profile into local registry
    const savedProfiles = localStorage.getItem('campusos_member_profiles');
    const profilesMap = savedProfiles ? JSON.parse(savedProfiles) : {};
    profilesMap[newMember.name] = {
      id: newMember.id,
      name: newMember.name,
      email: newMember.email,
      role: 'member',
      department: newMember.department,
      year: newMember.year,
      club: newMember.club,
      bio: `Active member of the ${newMember.club} contributing to campus activities and projects.`,
      avatarUrl: undefined,
      skills: ['React', 'UI/UX', 'Git'],
      achievements: [],
      badges: [{ id: 'b1', label: 'Active Member', color: '#19376D' }],
      certificates: []
    };
    localStorage.setItem('campusos_member_profiles', JSON.stringify(profilesMap));

    // Reset Form
    setName('');
    setEmail('');
    setRole('Developer');
    setDepartment(DEPARTMENTS[0]);
    setYear(YEARS[1]);
    setClub('Developers Club');
    setPoints('0');
    setIsAddMemberOpen(false);

    toast({
      title: 'Member Added!',
      description: `${newMember.name} has been enrolled successfully.`,
      variant: 'success',
    });
  };

  const filtered = members.filter((m) => {
    const matchesQuery = m.name.toLowerCase().includes(query.toLowerCase()) || m.role.toLowerCase().includes(query.toLowerCase());
    const matchesDept = filterDept === 'All' || m.department === filterDept;
    return matchesQuery && matchesDept;
  });

  const depts = ['All', ...Array.from(new Set(members.map((m) => m.department)))];

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Club Members</h1>
            <p className="mt-1.5 text-sm text-ink-soft">Review and coordinate student membership details, roles, and status.</p>
          </div>
          <Button leftIcon="Plus" onClick={() => setIsAddMemberOpen(true)} magnetic>Add Member</Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.08}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-2">
          <SearchBar value={query} onChange={setQuery} placeholder="Search members by name or role…" className="w-full md:max-w-sm" />
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {depts.map((dept: string) => (
              <button
                key={dept}
                onClick={() => setFilterDept(dept)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold capitalize transition-all duration-200 ${
                  filterDept === dept
                    ? 'bg-navy text-white shadow-lift'
                    : 'bg-white text-ink-soft border border-border-soft hover:bg-cream-100/50'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      <div className="overflow-hidden rounded-2xl border border-border-soft bg-white/80 shadow-soft">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-soft">
              <thead className="bg-cream-100/70">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft">Member</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft">Club</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft/70 bg-white/70">
                {filtered.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedMemberId(m.id)}
                    className="cursor-pointer transition hover:bg-cream-100/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={m.name} src={m.avatarUrl} size="md" ring />
                        <div>
                          <p className="text-sm font-semibold text-ink">{m.name}</p>
                          <p className="text-xs text-ink-soft">{m.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-soft">{m.email}</td>
                    <td className="px-4 py-3 text-sm text-ink-soft">{m.role}</td>
                    <td className="px-4 py-3 text-sm text-ink-soft">{m.club}</td>
                    <td className="px-4 py-3 text-sm text-ink-soft">{m.department}</td>
                    <td className="px-4 py-3">
                      <Badge tone={m.status === 'active' ? 'success' : 'neutral'}>{m.status}</Badge>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleStatusToggle(m.id, m.name, m.status)}
                        className={`flex h-8 w-8 items-center justify-center rounded-xl border border-border-soft transition-all duration-200 hover:bg-cream-100 ${
                          m.status === 'active' ? 'text-danger hover:border-danger/40 hover:bg-danger/5' : 'text-success hover:border-success/40 hover:bg-success/5'
                        }`}
                      >
                        {m.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-soft p-12 text-center bg-white/50">
            <AlertCircle className="h-8 w-8 text-ink-soft/40" />
            <p className="mt-2 text-sm font-semibold text-ink">No members found</p>
            <p className="text-xs text-ink-soft">Adjust filters or search parameters.</p>
          </div>
        )}
      </div>

      <MemberProfileModal
        memberId={selectedMemberId}
        onClose={() => setSelectedMemberId(null)}
        onUpdated={(updatedMember) => {
          const updated = members.map((member) => (member.id === updatedMember.id ? {
            ...member,
            role: updatedMember.role,
            club: updatedMember.club,
          } : member));
          setMembers(updated);
          localStorage.setItem('campusos_club_members', JSON.stringify(updated));
        }}
      />

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <Modal
          open={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          title="Enroll New Member"
          description="Create a membership record and directory card"
          size="lg"
        >
          <form onSubmit={handleAddMemberSubmit} className="space-y-4 text-left">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-base">Student Name *</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="input-base w-full mt-1.5"
                />
              </div>

              <div>
                <label className="label-base">Campus Email Address *</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john.doe@university.edu"
                  className="input-base w-full mt-1.5"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-base">Role / Title *</label>
                <input
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Backend Developer"
                  className="input-base w-full mt-1.5"
                />
              </div>

              <div>
                <label className="label-base font-semibold block mb-1.5">Department *</label>
                <Dropdown
                  value={department}
                  options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
                  onChange={setDepartment}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label-base font-semibold block mb-1.5">Year *</label>
                <Dropdown
                  value={year}
                  options={YEARS.map((y) => ({ value: y, label: y }))}
                  onChange={setYear}
                />
              </div>

              <div>
                <label className="label-base">Club Name *</label>
                <input
                  required
                  value={club}
                  onChange={(e) => setClub(e.target.value)}
                  className="input-base w-full mt-1.5"
                />
              </div>

              <div>
                <label className="label-base">Initial Points</label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="input-base w-full mt-1.5"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => setIsAddMemberOpen(false)}>Cancel</Button>
              <Button type="submit" leftIcon="Check">Add Member</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
