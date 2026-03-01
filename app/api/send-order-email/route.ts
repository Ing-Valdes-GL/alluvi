import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialisation de Resend avec ta clé d'API
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order, type, reason } = body;

    // LOG de débogage pour voir ce qui arrive réellement dans l'API sur Vercel
    console.log("Requête reçue pour email:", { 
      to: order?.email_address, 
      type: type, 
      ref: order?.reference_code 
    });

    // 1. Vérification stricte des données essentielles
    if (!order?.email_address) {
      return NextResponse.json({ error: "Email destinataire manquant" }, { status: 400 });
    }

    if (!order?.reference_code) {
      return NextResponse.json({ error: "Référence de commande manquante" }, { status: 400 });
    }

    // 2. Normalisation du type (évite les erreurs de majuscules/minuscules)
    const normalizedType = type?.toUpperCase();
    const isConfirmation = normalizedType === 'CONFIRMATION';

    // 3. Sécurisation du montant (évite le crash si total_amount est null ou string)
    const amount = Number(order.total_amount);
    const displayAmount = !isNaN(amount) ? amount.toFixed(2) : "0.00";

    // 4. Préparation du sujet et du contenu
    const subject = isConfirmation 
      ? `Order Confirmed - #${order.reference_code}` 
      : `Order Cancelled - #${order.reference_code}`;

    const emailContent = isConfirmation 
      ? `
        <div style="font-family: sans-serif; max-width: 600px; color: #1a1a1a; line-height: 1.6;">
          <h1 style="letter-spacing: -1px; text-transform: uppercase; color: #10b981;">Thank you for your order</h1>
          <p>Your order <strong>#${order.reference_code}</strong> has been successfully verified and confirmed.</p>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #eee;">
            <p style="margin: 0; font-size: 12px; text-transform: uppercase; opacity: 0.6; font-weight: bold;">Total Amount Paid</p>
            <p style="margin: 0; font-size: 28px; font-weight: bold; color: #000;">£${displayAmount}</p>
          </div>
          <p><strong>Shipping Status:</strong> Your package is currently being prepared by our pharmaceutical logistics team for immediate dispatch.</p>
          <br/>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 11px; color: #999; margin-top: 20px;">Alluvi Health-Care | Secured Pharmaceutical Logistics | This is an automated confirmation.</p>
        </div>
      `
      : `
        <div style="font-family: sans-serif; max-width: 600px; color: #1a1a1a; line-height: 1.6;">
          <h1 style="letter-spacing: -1px; text-transform: uppercase; color: #ef4444;">Order Cancellation</h1>
          <p>We regret to inform you that your order <strong>#${order.reference_code}</strong> has been cancelled.</p>
          <div style="background: #fff5f5; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #ef4444;">Reason for cancellation:</p>
            <p style="margin: 10px 0 0 0; color: #7f1d1d;">${reason || "Non-compliance with safety protocols or verification failure."}</p>
          </div>
          <p>If you have already been charged, a refund will be processed automatically within 3-5 business days.</p>
          <p>Contact our support department if you believe this is an error.</p>
          <br/>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 11px; color: #999; margin-top: 20px;">Alluvi Health-Care | Administration Department | Security Division</p>
        </div>
      `;

    // 5. Envoi via Resend avec gestion d'erreur spécifique
    const { data, error } = await resend.emails.send({
      from: 'Alluvi Health-Care <contact@support.alluvihealth.store>',
      to: [order.email_address],
      subject: subject,
      html: emailContent,
    });

    if (error) {
      console.error("Détails de l'erreur Resend:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Email (${normalizedType}) envoyé avec succès à ${order.email_address}`);
    return NextResponse.json({ success: true, data });

  } catch (err: any) {
    console.error("Erreur fatale dans l'API Email:", err.message);
    return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
  }
}