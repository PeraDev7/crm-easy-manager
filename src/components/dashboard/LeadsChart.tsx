
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { startOfMonth, subMonths, format } from "date-fns";
import { it } from "date-fns/locale";

export function LeadsChart() {
  const { data: leadsData } = useQuery({
    queryKey: ["leads-monthly"],
    queryFn: async () => {
      const lastMonths = Array.from({ length: 12 }, (_, i) => {
        const date = subMonths(new Date(), i);
        return format(startOfMonth(date), "yyyy-MM-dd");
      }).reverse();

      const { data, error } = await supabase
        .from("leads")
        .select("created_at")
        .gte("created_at", lastMonths[0]);

      if (error) throw error;

      const monthlyData = lastMonths.map(monthStart => {
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        return {
          month: format(new Date(monthStart), "MMM", { locale: it }),
          count: data.filter(lead => {
            const leadDate = new Date(lead.created_at);
            return leadDate >= new Date(monthStart) && leadDate < monthEnd;
          }).length
        };
      });

      return monthlyData;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Lead per Mese</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leadsData}>
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
