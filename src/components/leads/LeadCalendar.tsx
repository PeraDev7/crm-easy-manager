
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
  { bg: "#9b87f5", text: "#FFFFFF", border: "#8B5CF6" }, // Purple
  { bg: "#F97316", text: "#FFFFFF", border: "#EA580C" }, // Orange
  { bg: "#0EA5E9", text: "#FFFFFF", border: "#0284C7" }, // Blue
  { bg: "#22C55E", text: "#FFFFFF", border: "#16A34A" }, // Green
  { bg: "#EAB308", text: "#FFFFFF", border: "#CA8A04" }, // Yellow
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
    <div className="bg-[#F1F1F1] rounded-lg">
      <style>
        {`
          .fc {
            --fc-border-color: #E5E5E5;
            --fc-today-bg-color: #FFFFFF;
            --fc-neutral-bg-color: #F1F1F1;
            --fc-list-event-hover-bg-color: #F1F1F1;
            --fc-theme-standard-border-color: #E5E5E5;
            height: 800px !important;
          }
          .fc-theme-standard .fc-scrollgrid {
            border: 1px solid #E5E5E5;
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
            background: #FFFFFF;
            border: 1px solid #E5E5E5;
            color: #666666;
            font-weight: 400;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            box-shadow: none;
          }
          .fc .fc-button:hover {
            background: #F8F8F8;
            border-color: #D1D1D1;
          }
          .fc .fc-button-primary:not(:disabled).fc-button-active,
          .fc .fc-button-primary:not(:disabled):active {
            background: #F8F8F8;
            border-color: #D1D1D1;
            color: #333333;
          }
          .fc-direction-ltr .fc-button-group > .fc-button:not(:last-child),
          .fc-direction-ltr .fc-button-group > .fc-button:not(:first-child) {
            border-radius: 0.25rem;
            margin: 0 0.125rem;
          }
          .fc-theme-standard td, .fc-theme-standard th {
            border: 1px solid #E5E5E5;
          }
          .fc-timegrid-slot {
            height: 2rem !important;
          }
          .fc-day-today {
            background: #FAFAFA !important;
          }
          .fc-event {
            border-radius: 4px;
            padding: 0.125rem 0.25rem;
            font-size: 0.75rem;
            border: none;
            transition: all 0.15s;
            margin: 1px;
          }
          .fc-event:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .fc-toolbar-chunk {
            display: flex;
            gap: 0.25rem;
            align-items: center;
          }
          .fc-col-header-cell {
            padding: 0.5rem 0;
            font-weight: 500;
            background: #F8F8F8;
          }
          .fc-timegrid-axis {
            padding: 0.25rem;
            background: #F8F8F8;
          }
          .fc-timegrid-slot-label {
            font-size: 0.75rem;
            color: #666666;
          }
          .fc-day-today .fc-timegrid-col-frame {
            background: #FAFAFA;
          }
          .fc-scrollgrid-section-body td {
            background: #F1F1F1;
          }
          .fc-col-header-cell-cushion {
            color: #666666;
          }
          .fc-timegrid-axis-cushion {
            color: #666666;
          }
          .fc-scrollgrid {
            background: #F1F1F1;
          }
          .fc-col-header, .fc-col-header th {
            background: #F8F8F8;
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
