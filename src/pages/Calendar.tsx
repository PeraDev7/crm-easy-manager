
import { Layout } from "@/components/Layout";
import { LeadCalendar } from "@/components/leads/LeadCalendar";

const Calendar = () => {
  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Calendario Eventi</h1>
        </div>
        <LeadCalendar />
      </div>
    </Layout>
  );
};

export default Calendar;
