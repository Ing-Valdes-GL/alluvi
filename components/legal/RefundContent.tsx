'use client'

import { AlertTriangle, PackageX, Ban, Clock, Truck, ShieldAlert } from 'lucide-react'

export default function RefundContent() {
  return (
    <div className="space-y-8 text-slate-700">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Refund & Return Policy</h2>
        <p className="text-sm text-slate-500">Last updated: April 2, 2026</p>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-800 uppercase tracking-wide">
                Strict No-Return Policy for Chemical Compounds
              </p>
              <p className="text-sm text-red-700 mt-1">
                Due to the nature of research chemicals and UK regulatory requirements, 
                <strong> all sales are final</strong>. Please read this policy carefully before purchasing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: General Policy */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Ban className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-bold text-slate-900">1. All Sales Are Final</h3>
        </div>
        <div className="pl-8 space-y-3 text-sm leading-relaxed">
          <p>
            Vertex Biolabs operates a <strong>strict no-return, no-refund policy</strong> for all research compounds. 
            Once an order has been placed and payment processed, it cannot be cancelled, returned, or refunded except 
            under the specific limited circumstances outlined in Section 3 below.
          </p>
          <p className="font-semibold text-slate-900">This policy is necessitated by:</p>
          <ul className="pl-4 space-y-2 list-disc list-inside">
            <li><strong>Health & Safety Regulations:</strong> Chemical compounds cannot be restocked once shipped due to potential contamination risks</li>
            <li><strong>UK Controlled Substances Act:</strong> Strict chain-of-custody requirements prevent return of chemical substances</li>
            <li><strong>Quality Assurance:</strong> We cannot verify the integrity of returned compounds for resale</li>
            <li><strong>Research Integrity:</strong> Chemical stability and storage conditions during transit cannot be guaranteed for returns</li>
          </ul>
        </div>
      </section>

      {/* Section 2: Order Cancellation */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-bold text-slate-900">2. Order Cancellation Window</h3>
        </div>
        <div className="pl-8 space-y-3 text-sm leading-relaxed">
          <p>
            Orders may only be cancelled within <strong>2 hours</strong> of placement, provided the order status 
            remains &ldquo;Processing&rdquo; and has not entered the fulfillment pipeline.
          </p>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="font-semibold text-slate-900 text-xs uppercase tracking-wide mb-2">Cancellation Process:</p>
            <ol className="pl-4 space-y-1 text-sm list-decimal list-inside">
              <li>Contact us immediately via support chat with your order reference</li>
              <li>Provide reason for cancellation (research project cancellation, ordering error, etc.)</li>
              <li>Wait for confirmation from our team before considering the cancellation approved</li>
            </ol>
          </div>
          <p className="text-orange-700 font-medium">
            Orders marked as &ldquo;Shipped&rdquo; or &ldquo;In Transit&rdquo; cannot be cancelled under any circumstances.
          </p>
        </div>
      </section>

      {/* Section 3: Damaged or Incorrect Shipments */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <PackageX className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-bold text-slate-900">3. Damaged or Incorrect Orders</h3>
        </div>
        <div className="pl-8 space-y-3 text-sm leading-relaxed">
          <p>
            While all sales are final, we recognize that errors or shipping damage may occur. 
            The following exceptions apply:
          </p>
          
          <div className="space-y-4">
            <div className="border-l-4 border-orange-400 pl-4">
              <p className="font-semibold text-slate-900">3.1 Damaged in Transit</p>
              <p className="text-sm text-slate-600 mt-1">
                If your order arrives with visible damage to packaging or containers, you must:
              </p>
              <ul className="pl-4 mt-2 space-y-1 text-sm list-disc list-inside">
                <li>Photograph the damaged packaging before opening</li>
                <li>Photograph damaged containers with batch numbers visible</li>
                <li>Report within 24 hours of delivery via support chat</li>
                <li>Provide order reference and photos for assessment</li>
              </ul>
              <p className="text-sm text-slate-600 mt-2">
                Approved claims will result in replacement shipment or store credit at our discretion. 
                <strong>No cash refunds will be issued.</strong>
              </p>
            </div>

            <div className="border-l-4 border-orange-400 pl-4">
              <p className="font-semibold text-slate-900">3.2 Incorrect Product Shipped</p>
              <p className="text-sm text-slate-600 mt-1">
                If you receive a product different from what was ordered:
              </p>
              <ul className="pl-4 mt-2 space-y-1 text-sm list-disc list-inside">
                <li>Do not open the incorrect product packaging</li>
                <li>Report within 48 hours of delivery</li>
                <li>Provide photos of received product labels</li>
                <li>We will arrange collection and ship correct product</li>
              </ul>
            </div>

            <div className="border-l-4 border-orange-400 pl-4">
              <p className="font-semibold text-slate-900">3.3 Missing Items</p>
              <p className="text-sm text-slate-600 mt-1">
                If your order is incomplete upon arrival:
              </p>
              <ul className="pl-4 mt-2 space-y-1 text-sm list-disc list-inside">
                <li>Check packing list against received items</li>
                <li>Report within 24 hours with photos of package contents</li>
                <li>Missing items will be shipped at our expense</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Research Use Only */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-bold text-slate-900">4. No Returns Based on Research Results</h3>
        </div>
        <div className="pl-8 space-y-3 text-sm leading-relaxed">
          <p className="font-semibold text-slate-900">
            Returns will NOT be accepted for the following reasons:
          </p>
          <ul className="pl-4 space-y-2 text-sm list-disc list-inside">
            <li>Unsatisfactory research results or experimental outcomes</li>
            <li>Change in research project requirements or cancellation</li>
            <li>Product no longer needed for intended study</li>
            <li>Dissatisfaction with compound purity levels (all products meet stated specifications)</li>
            <li>Inability to obtain institutional approval for research</li>
            <li>Financial difficulties or budget cuts</li>
          </ul>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> Research compounds are sold on an &ldquo;as-is&rdquo; basis for research purposes only. 
              We make no guarantees regarding suitability for any specific research application. 
              It is the purchaser&rsquo;s responsibility to verify compound specifications match their research requirements 
              <em>before</em> placing an order.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Shipping & Customs */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-[#0ea5e9]" />
          <h3 className="text-lg font-bold text-slate-900">5. Shipping & Customs Issues</h3>
        </div>
        <div className="pl-8 space-y-3 text-sm leading-relaxed">
          <p><strong>Customs Seizures:</strong> If your order is seized by customs authorities in the destination country:</p>
          <ul className="pl-4 space-y-2 list-disc list-inside">
            <li>You are responsible for ensuring compliance with local import regulations</li>
            <li>We are not liable for customs duties, taxes, or seizure penalties</li>
            <li>No refunds will be issued for orders seized by customs</li>
            <li>Provide accurate documentation to assist with customs clearance when possible</li>
          </ul>
          <p className="mt-3"><strong>Undeliverable Addresses:</strong> Orders returned to us due to incorrect address 
          provided by the customer will be subject to re-shipping fees. No refunds for original shipping costs.</p>
        </div>
      </section>

      {/* Section 6: Store Credit */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">6. Store Credit Policy</h3>
        <div className="pl-8 space-y-3 text-sm leading-relaxed">
          <p>
            In approved exception cases (damaged goods, incorrect shipment), we may issue store credit 
            at our sole discretion:
          </p>
          <ul className="pl-4 space-y-2 list-disc list-inside">
            <li>Store credit never expires and can be used for any future purchase</li>
            <li>Credit is non-transferable and tied to the original purchaser&rsquo;s account</li>
            <li>Credit cannot be converted to cash or refunded to payment methods</li>
            <li>Credit will be applied automatically at checkout for logged-in users</li>
          </ul>
        </div>
      </section>

      {/* Section 7: Contact */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">7. Policy Inquiries & Disputes</h3>
        <div className="pl-8 space-y-3 text-sm leading-relaxed">
          <p>
            For questions about this policy or to report a damaged/incorrect order, contact us immediately:
          </p>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="font-semibold text-slate-900">Vertex Biolabs Customer Resolution</p>
            <p>Email: support@vertexbiolabs.com</p>
            <p>Secure Chat: Available 24/7 via website chat widget</p>
            <p className="text-slate-500 mt-2 text-xs">
              Response time: 24-48 hours for email inquiries. Immediate for urgent chat requests.
            </p>
          </div>
          <p className="text-sm text-slate-600 italic">
            By placing an order with Vertex Biolabs, you acknowledge that you have read, understood, 
            and agree to be bound by this Refund & Return Policy.
          </p>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-slate-200 pt-6 text-xs text-slate-500">
        <p>This Refund Policy is subject to UK Consumer Rights Act 2015 where applicable to consumers. 
        Business purchasers agree to these terms as part of their supply contract with Vertex Biolabs Ltd.</p>
      </div>
    </div>
  )
}
