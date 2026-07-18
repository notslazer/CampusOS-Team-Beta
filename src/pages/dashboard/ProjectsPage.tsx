import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FolderKanban, Users, CalendarDays, UserPlus, Search } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { FadeIn, StaggerGroup, StaggerItem } from '../../components/ui/motion';
import { mockProjects as fallbackTrackerProjects } from '../../utils/mockData';
import { mockProjects as fallbackShowcaseProjects } from '../../data/mockProjects';
import ProjectCard from '../../components/projects/ProjectCard';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/ui/Modal';
import { Avatar } from '../../components/ui/Avatar';
import { MemberProfileModal } from '../../components/ui/MemberProfileModal';
import api from '../../services/api';
import type { Project } from '../../types/project';

const statusTone = {
  active: 'success',
  review: 'warning',
  planning: 'navy',
  completed: 'neutral',
  ongoing: 'success',
} as const;

const normalizeProject = (item: any): Project => ({
  id: item._id || item.id || `project-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  title: item.title || item.name || 'Untitled Project',
  club: item.club || item.clubName || 'Student Project',
  description: item.description || 'No description provided yet.',
  techStack: Array.isArray(item.techStack) ? item.techStack : Array.isArray(item.technologies) ? item.technologies : [],
  technologies: Array.isArray(item.technologies) ? item.technologies : Array.isArray(item.techStack) ? item.techStack : [],
  members: item.members || item.teamSize || 0,
  likes: item.likes || 0,
  views: item.views || 0,
  featured: Boolean(item.featured),
  status: item.status || 'Active',
  image: item.image || item.screenshots?.[0] || item.coverImage || '',
  screenshots: Array.isArray(item.screenshots) ? item.screenshots : item.screenshots ? [item.screenshots] : [],
  github: item.github || '',
  demo: item.demo || '',
  githubLink: item.githubLink || item.github || '',
  demoLink: item.demoLink || item.demo || '',
});

export default function ProjectsPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'showcase' | 'tracker'>('showcase');
  const [selectedMemberName, setSelectedMemberName] = useState<string | null>(null);
  const [showcaseSearch, setShowcaseSearch] = useState('');
  const [showcaseClub, setShowcaseClub] = useState('All');
  const [trackerQuery, setTrackerQuery] = useState('');
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('campusos_projects');
    return saved ? JSON.parse(saved) : fallbackTrackerProjects;
  });
  const [showcaseProjects, setShowcaseProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('campusos_showcase_projects');
    return saved ? JSON.parse(saved) : fallbackShowcaseProjects;
  });
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [joinRequests, setJoinRequests] = useState<string[]>(() => {
    const saved = localStorage.getItem('campusos_join_requests');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    let isMounted = true;

    const loadShowcaseProjects = async () => {
      setIsProjectsLoading(true);

      try {
        const endpoints = ['/projects/showcase', '/projects'];
        for (const endpoint of endpoints) {
          try {
            const response = await api.get(endpoint);
            const payload = response.data;
            const data = Array.isArray(payload)
              ? payload
              : payload?.projects || payload?.data || payload?.results || [];

            if (Array.isArray(data) && data.length > 0) {
              const mapped = data.map(normalizeProject);
              if (isMounted) {
                setShowcaseProjects(mapped);
                localStorage.setItem('campusos_showcase_projects', JSON.stringify(mapped));
              }
              return;
            }
          } catch {
            // continue to the next endpoint
          }
        }

        if (isMounted) {
          setShowcaseProjects(fallbackShowcaseProjects);
          localStorage.setItem('campusos_showcase_projects', JSON.stringify(fallbackShowcaseProjects));
        }
      } catch {
        if (isMounted) {
          setShowcaseProjects(fallbackShowcaseProjects);
          localStorage.setItem('campusos_showcase_projects', JSON.stringify(fallbackShowcaseProjects));
        }
      } finally {
        if (isMounted) {
          setIsProjectsLoading(false);
        }
      }
    };

    void loadShowcaseProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  const clubs = useMemo(
    () => ['All', ...new Set(showcaseProjects.map((p) => p.club || 'General'))],
    [showcaseProjects]
  );

  const filteredShowcase = useMemo(() => {
    return showcaseProjects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(showcaseSearch.toLowerCase()) ||
        project.description.toLowerCase().includes(showcaseSearch.toLowerCase());

      const matchesClub =
        showcaseClub === 'All' || project.club === showcaseClub;

      return matchesSearch && matchesClub;
    });
  }, [showcaseSearch, showcaseClub, showcaseProjects]);

  const featuredProjects = filteredShowcase.filter((project) => project.featured);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = (formData.get('title') as string)?.trim();
    const description = (formData.get('description') as string)?.trim();
    const githubLink = (formData.get('githubLink') as string)?.trim();
    const demoLink = (formData.get('demoLink') as string)?.trim();
    const technologiesInput = (formData.get('technologies') as string)?.trim();
    const screenshotsInput = (formData.get('screenshots') as string)?.trim();

    if (!title || !description) return;

    const payload = {
      title,
      description,
      githubLink: githubLink || undefined,
      demoLink: demoLink || undefined,
      technologies: technologiesInput
        ? technologiesInput.split(',').map((tech) => tech.trim()).filter(Boolean)
        : [],
      screenshots: screenshotsInput
        ? screenshotsInput.split(',').map((screenshot) => screenshot.trim()).filter(Boolean)
        : [],
    };

    const localProject = normalizeProject({
      ...payload,
      id: `local-${Date.now()}`,
      club: user?.club || 'Your Club',
      status: 'planning',
      featured: false,
      image: '',
      members: 1,
    });

    try {
      const response = await api.post('/projects', payload);
      const createdProject = normalizeProject(response.data?.project || response.data || localProject);

      setProjects((current) => {
        const updated = [createdProject, ...current];
        localStorage.setItem('campusos_projects', JSON.stringify(updated));
        return updated;
      });
      setShowcaseProjects((current) => {
        const updated = [createdProject, ...current];
        localStorage.setItem('campusos_showcase_projects', JSON.stringify(updated));
        return updated;
      });

      toast({
        title: 'Project Created Successfully',
        description: `"${createdProject.title}" has been added to the showcase and tracker.`,
        variant: 'success',
      });
      setIsCreateOpen(false);
    } catch (error) {
      setProjects((current) => {
        const updated = [localProject, ...current];
        localStorage.setItem('campusos_projects', JSON.stringify(updated));
        return updated;
      });
      setShowcaseProjects((current) => {
        const updated = [localProject, ...current];
        localStorage.setItem('campusos_showcase_projects', JSON.stringify(updated));
        return updated;
      });

      toast({
        title: 'Project Saved Locally',
        description: 'The project was queued locally because the backend endpoint was unavailable.',
        variant: 'warning',
      });
      setIsCreateOpen(false);
    }
  };

  const filteredTracker = projects.filter((p: any) => p.name?.toLowerCase().includes(trackerQuery.toLowerCase()));

  const canCreate = user?.role === 'lead' || user?.role === 'faculty';

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Projects</h1>
            <p className="mt-1 text-sm text-ink-soft">Explore and track active club projects.</p>
          </div>
          {activeTab === 'tracker' && canCreate && (
            <Button leftIcon="Plus" onClick={() => setIsCreateOpen(true)} magnetic>
              New Project
            </Button>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={0.04}>
        <div className="flex gap-1 border-b border-border-soft pb-px">
          <button
            onClick={() => setActiveTab('showcase')}
            className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-px cursor-pointer ${
              activeTab === 'showcase'
                ? 'border-navy text-navy font-bold'
                : 'border-transparent text-ink-soft hover:text-navy'
            }`}
          >
            ⭐ Student Showcase
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-px cursor-pointer ${
              activeTab === 'tracker'
                ? 'border-navy text-navy font-bold'
                : 'border-transparent text-ink-soft hover:text-navy'
            }`}
          >
            📂 Project Tracker
          </button>
        </div>
      </FadeIn>

      {activeTab === 'showcase' && (
        <div className="space-y-8">
          <FadeIn delay={0.08}>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-3 text-ink-soft"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search showcase projects..."
                  value={showcaseSearch}
                  onChange={(e) => setShowcaseSearch(e.target.value)}
                  className="w-full rounded-xl border border-border-soft bg-white/70 py-2.5 pl-11 pr-4 outline-none transition focus:border-navy"
                />
              </div>

              <select
                value={showcaseClub}
                onChange={(e) => setShowcaseClub(e.target.value)}
                className="rounded-xl border border-border-soft bg-white/70 px-4 py-2.5 outline-none focus:border-navy cursor-pointer text-sm font-medium"
              >
                {clubs.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Clubs' : c}
                  </option>
                ))}
              </select>
            </div>
          </FadeIn>

          {isProjectsLoading && (
            <div className="rounded-2xl border border-dashed border-border-soft bg-white/70 p-8 text-center text-sm text-ink-soft">
              Loading projects from the backend...
            </div>
          )}

          {featuredProjects.length > 0 && (
            <FadeIn delay={0.12}>
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-navy flex items-center gap-1.5">
                  ⭐ Featured Projects
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {featuredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          <FadeIn delay={0.16}>
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-navy flex items-center gap-1.5">
                📂 All Projects
              </h2>
              {filteredShowcase.length === 0 ? (
                <div className="card-surface p-12 text-center bg-white/70">
                  <h3 className="text-base font-semibold text-ink">No projects found</h3>
                  <p className="mt-1 text-sm text-ink-soft">Try another search query or filter by club.</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredShowcase.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      )}

      {activeTab === 'tracker' && (
        <div className="space-y-6">
          <FadeIn delay={0.08}>
            <SearchBar value={trackerQuery} onChange={setTrackerQuery} placeholder="Search active tracker projects…" className="sm:max-w-xs" />
          </FadeIn>

          <StaggerGroup className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTracker.map((p: any) => (
              <StaggerItem key={p.id}>
                <motion.div
                  whileHover={{ y: -6 }}
                  onClick={() => setSelectedProject(p)}
                  className="card-surface p-5 transition-shadow hover:shadow-lift cursor-pointer bg-white/70"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/10 text-navy">
                      <FolderKanban className="h-5 w-5" />
                    </span>
                    <Badge tone={statusTone[(p.status || 'active').toLowerCase() as keyof typeof statusTone] || 'neutral'} dot>{p.status || 'Active'}</Badge>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-ink">{p.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{p.description}</p>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ink-soft">Progress</span>
                      <span className="font-semibold text-ink">{p.progress}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-beige">
                      <motion.div
                        className="h-full rounded-full bg-navy"
                        initial={{ width: 0 }}
                        animate={{ width: `${p.progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border-soft pt-3 text-xs text-ink-soft">
                    <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {p.members} members</span>
                    <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Due {p.dueDate}</span>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      )}

      {isCreateOpen && (
        <Modal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Project"
          description="Initialize a new project in planning phase"
          size="md"
        >
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="label-base">Project Title</label>
              <input name="title" required className="input-base mt-1.5 w-full" placeholder="e.g. Website Redesign" />
            </div>
            <div>
              <label className="label-base">Description</label>
              <textarea name="description" required rows={3} className="input-base mt-1.5 w-full resize-none" placeholder="Describe project goals and scope..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-base">GitHub Link</label>
                <input name="githubLink" className="input-base mt-1.5 w-full" placeholder="https://github.com/..." />
              </div>
              <div>
                <label className="label-base">Demo Link</label>
                <input name="demoLink" className="input-base mt-1.5 w-full" placeholder="https://demo.example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-base">Technologies</label>
                <input name="technologies" className="input-base mt-1.5 w-full" placeholder="React, TypeScript, Tailwind" />
              </div>
              <div>
                <label className="label-base">Screenshots</label>
                <input name="screenshots" className="input-base mt-1.5 w-full" placeholder="https://img1.com, https://img2.com" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" leftIcon="Plus">Create Project</Button>
            </div>
          </form>
        </Modal>
      )}

      {selectedProject && (
        <Modal
          open={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title="Project Details"
          description="Status and contributor details for this club project"
          size="md"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/10 text-navy">
                  <FolderKanban className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-ink">{selectedProject.name}</h3>
                  <p className="text-xs text-ink-soft">{selectedProject.tag || 'Club Project'}</p>
                </div>
              </div>
              <Badge tone={statusTone[(selectedProject.status || 'active').toLowerCase() as keyof typeof statusTone] || 'neutral'} dot>
                {selectedProject.status || 'Active'}
              </Badge>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Description</h4>
              <p className="mt-1 text-sm text-ink-soft/90 leading-relaxed">{selectedProject.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-xl border border-border-soft bg-cream-100/40 p-4">
              <div>
                <p className="text-xs text-ink-soft font-medium">Due Date</p>
                <p className="mt-0.5 text-sm font-semibold text-ink inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-navy" /> {selectedProject.dueDate}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-soft font-medium">Progress</p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-beige">
                    <div
                      className="h-full rounded-full bg-navy"
                      style={{ width: `${selectedProject.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-ink">{selectedProject.progress}%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-soft mb-3">
                Team Members Working on this Project ({selectedProject.members || 3})
              </h4>
              <div className="space-y-2.5">
                {[
                  { name: 'Aarav Mehta', role: 'Project Lead', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop' },
                  { name: 'Diya Sharma', role: 'UI/UX Designer', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop' },
                  { name: 'Sara Khan', role: 'Frontend Developer', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=128&h=128&fit=crop' },
                ].slice(0, selectedProject.members ? Math.min(selectedProject.members, 3) : 3).map((member) => (
                  <div
                    key={member.name}
                    onClick={() => setSelectedMemberName(member.name)}
                    className="flex items-center justify-between rounded-xl border border-border-soft/60 bg-white p-3 shadow-sm cursor-pointer hover:bg-cream-100/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} src={member.avatar} size="sm" />
                      <div>
                        <p className="text-sm font-semibold text-ink">{member.name}</p>
                        <p className="text-xs text-ink-soft">{member.role}</p>
                      </div>
                    </div>
                    <Badge tone="success">Active</Badge>
                  </div>
                ))}

                {(() => {
                  const totalSeats = selectedProject.members || 3;
                  const activeMockCount = Math.min(totalSeats, 3);
                  const openSeatsCount = Math.max(0, totalSeats - activeMockCount);
                  if (openSeatsCount <= 0) return null;

                  const hasRequested = joinRequests.includes(selectedProject.id);

                  return Array.from({ length: openSeatsCount }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-dashed border-border-soft/80 bg-cream-100/30 p-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy/5 text-navy">
                          <UserPlus className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-ink">Open Seat</p>
                          <p className="text-xs text-ink-soft">Looking for contributor</p>
                        </div>
                      </div>
                      {user?.role === 'member' && (
                        <Button
                          variant={hasRequested ? 'outline' : 'secondary'}
                          size="sm"
                          disabled={hasRequested}
                          onClick={() => {
                            const updated = [...joinRequests, selectedProject.id];
                            setJoinRequests(updated);
                            localStorage.setItem('campusos_join_requests', JSON.stringify(updated));
                            toast({
                              title: 'Request Sent Successfully',
                              description: 'Your request to join the project team has been recorded and will be sent to the lead.',
                              variant: 'success',
                            });
                          }}
                        >
                          {hasRequested ? 'Requested' : 'Request to Join'}
                        </Button>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedProject(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <MemberProfileModal
        memberName={selectedMemberName}
        onClose={() => setSelectedMemberName(null)}
      />
    </div>
  );
}
