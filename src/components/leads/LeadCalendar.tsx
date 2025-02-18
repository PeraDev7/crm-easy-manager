
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
  { bg: "#ffffff", text: "#6E59A5", border: "#F1F0FB" }, // White with Purple text
  { bg: "#ffffff", text: "#C2410C", border: "#FEF9F8" }, // White with Orange text
  { bg: "#ffffff", text: "#0369A1", border: "#F8FBFE" }, // White with Blue text
  { bg: "#ffffff", text: "#3F6212", border: "#F9FCF6" }, // White with Green text
  { bg: "#ffffff", text: "#854D0E", border: "#FEFDF7" }, // White with Yellow text
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
    <div className="bg-white rounded-lg">
      <style>
        {`
          .fc {
            --fc-border-color: #FFFFFF;
            --fc-today-bg-color: #FFFFFF;
            --fc-neutral-bg-color: #FFFFFF;
            --fc-list-event-hover-bg-color: #FFFFFF;
            --fc-theme-standard-border-color: #EEEEEE;
            height: 800px !important;
          }
          .fc-theme-standard .fc-scrollgrid {
            border: none;
          }
          .fc .fc-toolbar {
            gap: 0.5rem;
            margin-bottom: 0.5rem;
            padding: 0.25rem;
          }
          .fc .fc-toolbar-title {
            font-size: 1rem;
            font-weight: 400;
          }
          .fc .fc-button {
            background: white;
            border: 1px solid #EEEEEE;
            color: #666666;
            font-weight: 400;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            box-shadow: none;
          }
          .fc .fc-button:hover {
            background: #FFFFFF;
            border-color: #DDDDDD;
          }
          .fc .fc-button-primary:not(:disabled).fc-button-active,
          .fc .fc-button-primary:not(:disabled):active {
            background: #FFFFFF;
            border-color: #DDDDDD;
            color: #333333;
          }
          .fc-direction-ltr .fc-button-group > .fc-button:not(:last-child),
          .fc-direction-ltr .fc-button-group > .fc-button:not(:first-child) {
            border-radius: 0.25rem;
            margin: 0 0.125rem;
          }
          .fc-theme-standard td, .fc-theme-standard th {
            border: 1px solid #EEEEEE;
          }
          .fc-timegrid-slot {
            height: 2rem !important;
          }
          .fc-day-today {
            background: #FFFFFF !important;
          }
          .fc-event {
            border-radius: 0;
            padding: 0.125rem;
            font-size: 0.75rem;
            border: none;
            transition: all 0.15s;
            background: #FFFFFF;
          }
          .fc-event:hover {
            transform: none;
            box-shadow: none;
          }
          .fc-toolbar-chunk {
            display: flex;
            gap: 0.25rem;
            align-items: center;
          }
          .fc-col-header-cell {
            padding: 0.25rem 0;
            font-weight: 400;
            background: #FFFFFF;
          }
          .fc-timegrid-axis {
            padding: 0.25rem;
            background: #FFFFFF;
          }
          .fc-timegrid-slot-label {
            font-size: 0.75rem;
            color: #666666;
          }
          .fc-day-today .fc-timegrid-col-frame {
            background: #FFFFFF;
          }
          .fc-scrollgrid-section-body td {
            background: #FFFFFF;
          }
          .fc-col-header-cell-cushion {
            color: #666666;
          }
          .fc-timegrid-axis-cushion {
            color: #666666;
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
