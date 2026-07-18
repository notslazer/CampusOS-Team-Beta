import { useEffect, useState } from "react";
import PlannerHeader from "../../components/planner/PlannerHeader";
import CalendarView from "../../components/planner/CalendarView";
import StatsCards from "../../components/planner/StatsCards";
import CreateEventModal from "../../components/planner/CreateEventModal";
import { useAuth } from "../../context/AuthContext";
import { mockEvents } from "../../data/mockEvents";
import type { PlannerEvent } from "../../types/planner";
import { FadeIn, StaggerGroup, StaggerItem } from "../../components/ui/motion";
import { Card, CardHeader } from "../../components/ui/Card";
import api from "../../services/api";

const normalizePlannerEvent = (item: any): PlannerEvent => ({
  id: item._id || item.id || `planner-${Date.now()}`,
  title: item.title || item.name || "Untitled Event",
  description: item.description || "",
  category: (item.category as PlannerEvent["category"]) || "Workshop",
  start: item.start || `${item.date}T${item.time}:00` || new Date().toISOString(),
  end: item.end || `${item.date}T${item.time}:00` || new Date().toISOString(),
  venue: item.venue || item.location || "TBD",
  organizer: item.organizer || "Campus Club",
  participants: item.participants || item.maxParticipants || 0,
  color: item.color || "#19376D",
});

export default function CampusPlanner() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { role } = useAuth();
  const canCreate = role === "lead" || role === "faculty";
  const [events, setEvents] = useState<PlannerEvent[]>([]);

  useEffect(() => {
    let active = true;

    const loadEvents = async () => {
      try {
        const response = await api.get("/events");
        const payload = response.data;
        const data = Array.isArray(payload) ? payload : payload?.events || payload?.data || [];

        if (active) {
          const mapped = data.map(normalizePlannerEvent);
          setEvents(mapped);
          localStorage.setItem("campusEvents", JSON.stringify(mapped));
        }
      } catch {
        const fallback = mockEvents as PlannerEvent[];
        if (active) {
          setEvents(fallback);
          localStorage.setItem("campusEvents", JSON.stringify(fallback));
        }
      }
    };

    void loadEvents();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <FadeIn>
        <PlannerHeader
          showCreate={canCreate}
          onCreate={() => setShowCreateModal(true)}
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <StatsCards events={events} />
      </FadeIn>

      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Calendar */}
        <div className="col-span-12 lg:col-span-9">
          <FadeIn delay={0.1}>
            <CalendarView events={events} />
          </FadeIn>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-3">
          <FadeIn delay={0.15}>
            <Card>
              <CardHeader title="Upcoming Events" subtitle="Events scheduled this month" />
              <StaggerGroup className="space-y-3.5 mt-2">
                {events.slice(0, 5).map((event) => (
                  <StaggerItem key={event.id}>
                    <div
                      className="pl-3.5 border-l-4 py-1.5 transition-transform hover:translate-x-1"
                      style={{ borderColor: event.color }}
                    >
                      <h3 className="text-sm font-bold text-ink">
                        {event.title}
                      </h3>
                      <p className="text-[0.72rem] text-ink-soft/80 mt-0.5">
                        {new Date(event.start).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                      <p className="text-[0.68rem] text-ink-soft/60">
                        {event.venue}
                      </p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </Card>
          </FadeIn>
        </div>
      </div>

      <CreateEventModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={(newEvent) => {
          const updated = [...events, newEvent];
          setEvents(updated);
          localStorage.setItem(
            "campusEvents",
            JSON.stringify(updated)
          );
        }}
      />
    </div>
  );
}
