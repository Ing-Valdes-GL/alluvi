'use client'

import { Shield, Lock, Eye, Database, UserCheck, AlertTriangle } from 'lucide-react'

export default function PrivacyContent() {
  return (
    <div className="space-y-8 text-slate-700">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Privacy Policy</h2>
        <p className="text-sm text-slate-500">Last updated: April 2, 2026</p>
        <p className="text-sm text-slate-600 mt-4">
          Vertex Biolabs (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy. 
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
          and purchase research compounds. By using our services, you consent to the practices described in this policy.
        </p>
      </div>

      {/* Section 1: Information We Collect */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-[#0ea5e9]" />
          <h3 className="text-lg font-bold text-slate-900">1. Information We Collect</h3>
        </div>
        <div className="pl-8 space-y-3 text-sm leading-relaxed">
          <p><strong>Personal Information:</strong> We collect your name, billing address, shipping address, email address, 
          phone number, payment information, and age verification details when you place an order or create an account.</p>
          <p><strong>Research Credentials:</strong> For certain restricted compounds, we may collect institutional affiliation, 
          research purpose declarations, and laboratory certification numbers to ensure compliance with UK research chemical regulations.</p>
          <p><strong>Technical Data:</strong> IP address, browser type, device information, and cookies to enhance security and improve our services.</p>
          <p><strong>Order History:</strong> Records of your purchases, quantities, and preferences for compliance monitoring and customer service.</p>
        </div>
      </section>

      {/* Section 2: How We Use Your Information */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-[#0ea5e9]" />
          <h3 className="text-lg font-bold text-slate-900">2. How We Use Your Information</h3>
        </div>
        <ul className="pl-8 space-y-2 text-sm leading-relaxed list-disc list-inside">
          <li>Process and fulfill your orders for research compounds</li>
          <li>Verify your age and identity for regulatory compliance</li>
          <li>Communicate order updates, shipping notifications, and support responses</li>
          <li>Maintain records required by UK pharmaceutical and chemical control legislation</li>
          <li>Detect and prevent fraud, unauthorized purchases, or misuse of research compounds</li>
          <li>Improve our product offerings and website functionality</li>
          <li>Comply with legal obligations and law enforcement requests when required</li>
        </ul>
      </section>

      {/* Section 3: Laboratory Research Use Only */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-bold text-slate-900">3. Laboratory Research Use Only Declaration</h3>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-orange-800">
            ALL PRODUCTS SOLD BY VERTEX BIOLABS ARE INTENDED EXCLUSIVELY FOR LABORATORY RESEARCH PURPOSES.
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            By purchasing from Vertex Biolabs, you explicitly acknowledge and agree that:
          </p>
          <ul className="pl-4 space-y-2 text-sm text-slate-700 leading-relaxed list-disc list-inside">
            <li>All compounds are strictly for in-vitro research and laboratory analysis</li>
            <li>Products are NOT for human consumption, veterinary use, or any in-vivo application</li>
            <li>You are a qualified researcher, laboratory professional, or institutional purchaser</li>
            <li>You will store all compounds securely and in accordance with safety data sheets</li>
            <li>You assume full legal and ethical responsibility for proper handling and disposal</li>
          </ul>
          <p className="text-sm text-orange-700 font-medium mt-2">
            Misrepresentation of research intent or diversion for non-research purposes may result in 
            account termination, reporting to authorities, and permanent ban from future purchases.
          </p>
        </div>
      </section>

      {/* Section 4: Age Verification */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <UserCheck className="w-5 h-5 text-[#0ea5e9]" />
          <h3 className="text-lg font-bold text-slate-900">4. Age Verification & Eligibility</h3>
        </div>
        <div className="pl-8 space-y-3 text-sm leading-relaxed">
          <p><strong>Minimum Age:</strong> You must be at least 21 years of age to purchase from Vertex Biolabs. 
          By placing an order, you certify that you meet this age requirement.</p>
          <p><strong>Verification Process:</strong> We employ third-party age verification services and may request 
          government-issued photo identification for high-value orders or restricted compounds.</p>
          <p><strong>Institutional Accounts:</strong> University and corporate accounts must provide valid institutional 
          email addresses and may be subject to additional verification of research credentials.</p>
          <p><strong>Failed Verification:</strong> Orders failing age verification will be cancelled and refunded. 
            Repeated failed attempts may result in account suspension.</p>
        </div>
      </section>

      {/* Section 5: Data Security */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-[#0ea5e9]" />
          <h3 className="text-lg font-bold text-slate-900">5. Data Security & Retention</h3>
        </div>
        <div className="pl-8 space-y-3 text-sm leading-relaxed">
          <p>We implement industry-standard encryption (AES-256) and secure server infrastructure to protect your data. 
          Payment information is processed through PCI-DSS compliant gateways and never stored on our servers.</p>
          <p><strong>Retention Period:</strong> Order records are retained for 7 years as required by UK tax and 
          pharmaceutical control regulations. Marketing data is retained until you opt out or delete your account.</p>
          <p><strong>Breach Notification:</strong> In the unlikely event of a data breach, we will notify affected 
          users within 72 hours in accordance with UK GDPR requirements.</p>
        </div>
      </section>

      {/* Section 6: Your Rights */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#0ea5e9]" />
          <h3 className="text-lg font-bold text-slate-900">6. Your Data Protection Rights</h3>
        </div>
        <div className="pl-8 space-y-3 text-sm leading-relaxed">
          <p>Under UK GDPR and the Data Protection Act 2018, you have the right to:</p>
          <ul className="pl-4 space-y-1 text-sm list-disc list-inside">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your data (subject to legal retention requirements)</li>
            <li>Object to processing for marketing purposes</li>
            <li>Request data portability where applicable</li>
            <li>Lodge a complaint with the Information Commissioner&rsquo;s Office (ICO)</li>
          </ul>
          <p className="mt-2">To exercise these rights, contact us at <strong>privacy@vertexbiolabs.com</strong> 
          or through our secure support chat.</p>
        </div>
      </section>

      {/* Section 7: Contact */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">7. Contact Information</h3>
        <div className="bg-slate-50 rounded-xl p-4 text-sm">
          <p className="font-semibold text-slate-900">Vertex Biolabs Data Protection Officer</p>
          <p>Email: privacy@vertexbiolabs.com</p>
          <p>Address: 123 Research Way, Cambridge Science Park, CB4 0GZ, United Kingdom</p>
          <p className="mt-2 text-slate-500">For general inquiries, please use our support chat or email support@vertexbiolabs.com</p>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-slate-200 pt-6 text-xs text-slate-500">
        <p>This Privacy Policy is governed by the laws of England and Wales. Any disputes shall be resolved 
        in the courts of the United Kingdom.</p>
      </div>
    </div>
  )
}
