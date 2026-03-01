import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialisation de Resend avec ta clé d'API
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { order, type, reason } = await req.json();

    if (!order?.email_address) {
      return NextResponse.json({ error: "Email manquant" }, { status: 400 });
    }

    const subject = type === 'CONFIRMATION' 
      ? `Order Confirmed - #${order.reference_code}` 
      : `Order Cancelled - #${order.reference_code}`;

    const emailContent = type === 'CONFIRMATION' 
      ? `
        <div style="font-family: sans-serif; max-width: 600px; color: #1a1a1a;">
          <h1 style="letter-spacing: -1px; text-transform: uppercase;">Thank you for your order</h1>
          <p>Your order <strong>#${order.reference_code}</strong> has been successfully verified and confirmed.</p>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; text-transform: uppercase; opacity: 0.6;">Total Amount</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold;">£${Number(order.total_amount).toFixed(2)}</p>
          </div>
          <p><strong>Shipping Status:</strong> Your package is being prepared for dispatch.</p>
          <br/>
          <p style="font-size: 12px; opacity: 0.5;">Alluvi Health-Care | Secured Pharmaceutical Logistics</p>
        </div>
      `
      : `
        <div style="font-family: sans-serif; max-width: 600px; color: #1a1a1a;">
          <h1 style="letter-spacing: -1px; text-transform: uppercase; color: #ff0000;">Order Cancellation</h1>
          <p>We regret to inform you that your order <strong>#${order.reference_code}</strong> has been cancelled.</p>
          <div style="background: #fff0f0; border-left: 4px solid #ff0000; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">Reason for cancellation:</p>
            <p style="margin: 10px 0 0 0;">${reason}</p>
          </div>
          <p>Contact our support if you believe this is an error.</p>
          <br/>
          <p style="font-size: 12px; opacity: 0.5;">Alluvi Health-Care | Administration Department</p>
        </div>
      `;

    // ENVOI RÉEL VIA RESEND
    const { data, error } = await resend.emails.send({
      from: 'Alluvi Health-Care <support@alluvihealth.store>', // Ou ton domaine vérifié
      to: [order.email_address],
      subject: subject,
      html: emailContent,
    });

    if (error) {
      console.error("Erreur Resend:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    console.log(`Email envoyé avec succès à ${order.email_address}`);
    
    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}