
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface CompanySettings {
  business_name: string;
  address: string;
  zip_code: string;
  city: string;
  province: string;
  vat_number: string;
  tax_code: string;
}

interface QuoteItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Quote {
  quote_number: string;
  date: string;
  expiry_date: string | null;
  client: {
    business_name: string | null;
    name: string;
    address: string | null;
    vat_number: string | null;
  };
  quote_items: QuoteItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string | null;
}

export function generateQuotePDF(quote: Quote, companySettings: CompanySettings) {
  const pdf = new jsPDF();
  
  // Set font
  pdf.setFont("helvetica");
  
  // Company Header
  pdf.setFontSize(16);
  pdf.text(companySettings.business_name, 20, 20);
  
  pdf.setFontSize(10);
  pdf.text(companySettings.address, 20, 30);
  pdf.text(`${companySettings.zip_code} ${companySettings.city} (${companySettings.province})`, 20, 35);
  pdf.text(`P.IVA: ${companySettings.vat_number}`, 20, 40);
  pdf.text(`CF: ${companySettings.tax_code}`, 20, 45);

  // Quote Details (right aligned)
  pdf.text(`Data: ${format(new Date(quote.date), "dd/MM/yyyy")}`, pdf.internal.pageSize.width - 20, 30, { align: "right" });
  if (quote.expiry_date) {
    pdf.text(`Scadenza: ${format(new Date(quote.expiry_date), "dd/MM/yyyy")}`, pdf.internal.pageSize.width - 20, 35, { align: "right" });
  }
  pdf.text(`Numero: ${quote.quote_number}`, pdf.internal.pageSize.width - 20, 40, { align: "right" });

  // Client Info
  pdf.setFontSize(12);
  pdf.text("Cliente", 20, 65);
  pdf.setFontSize(10);
  pdf.text(quote.client.business_name || quote.client.name, 20, 75);
  if (quote.client.address) {
    pdf.text(quote.client.address, 20, 80);
  }
  if (quote.client.vat_number) {
    pdf.text(`P.IVA: ${quote.client.vat_number}`, 20, 85);
  }

  // Items Table
  const tableBody = quote.quote_items.map(item => [
    item.description,
    item.quantity.toString(),
    `€ ${item.unit_price.toFixed(2)}`,
    `€ ${item.total.toFixed(2)}`
  ]);

  autoTable(pdf, {
    startY: 100,
    head: [["Descrizione", "Quantità", "Prezzo", "Totale"]],
    body: tableBody,
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' }
    },
  });

  // Totals
  const finalY = (pdf as any).lastAutoTable.finalY + 10;
  pdf.text(`Subtotale: € ${quote.subtotal.toFixed(2)}`, pdf.internal.pageSize.width - 20, finalY, { align: "right" });
  
  if (quote.tax_rate > 0) {
    pdf.text(`IVA (${quote.tax_rate}%): € ${quote.tax_amount.toFixed(2)}`, pdf.internal.pageSize.width - 20, finalY + 5, { align: "right" });
  }
  
  pdf.setFontSize(12);
  pdf.text(`Totale: € ${quote.total.toFixed(2)}`, pdf.internal.pageSize.width - 20, finalY + 15, { align: "right" });

  // Notes
  if (quote.notes) {
    pdf.setFontSize(12);
    pdf.text("Note", 20, finalY + 30);
    pdf.setFontSize(10);
    const splitNotes = pdf.splitTextToSize(quote.notes, pdf.internal.pageSize.width - 40);
    pdf.text(splitNotes, 20, finalY + 40);
  }

  // Download the PDF
  pdf.save(`Preventivo_${quote.quote_number}.pdf`);
}
