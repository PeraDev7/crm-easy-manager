
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendQuoteRequest {
  quoteId: string;
  clientEmail: string;
  clientName: string;
  quoteNumber: string;
  pdfUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quoteId, clientEmail, clientName, quoteNumber, pdfUrl } = await req.json() as SendQuoteRequest;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const emailResponse = await resend.emails.send({
      from: "Preventivi <onboarding@resend.dev>",
      to: [clientEmail],
      subject: `Nuovo preventivo ${quoteNumber}`,
      html: `
        <h1>Gentile ${clientName},</h1>
        <p>In allegato trova il preventivo ${quoteNumber}.</p>
        <p>Per visualizzare il preventivo clicchi sul seguente link: <a href="${pdfUrl}">Visualizza preventivo</a></p>
        <p>Cordiali saluti</p>
      `,
    });

    // Aggiorna lo stato del preventivo a "sent"
    const { error: updateError } = await supabase
      .from("quotes")
      .update({ status: "sent" })
      .eq("id", quoteId);

    if (updateError) throw updateError;

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error in send-quote function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
