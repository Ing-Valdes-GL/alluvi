import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const orderData = await req.json();

    const { 
      email, firstName, lastName, orderRef, date, items, 
      subtotal, discount, shipping, total, paymentMethod, address 
    } = orderData;

    // Génération de la liste des produits en HTML
    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name} <br><strong>× ${item.quantity}</strong></td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">£${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; color: #333;">
        <h1 style="color: #FFA52F;">Thank you for your order</h1>
        <p>Hi ${firstName},</p>
        <p>We’ve received your order and it’s currently on hold until we can confirm your payment has been processed.</p>
        <p>Here’s a reminder of what you’ve ordered:</p>
        
        <h2 style="font-size: 18px; margin-top: 30px;">Order #${orderRef} (${date})</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">Product</th>
              <th style="text-align: right; padding: 8px; border-bottom: 2px solid #ddd;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot style="font-weight: bold;">
            <tr><td style="padding: 8px;">Subtotal:</td><td style="text-align: right;">£${subtotal.toFixed(2)}</td></tr>
            <tr><td style="padding: 8px; color: #FFA52F;">Discount:</td><td style="text-align: right; color: #FFA52F;">-£${discount.toFixed(2)}</td></tr>
            <tr><td style="padding: 8px;">Shipping: Express Delivery</td><td style="text-align: right;">£${shipping.toFixed(2)}</td></tr>
            <tr><td style="padding: 8px; font-size: 18px;">Total:</td><td style="text-align: right; font-size: 18px;">£${total.toFixed(2)}</td></tr>
            <tr><td style="padding: 8px;">Payment method:</td><td style="text-align: right;">${paymentMethod}</td></tr>
          </tfoot>
        </table>

        <div style="display: flex; justify-content: space-between; gap: 20px; margin-top: 30px;">
          <div style="flex: 1;">
            <h3 style="font-size: 16px;">Billing address</h3>
            <p style="margin: 0; line-height: 1.5; color: #555;">
              ${firstName} ${lastName}<br>
              ${address.companyName ? address.companyName + '<br>' : ''}
              ${address.streetAddress}<br>
              ${address.townCity}, ${address.county}<br>
              ${address.postcode}<br>
              ${address.country}<br>
              ${address.phone}<br>
              ${email}
            </p>
          </div>
        </div>

        <p style="margin-top: 40px; font-size: 14px; color: #777;">
          Thanks again! If you need any help with your order, please contact us at <a href="/chat" style="color: #FFA52F;">support@alluvicare.com</a>.<br>
          <strong>Alluvi Health care</strong><br>
          United Kingdom (UK).
        </p>
      </div>
    `;

    const data = await resend.emails.send({
      from: 'Alluvicare Orders <contact@support.alluvihealth.store>', // Remplace par ton domaine vérifié sur Resend
      to: [email],
      subject: `Your Alluvicare Order Receipt #${orderRef}`,
      html: htmlContent,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}