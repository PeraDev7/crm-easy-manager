
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import itLocale from "@fullcalendar/core/locales/it";
import { useState } from "react";
import { CreateEventSheet } from "./CreateEventSheet";
import { ViewEventSheet } from "./ViewEventSheet";

interface LeadCalendarProps {
  leadId?: string;
}

export function LeadCalendar({ leadId }: LeadCalendarProps) {
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isViewEventOpen, setIsViewEventOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const { data: events } = useQuery({
    queryKey: ["events", leadId],
    queryFn: async () => {
      const query = supabase
        .from("events")
        .select("*, leads(name)")
        .order("start_time", { ascending: true });

      if (leadId) {
        query.eq("lead_id", leadId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.start_time,
        end: event.end_time,
        backgroundColor: event.color || "#9b87f5",
        borderColor: event.color || "#9b87f5",
        extendedProps: {
          description: event.description,
          location: event.location,
          leadId: event.lead_id,
          leadName: event.leads?.name,
        },
      }));
    },
  });

  const handleDateClick = (arg: { date: Date }) => {
    setSelectedDate(arg.date);
    setIsCreateEventOpen(true);
  };

  const handleEventClick = (arg: { event: any }) => {
    setSelectedEvent(arg.event);
    setIsViewEventOpen(true);
  };

  return (
    <div className="bg-background rounded-lg p-4 shadow-sm border">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        locale={itLocale}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="auto"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        slotMinTime="07:00:00"
        slotMaxTime="21:00:00"
        weekends={true}
        businessHours={{
          daysOfWeek: [1, 2, 3, 4, 5],
          startTime: '09:00',
          endTime: '18:00',
        }}
        slotDuration="00:30:00"
        allDaySlot={false}
      />

      <CreateEventSheet
        isOpen={isCreateEventOpen}
        onOpenChange={setIsCreateEventOpen}
        leadId={leadId}
        defaultDate={selectedDate || undefined}
      />

      <ViewEventSheet
        isOpen={isViewEventOpen}
        onOpenChange={setIsViewEventOpen}
        event={selectedEvent}
      />
    </div>
  );
}
