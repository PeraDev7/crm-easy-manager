
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

const eventColors = [
  { bg: "#F1F0FB", text: "#6E59A5", border: "#F1F0FB" }, // Soft Purple
  { bg: "#FEF9F8", text: "#C2410C", border: "#FEF9F8" }, // Soft Orange
  { bg: "#F8FBFE", text: "#0369A1", border: "#F8FBFE" }, // Soft Blue
  { bg: "#F9FCF6", text: "#3F6212", border: "#F9FCF6" }, // Soft Green
  { bg: "#FEFDF7", text: "#854D0E", border: "#FEFDF7" }, // Soft Yellow
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
          className: "rounded-sm shadow-sm p-0.5",
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
    <div className="bg-white rounded-lg shadow-sm">
      <style>
        {`
          .fc {
            --fc-border-color: #F1F1F1;
            --fc-today-bg-color: #FFFFFF;
            --fc-neutral-bg-color: #FFFFFF;
            --fc-list-event-hover-bg-color: #F9FAFB;
            --fc-theme-standard-border-color: #F1F1F1;
            height: 800px !important;
          }
          .fc-theme-standard .fc-scrollgrid {
            border: none;
            border-radius: 0;
          }
          .fc .fc-toolbar {
            gap: 0.5rem;
            margin-bottom: 1rem;
            padding: 0.5rem;
          }
          .fc .fc-toolbar-title {
            font-size: 1.125rem;
            font-weight: 500;
          }
          .fc .fc-button {
            background: white;
            border: 1px solid #F1F1F1;
            color: #aaadb0;
            font-weight: 400;
            padding: 0.25rem 0.75rem;
            border-radius: 0.25rem;
            box-shadow: none;
          }
          .fc .fc-button:hover {
            background: #F9FAFB;
            border-color: #F1F1F1;
          }
          .fc .fc-button-primary:not(:disabled).fc-button-active,
          .fc .fc-button-primary:not(:disabled):active {
            background: #F9FAFB;
            border-color: #F1F1F1;
            color: #18181B;
          }
          .fc-direction-ltr .fc-button-group > .fc-button:not(:last-child),
          .fc-direction-ltr .fc-button-group > .fc-button:not(:first-child) {
            border-radius: 0.25rem;
            margin: 0 0.125rem;
          }
          .fc-theme-standard td, .fc-theme-standard th {
            border: 1px solid #F1F1F1;
          }
          .fc-timegrid-slot {
            height: 2.5rem !important;
          }
          .fc-day-today {
            background: #FFFFFF !important;
          }
          .fc-event {
            border-radius: 0.125rem;
            padding: 0.125rem;
            font-size: 0.875rem;
            border: none;
            transition: all 0.15s;
          }
          .fc-event:hover {
            transform: translateY(-1px);
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          }
          .fc-toolbar-chunk {
            display: flex;
            gap: 0.25rem;
            align-items: center;
          }
          .fc-col-header-cell {
            padding: 0.5rem 0;
            font-weight: 500;
          }
          .fc-timegrid-axis {
            padding: 0.25rem;
          }
          .fc-timegrid-slot-label {
            font-size: 0.75rem;
            color: #aaadb0;
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
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
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
