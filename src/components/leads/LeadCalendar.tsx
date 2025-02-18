
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
import { cn } from "@/lib/utils";

interface LeadCalendarProps {
  leadId?: string;
}

const eventColors = [
  { bg: "#E5DEFF", text: "#6E59A5", border: "#9b87f5" }, // Purple
  { bg: "#FDE1D3", text: "#C2410C", border: "#F97316" }, // Orange
  { bg: "#D3E4FD", text: "#0369A1", border: "#0EA5E9" }, // Blue
  { bg: "#F2FCE2", text: "#3F6212", border: "#84CC16" }, // Green
  { bg: "#FEF7CD", text: "#854D0E", border: "#EAB308" }, // Yellow
];

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

      return data.map((event, index) => {
        const colorIndex = index % eventColors.length;
        const color = eventColors[colorIndex];
        
        return {
          id: event.id,
          title: event.title,
          start: event.start_time,
          end: event.end_time,
          backgroundColor: color.bg,
          textColor: color.text,
          borderColor: color.border,
          className: "rounded-md shadow-sm border p-1",
          extendedProps: {
            description: event.description,
            location: event.location,
            leadId: event.lead_id,
            leadName: event.leads?.name,
          },
        };
      });
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
      <style>
        {`
          .fc {
            --fc-border-color: #E4E4E7;
            --fc-today-bg-color: #F4F4F5;
            --fc-neutral-bg-color: #FFFFFF;
            --fc-list-event-hover-bg-color: #F4F4F5;
            --fc-theme-standard-border-color: #E4E4E7;
            height: 800px !important;
          }
          .fc-theme-standard .fc-scrollgrid {
            border: 1px solid #E4E4E7;
            border-radius: 0.5rem;
          }
          .fc .fc-toolbar {
            gap: 1rem;
            margin-bottom: 1.5rem;
          }
          .fc .fc-toolbar-title {
            font-size: 1.25rem;
            font-weight: 600;
          }
          .fc .fc-button {
            background: white;
            border: 1px solid #E4E4E7;
            color: #18181B;
            font-weight: 500;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          }
          .fc .fc-button:hover {
            background: #F4F4F5;
          }
          .fc .fc-button-primary:not(:disabled).fc-button-active,
          .fc .fc-button-primary:not(:disabled):active {
            background: #F4F4F5;
            border-color: #E4E4E7;
            color: #18181B;
          }
          .fc-direction-ltr .fc-button-group > .fc-button:not(:last-child) {
            border-radius: 0.375rem;
            margin-right: 0.25rem;
          }
          .fc-direction-ltr .fc-button-group > .fc-button:not(:first-child) {
            border-radius: 0.375rem;
            margin-left: 0.25rem;
          }
          .fc-theme-standard td, .fc-theme-standard th {
            border: 1px solid #E4E4E7;
          }
          .fc-timegrid-slot {
            height: 3rem !important;
          }
          .fc-day-today {
            background: #F9FAFB !important;
          }
          .fc-event {
            border-radius: 0.375rem;
            padding: 0.25rem;
            font-size: 0.875rem;
            transition: all 0.2s;
          }
          .fc-event:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          .fc-toolbar-chunk {
            display: flex;
            gap: 0.5rem;
            align-items: center;
          }
        `}
      </style>
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
