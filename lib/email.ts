/**
 * Email Service for Campus BookShare
 * Integrates with Resend API when RESEND_API_KEY is configured.
 * Automatically falls back to formatted console logging if no key is set.
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey.startsWith("re_your_") || apiKey.includes("placeholder")) {
    console.log("\n=======================================================");
    console.log(`[EMAIL FALLBACK - CONSOLE LOG]`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`SENT AT: ${new Date().toISOString()}`);
    console.log("=======================================================\n");
    return { success: true, id: `mock-${Date.now()}` };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Campus BookShare <notifications@campusbookshare.internal>",
        to: [to],
        subject,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.warn("Resend API returned error:", data);
      return { success: false, error: data.message || "Failed to send email" };
    }

    return { success: true, id: data.id };
  } catch (err: any) {
    console.error("Email send exception:", err);
    return { success: false, error: err.message };
  }
}

// =======================================================
// BRANDED HTML EMAIL TEMPLATES
// =======================================================

function renderBaseTemplate(title: string, bodyContent: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF6EE;font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#2B2B2B;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#FAF6EE;padding:24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#FFFFFF;border-radius:16px;border:1px solid #E7DFD1;overflow:hidden;box-shadow:0 4px 20px -2px rgba(31,42,68,0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color:#1F2A44;padding:24px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;">
                Campus BookShare
              </h1>
              <p style="margin:4px 0 0 0;font-size:11px;color:#E9A23B;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
                Campus Peer-to-Peer Novel Club
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 24px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#F5EFE0;padding:18px 24px;text-align:center;font-size:11px;color:#666666;border-top:1px solid #E7DFD1;">
              <p style="margin:0;">Campus BookShare • Student Library Community</p>
              <p style="margin:4px 0 0 0;">Safe campus handovers • Offline verified UPI payments</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function templateDueIn2Days(borrowerName: string, bookTitle: string, dueDate: string): string {
  const body = `
    <h2 style="margin:0 0 12px 0;font-size:18px;color:#1F2A44;">Reminder: Due in 2 Days 📖</h2>
    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#2B2B2B;">
      Hi <strong>${borrowerName}</strong>, your rental period for <strong style="color:#1F2A44;">"${bookTitle}"</strong> is ending soon on <strong style="color:#E9A23B;">${dueDate}</strong>.
    </p>
    <div style="background-color:#FAF6EE;border-left:4px solid #E9A23B;padding:14px;border-radius:8px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#2B2B2B;">
        Please coordinate with the lender to meet at a campus handover point before or on the due date to avoid late fees.
      </p>
    </div>
    <p style="margin:0;font-size:13px;color:#666666;">
      Happy reading,<br>Campus BookShare Team
    </p>
  `;
  return renderBaseTemplate("Due in 2 Days - Campus BookShare", body);
}

export function templateDueToday(borrowerName: string, bookTitle: string): string {
  const body = `
    <h2 style="margin:0 0 12px 0;font-size:18px;color:#1F2A44;">Due Today! ⏰</h2>
    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#2B2B2B;">
      Hi <strong>${borrowerName}</strong>, your rented novel <strong style="color:#1F2A44;">"${bookTitle}"</strong> is due back <strong>today</strong>.
    </p>
    <div style="background-color:#FAF6EE;border-left:4px solid #2A9D8F;padding:14px;border-radius:8px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#2B2B2B;">
        Hand the book back to your campus peer today to ensure on-time return status.
      </p>
    </div>
    <p style="margin:0;font-size:13px;color:#666666;">
      Thank you for being a responsible reader,<br>Campus BookShare Team
    </p>
  `;
  return renderBaseTemplate("Due Today - Campus BookShare", body);
}

export function templateOverdue(borrowerName: string, bookTitle: string, lateFee: number, totalDue: number): string {
  const body = `
    <h2 style="margin:0 0 12px 0;font-size:18px;color:#D96C4A;">Action Required: Novel Overdue ⚠️</h2>
    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#2B2B2B;">
      Hi <strong>${borrowerName}</strong>, your rental for <strong style="color:#1F2A44;">"${bookTitle}"</strong> has passed its due date.
    </p>
    <div style="background-color:#FAECE8;border:1px solid #D96C4A;padding:16px;border-radius:12px;margin-bottom:20px;">
      <p style="margin:0 0 6px 0;font-size:14px;font-weight:bold;color:#D96C4A;">
        Accumulated Late Fee: ₹${lateFee} (accrues daily at ₹2/day)
      </p>
      <p style="margin:0;font-size:13px;color:#2B2B2B;">
        Total Amount Due: <strong>₹${totalDue}</strong>. Late fees are collected offline upon return and split with the lender.
      </p>
    </div>
    <p style="margin:0;font-size:13px;color:#666666;">
      Please arrange the return with your lender immediately.
    </p>
  `;
  return renderBaseTemplate("Novel Overdue Alert - Campus BookShare", body);
}

export function templateLenderOverdueAlert(lenderName: string, borrowerName: string, bookTitle: string): string {
  const body = `
    <h2 style="margin:0 0 12px 0;font-size:18px;color:#1F2A44;">Your Novel is Overdue Notice</h2>
    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#2B2B2B;">
      Hi <strong>${lenderName}</strong>, your novel <strong style="color:#1F2A44;">"${bookTitle}"</strong> rented to <strong>${borrowerName}</strong> is now overdue.
    </p>
    <div style="background-color:#FAF6EE;border-left:4px solid #D96C4A;padding:14px;border-radius:8px;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#2B2B2B;">
        We have dispatched an overdue reminder to the borrower. Late fees accrue daily, and you receive a 50% share of late fees upon confirmed return.
      </p>
    </div>
  `;
  return renderBaseTemplate("Overdue Notice - Campus BookShare", body);
}

export function templatePaymentConfirmed(borrowerName: string, bookTitle: string, dueDate: string): string {
  const body = `
    <h2 style="margin:0 0 12px 0;font-size:18px;color:#2A9D8F;">Payment Confirmed! Pickup Unlocked 🎉</h2>
    <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#2B2B2B;">
      Hi <strong>${borrowerName}</strong>, your offline payment for <strong style="color:#1F2A44;">"${bookTitle}"</strong> has been confirmed by the campus admin!
    </p>
    <div style="background-color:#E8F5F3;border:1px solid #2A9D8F;padding:16px;border-radius:12px;margin-bottom:20px;">
      <p style="margin:0 0 6px 0;font-size:13px;color:#2B2B2B;">
        <strong>Due Date:</strong> ${dueDate}
      </p>
      <p style="margin:0;font-size:13px;color:#2B2B2B;">
        You can now meet your campus lender to pick up the book.
      </p>
    </div>
  `;
  return renderBaseTemplate("Payment Confirmed - Campus BookShare", body);
}

