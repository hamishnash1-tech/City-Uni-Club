import React from 'react'

export const PrivacyPolicy: React.FC = () => (
  <div className="pb-20">
    <div className="bg-cambridge/15 pt-7 pb-5 px-4 border-b border-cambridge/20">
      <h1 className="font-serif text-2xl font-normal text-ivory text-center">Privacy Policy</h1>
    </div>

    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 text-ivory/80 text-sm leading-relaxed">

      <section>
        <p className="label-caps text-cambridge-light/50 mb-1">Last updated: March 2026</p>
        <p>The City University Club ("the Club", "we", "us") is committed to protecting your personal data and respecting your privacy. This policy explains how we collect, use, and safeguard information in connection with your membership and use of our member portal, in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.</p>
      </section>

      <section>
        <h2 className="font-serif text-ivory text-lg font-normal mb-3">1. Data Controller</h2>
        <p>The City University Club, 42 Crutched Friars, London EC3N 2AP, is the data controller responsible for your personal data. Our data protection contact is the Club Secretary at <span className="text-cambridge-light">secretary@cityuniversityclub.co.uk</span>.</p>
      </section>

      <section>
        <h2 className="font-serif text-ivory text-lg font-normal mb-3">2. Data We Collect</h2>
        <p className="mb-2">We collect and process the following categories of personal data:</p>
        <ul className="list-disc list-inside space-y-1 text-ivory/70 ml-2">
          <li>Identity data: full name, membership number, membership type</li>
          <li>Contact data: email address</li>
          <li>Account data: login credentials (passwords are hashed and never stored in plain text)</li>
          <li>Transaction data: dining reservations, event registrations, Letters of Introduction requests</li>
          <li>Usage data: pages accessed, login timestamps, and activity logs for security purposes</li>
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-ivory text-lg font-normal mb-3">3. How We Use Your Data</h2>
        <p className="mb-2">We process your personal data for the following purposes:</p>
        <ul className="list-disc list-inside space-y-1 text-ivory/70 ml-2">
          <li><strong className="text-ivory/90">Contract performance:</strong> administering your membership, processing bookings and requests</li>
          <li><strong className="text-ivory/90">Legitimate interests:</strong> maintaining the security of the portal, preventing fraud, communicating service updates</li>
          <li><strong className="text-ivory/90">Legal obligation:</strong> retaining records as required by applicable law</li>
        </ul>
        <p className="mt-2">We do not use your data for marketing without your explicit consent, and we do not sell or share your data with third parties for their own marketing purposes.</p>
      </section>

      <section>
        <h2 className="font-serif text-ivory text-lg font-normal mb-3">4. Data Retention</h2>
        <p>We retain your personal data for as long as your membership is active and for a reasonable period thereafter, or as otherwise required by law. Reservation and transaction records are retained in accordance with applicable financial record-keeping obligations.</p>
        <p className="mt-2">To exercise your UK GDPR rights, please contact the Club Secretary.</p>
      </section>

      <section>
        <h2 className="font-serif text-ivory text-lg font-normal mb-3">5. Third-Party Services</h2>
        <p>We use third-party service providers to host this portal and process data on our behalf under appropriate data processing agreements. Data is stored on servers within the European Economic Area. We do not transfer your personal data outside the UK or EEA without appropriate safeguards.</p>
      </section>

      <section>
        <h2 className="font-serif text-ivory text-lg font-normal mb-3">6. Security</h2>
        <p>We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, or disclosure. All data in transit is encrypted via HTTPS. Access to member data is restricted to authorised Club staff and trusted third parties where necessary for the operation of Club services.</p>
      </section>

      <section>
        <h2 className="font-serif text-ivory text-lg font-normal mb-3">7. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. Material changes will be communicated to members.</p>
      </section>

    </div>
  </div>
)
