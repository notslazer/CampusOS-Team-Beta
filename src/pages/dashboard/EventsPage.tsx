import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Users, Filter } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { FadeIn, StaggerGroup, StaggerItem } from '../../components/ui/motion';
import { mockEvents } from '../../utils/mockData';
import { EventActionModal, type EventActionDetails } from '../../components/events/EventActionModal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/ui/Modal';
import api from '../../services/api';

interface EventCardItem extends EventActionDetails {
  id: string | number;
  title: string;
  date?: string;
  time: string;
  location: string;
  attendees: number;
  status?: string;
  description?: string;
  organizer?: string;
  registrationDeadline?: string;
  maxParticipants?: number;
  poster?: string;
  tag?: string;
}

const statusTone = {
  upcoming: 'navy',
  live: 'success',
  completed: 'neutral',
} as const;

const filters = ['All', 'Upcoming', 'Live', 'Completed'];

const normalizeEvent = (item: Record<string, unknown>): EventCardItem => ({
  id: String((item._id as string | undefined) || (item.id as string | undefined) || `event-${Date.now()}`),
  title: String((item.title as string | undefined) || (item.name as string | undefined) || 'Untitled Event'),
  date: String((item.date as string | undefined) || (item.startDate as string | undefined) || ''),
  time: String((item.time as string | undefined) || (item.startTime as string | undefined) || 'TBD'),
  location: String((item.venue as string | undefined) || (item.location as string | undefined) || 'TBD'),
  attendees: Number((item.maxParticipants as number | undefined) || (item.attendees as number | undefined) || 0),
  status: String((item.status as string | undefined) || ((item.isActive as boolean | undefined) ? 'live' : 'upcoming')),
  description: String((item.description as string | undefined) || ''),
  organizer: String((item.organizer as string | undefined) || ''),
  registrationDeadline: String((item.registrationDeadline as string | undefined) || ''),
  maxParticipants: Number((item.maxParticipants as number | undefined) || 0),
  poster: String((item.poster as string | undefined) || ''),
});

