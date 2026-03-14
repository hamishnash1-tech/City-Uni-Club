import React from 'react'

export const TermsAndConditions: React.FC = () => (
  <div className="bg-navy-deep pb-20">
    <div className="bg-cambridge/15 pt-7 pb-5 px-4 border-b border-cambridge/20">
      <h1 className="font-serif text-2xl font-normal text-ivory text-center">Terms & Conditions</h1>
    </div>

    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 text-ivory/80 text-sm leading-relaxed">

      <section>
        <p className="label-caps text-cambridge-light/50 mb-1">Last updated: March 2026</p>
        <p>These Terms and Conditions govern your use of the City University Club member portal and all associated services. By accessing or using this platform, you agree to be bound by these terms.</p>
      </section>

      <section>
        <h2 className="font-serif text-ivory text-lg font-normal mb-3">1. Membership</h2>
        <p>Access to this portal is restricted to current members of the City University Club. Membership is subject to the rules and bylaws of the Club as amended from time to time by the Committee. Membership is personal and non-transferable. Sharing of login credentials is strictly prohibited.</p>
      </section>

      <section>
        <h2 className="font-serif text-ivory text-lg font-normal mb-3">2. Dining & Event Bookings</h2>
        <p className="mb-2">The Club makes every effort to ensure the accuracy of booking information presented through this portal. However, the Club accepts no liability for errors, omissions, or failures in the booking system, including but not limited to:</p>
        <ul className="list-disc list-inside space-y-1 text-ivory/70 ml-2">
          <li>Duplicate or missing reservations caused by technical faults</li>
          <li>Incorrect pricing or availability information displayed</li>
          <li>Failure of confirmation communications to be delivered</li>
          <li>Loss or inconvenience arising from system downtime</li>
        </ul>
        <p className="mt-2">All bookings are subject to confirmation by the Club. The Club reserves the right to decline or cancel any reservation at its discretion.</p>
      </section>

      <section>
        <h2 className="font-serif text-ivory text-lg font-normal mb-3">3. Letters of Introduction</h2>
        <p>Letters of Introduction to reciprocal clubs are issued at the sole discretion of the Club Secretary. Issuance of a Letter of Introduction does not guarantee admission to any reciprocal club. The Club accepts no liability for any refusal of entry, costs incurred, or loss suffered in connection with a visit to a reciprocal club.</p>
      </section>

      <section>
        <h2 className="font-serif text-ivory text-lg font-normal mb-3">4. Intellectual Property</h2>
        <p className="mb-2">All content, design, software, and materials on this portal — including but not limited to text, graphics, logos, icons, and source code — are the exclusive property of the City University Club or its licensors and are protected by applicable copyright and intellectual property laws.</p>
        <p className="mb-2">You may not, without the prior written consent of the Club:</p>
        <ul className="list-disc list-inside space-y-1 text-ivory/70 ml-2">
          <li>Copy, reproduce, or redistribute any part of this portal</li>
          <li>Reverse engineer, decompile, or disassemble any software or system</li>
          <li>Scrape, harvest, or systematically extract data from the portal</li>
          <li>Use any automated means to access or interact with the portal</li>
          <li>Frame or mirror the portal on any other website or service</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-ivory text-lg font-normal mb-3">5. Limitation of Liability</h2>
        <p>To the fullest extent permitted by law, the City University Club shall not be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your use of this portal or its services. The Club's aggregate liability in any circumstances shall not exceed the annual membership subscription paid by the member in the relevant membership year.</p>
      </section>

      <section>
        <h2 className="font-serif text-ivory text-lg font-normal mb-3">6. Governing Law</h2>
        <p>These Terms and Conditions are governed by and construed in accordance with the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
      </section>

      <section>
        <h2 className="font-serif text-ivory text-lg font-normal mb-3">7. Changes to These Terms</h2>
        <p>The Club reserves the right to amend these Terms and Conditions at any time. Continued use of the portal following notification of changes constitutes acceptance of the revised terms.</p>
      </section>

      <section className="border-t border-cambridge/20 pt-6">
        <p className="text-ivory/50">For queries regarding these terms, please contact the Club Secretary at <span className="text-cambridge-light">secretary@cityuniversityclub.co.uk</span>.</p>
      </section>

    </div>
  </div>
)
