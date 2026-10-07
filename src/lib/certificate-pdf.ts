// Browser-only: builds an A4 landscape certificate PDF with a QR code.
// Import dynamically (await import(...)) from click handlers only.
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

export type CertificateData = {
  certificate_id: string;
  recipient_name: string;
  program_name: string;
  domain?: string | null;
  duration?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  issue_date?: string | null;
  performance?: string | null;
  status: string;
};

export function verificationUrl(id: string, origin = window.location.origin) {
  return `${origin}/verify?tab=certificate&cert=${encodeURIComponent(id)}`;
}

function fmt(d?: string | null) {
  if (!d) return "";
  const date = new Date(d);
  return isNaN(date.getTime()) ? d : date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

async function loadImage(src: string): Promise<string | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((r) => {
      const fr = new FileReader();
      fr.onload = () => r(fr.result as string);
      fr.onerror = () => r(null);
      fr.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function downloadCertificatePdf(c: CertificateData) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297, H = 210;
  const navy: [number, number, number] = [11, 18, 38];
  const blue: [number, number, number] = [37, 99, 235];
  const cyan: [number, number, number] = [6, 182, 212];
  const gold: [number, number, number] = [180, 142, 58];
  const ink: [number, number, number] = [30, 41, 59];
  const muted: [number, number, number] = [100, 116, 139];

  // Background + frames
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(...navy);
  doc.rect(0, 0, W, 6, "F");
  doc.rect(0, H - 6, W, 6, "F");
  doc.setDrawColor(...blue);
  doc.setLineWidth(1.2);
  doc.rect(10, 12, W - 20, H - 24);
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.3);
  doc.rect(13, 15, W - 26, H - 30);
  // corner accents
  doc.setFillColor(...cyan);
  ([[10, 12], [W - 16, 12], [10, H - 18], [W - 16, H - 18]] as const).forEach(([x, y]) => doc.rect(x, y, 6, 6, "F"));

  // Logo + company
  const logo = await loadImage("/assets/bennufly-mark.png");
  if (logo) doc.addImage(logo, "PNG", W / 2 - 8, 22, 16, 16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...navy);
  doc.text("BENNUFLY TECHNOLOGY PVT. LTD.", W / 2, 45, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text("Nagpur, Maharashtra, India", W / 2, 50, { align: "center" });

  // Title
  doc.setFont("times", "bold");
  doc.setFontSize(32);
  doc.setTextColor(...blue);
  doc.text("Certificate of Completion", W / 2, 66, { align: "center" });
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.6);
  doc.line(W / 2 - 40, 71, W / 2 + 40, 71);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...muted);
  doc.text("This is to certify that", W / 2, 82, { align: "center" });

  doc.setFont("times", "bolditalic");
  doc.setFontSize(30);
  doc.setTextColor(...navy);
  doc.text(c.recipient_name, W / 2, 97, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...muted);
  doc.text("has successfully completed the internship program", W / 2, 108, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...ink);
  const prog = doc.splitTextToSize(c.program_name, 200);
  doc.text(prog, W / 2, 118, { align: "center" });

  const period = c.start_date ? `${fmt(c.start_date)} – ${c.end_date ? fmt(c.end_date) : "Present"}` : "";
  const details = [c.domain && `Domain: ${c.domain}`, c.duration && `Duration: ${c.duration}`, period && `Period: ${period}`]
    .filter(Boolean)
    .join("   •   ");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...muted);
  if (details) doc.text(details, W / 2, 128 + (prog.length - 1) * 6, { align: "center" });
  if (c.performance) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...blue);
    doc.text(`Performance: ${c.performance}`, W / 2, 135 + (prog.length - 1) * 6, { align: "center" });
  }

  // Signature (left)
  const sy = 168;
  doc.setFont("times", "italic");
  doc.setFontSize(18);
  doc.setTextColor(...navy);
  doc.text("Badal Wasnik", 60, sy - 4, { align: "center" });
  doc.setDrawColor(...ink);
  doc.setLineWidth(0.3);
  doc.line(32, sy, 88, sy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...ink);
  doc.text("Badal Wasnik", 60, sy + 5, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text("Founder & CEO", 60, sy + 9, { align: "center" });

  // Seal (center)
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.8);
  doc.circle(W / 2, sy - 2, 13);
  doc.setLineWidth(0.3);
  doc.circle(W / 2, sy - 2, 10.5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...gold);
  doc.text("BENNUFLY", W / 2, sy - 4, { align: "center" });
  doc.text("VERIFIED", W / 2, sy + 0.5, { align: "center" });
  doc.setFontSize(5);
  doc.text(fmt(c.issue_date) || "", W / 2, sy + 4.5, { align: "center" });

  // QR (right)
  const url = verificationUrl(c.certificate_id);
  const qr = await QRCode.toDataURL(url, { margin: 0, width: 400, color: { dark: "#0b1226", light: "#ffffff" } });
  doc.addImage(qr, "PNG", W - 62, sy - 26, 26, 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...muted);
  doc.text("Scan to verify", W - 49, sy + 4, { align: "center" });

  // Footer ID
  doc.setFont("courier", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...ink);
  doc.text(`Certificate ID: ${c.certificate_id}   |   Issued: ${fmt(c.issue_date)}`, W / 2, H - 22, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...muted);
  doc.text(`Verify at ${url}`, W / 2, H - 18, { align: "center" });

  if (c.status !== "valid") {
    doc.setTextColor(220, 38, 38);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(60);
    doc.text("REVOKED", W / 2, H / 2 + 10, { align: "center", angle: 20 });
  }

  doc.setProperties({ title: `Certificate ${c.certificate_id}`, author: "Bennufly Technology Pvt. Ltd." });
  doc.save(`Bennufly-Certificate-${c.certificate_id}.pdf`);
}