export default function EventsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<EventActionDetails | null>(null);
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('campusos_events');
    return saved ? JSON.parse(saved) : mockEvents;
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [registeredList, setRegisteredList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRegs = () => {
      const saved = localStorage.getItem('registeredEvents');
      setRegisteredList(saved ? JSON.parse(saved) : []);
    };
    loadRegs();

    window.addEventListener('campusos_event_registered', loadRegs);
    return () => window.removeEventListener('campusos_event_registered', loadRegs);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadEvents = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/events');
        const payload = response.data;
        const data = Array.isArray(payload) ? payload : payload?.events || payload?.data || [];

        if (mounted) {
          const normalized = data.map(normalizeEvent);
          setEvents(normalized);
          localStorage.setItem('campusos_events', JSON.stringify(normalized));
        }
      } catch {
        if (mounted) {
          const fallback = Array.isArray(mockEvents) ? mockEvents : [];
          setEvents(fallback);
          localStorage.setItem('campusos_events', JSON.stringify(fallback));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadEvents();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const title = (formData.get('title') as string)?.trim();
    const description = (formData.get('description') as string)?.trim();
    const date = (formData.get('date') as string)?.trim();
    const time = (formData.get('time') as string)?.trim();
    const venue = (formData.get('venue') as string)?.trim();
    const organizer = (formData.get('organizer') as string)?.trim();
    const registrationDeadline = (formData.get('registrationDeadline') as string)?.trim();
    const maxParticipants = Number(formData.get('maxParticipants') || 0);
    const poster = (formData.get('poster') as string)?.trim();

    if (!title || !date || !time || !venue || !organizer) return;

    const payload = {
      title,
      description: description || 'No description provided.',
      date,
      time,
      venue,
      organizer,
      registrationDeadline: registrationDeadline || undefined,
      maxParticipants: maxParticipants || undefined,
      poster: poster || undefined,
    };

    try {
      const response = await api.post('/events', payload);
      const createdEvent = normalizeEvent(response.data?.event || response.data || payload);
      const updated = [createdEvent, ...events];
      setEvents(updated);
      localStorage.setItem('campusos_events', JSON.stringify(updated));
      setIsCreateOpen(false);
      toast({
        title: 'Event Created Successfully',
        description: `"${createdEvent.title}" has been scheduled for ${createdEvent.date}.`,
        variant: 'success',
      });
    } catch {
      const localEvent = normalizeEvent({ ...payload, id: `local-${Date.now()}`, status: 'upcoming' });
      const updated = [localEvent, ...events];
      setEvents(updated);
      localStorage.setItem('campusos_events', JSON.stringify(updated));
      setIsCreateOpen(false);
      toast({
        title: 'Event Saved Locally',
        description: 'The event was queued locally because the backend endpoint was unavailable.',
        variant: 'warning',
      });
    }
  };

  const handleRegister = async (event: EventActionDetails) => {
    const eventKey = String(event.id || event.title);
    const registrations = JSON.parse(localStorage.getItem('registeredEvents') || '[]');

    if (!registrations.includes(eventKey)) {
      registrations.push(eventKey);
      localStorage.setItem('registeredEvents', JSON.stringify(registrations));
      setRegisteredList(registrations);
      window.dispatchEvent(new Event('campusos_event_registered'));
    }

    try {
      await api.post(`/events/${event.id}/register`, { eventId: event.id });
      toast({
        title: 'Registration Successful',
        description: `You are now registered for ${event.title}.`,
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Registration Saved Locally',
        description: 'The registration was saved in your browser while the backend was unavailable.',
        variant: 'warning',
      });
    }
  };

  const filtered = events.filter((e: EventCardItem) => {
    const matchesQuery = e.title.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'All' || e.status === filter.toLowerCase();
    return matchesQuery && matchesFilter;
  });

  const canCreate = user?.role === 'lead' || user?.role === 'faculty';

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Events</h1>
            <p className="mt-1 text-sm text-ink-soft">Browse, register, and manage club events.</p>
          </div>
          {canCreate && (
            <Button leftIcon="Plus" onClick={() => setIsCreateOpen(true)} magnetic>
              Create Event
            </Button>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={0.08}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={query} onChange={setQuery} placeholder="Search events…" className="sm:max-w-xs" />
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-ink-soft" />
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  filter === f ? 'bg-navy text-white shadow-soft' : 'bg-white text-ink-soft hover:text-navy'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {isLoading && (
        <div className="rounded-2xl border border-dashed border-border-soft bg-white/70 p-8 text-center text-sm text-ink-soft">
          Loading events from the backend...
        </div>
      )}

      <StaggerGroup className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((e: EventCardItem) => (
          <StaggerItem key={e.id}>
            <motion.div whileHover={{ y: -6 }} className="card-surface group overflow-hidden transition-shadow hover:shadow-lift">
              <div className="relative h-32 overflow-hidden bg-gradient-to-br from-navy to-navy-400">
                <div className="absolute inset-0 bg-navy-radial opacity-50" />
                <div className="absolute left-4 top-4">
                  <Badge tone={statusTone[e.status as keyof typeof statusTone]} dot>{e.status}</Badge>
                </div>
                <div className="absolute bottom-4 right-4 flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
                  <span className="text-[0.65rem] font-medium leading-none">{(e.date || '').split(' ')[0]}</span>
                  <span className="text-lg font-bold leading-tight">{(e.date || '').split(' ')[1] || 'TBD'}</span>
                </div>
              </div>
              <div className="p-5">
                <Badge tone="sand">{e.tag || 'General'}</Badge>
                <h3 className="mt-2.5 text-base font-semibold text-ink">{e.title}</h3>
                <div className="mt-3 space-y-1.5 text-xs text-ink-soft">
                  <p className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {e.time}</p>
                  <p className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {e.location}</p>
                  <p className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {e.attendees} attending</p>
                </div>
                {(() => {
                  const isRegistered = registeredList.includes(String(e.id || e.title));
                  const isCompleted = e.status === 'completed';
                  const isLive = e.status === 'live';

                  return (
                    <Button
                      variant={isRegistered && !isLive ? 'outline' : 'secondary'}
                      className="mt-4 w-full"
                      size="sm"
                      disabled={isRegistered && !isLive && !isCompleted}
                      onClick={() => setSelectedEvent(e)}
                    >
                     {
  isCompleted
    ? 'View Recap'
    : isLive
    ? 'Join Now'
    : isRegistered
    ? '✓ Registered'
    : 'Register'
}
                    </Button>
                  );
                })()}
              </div>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerGroup>
      <EventActionModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={handleRegister}
      />

      {isCreateOpen && (
        <Modal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Event"
          description="Schedule a new event for your club members"
          size="md"
        >
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="label-base">Event Title</label>
              <input name="title" required className="input-base mt-1.5 w-full" placeholder="e.g. Hackathon Kickoff" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-base">Date</label>
                <input name="date" required className="input-base mt-1.5 w-full" placeholder="e.g. Jul 20" />
              </div>
              <div>
                <label className="label-base">Time</label>
                <input name="time" required className="input-base mt-1.5 w-full" placeholder="e.g. 10:00 AM" />
              </div>
            </div>
            <div>
              <label className="label-base">Location</label>
              <input name="location" required className="input-base mt-1.5 w-full" placeholder="e.g. Seminar Hall" />
            </div>
            <div>
              <label className="label-base">Category Tag</label>
              <input name="tag" className="input-base mt-1.5 w-full" placeholder="e.g. Workshop" />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" leftIcon="Plus">Create Event</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
