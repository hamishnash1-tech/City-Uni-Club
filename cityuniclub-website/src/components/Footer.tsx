import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-oxford-blue text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact */}
          <div>
            <h3 className="text-xl font-serif font-bold mb-4">Contact Us</h3>
            <p className="mb-2">42 Crutched Friars</p>
            <p className="mb-2">London EC3N 2AP</p>
            <p className="mb-2">020 7488 1770</p>
            <p>secretary@cityuniversityclub.co.uk</p>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-xl font-serif font-bold mb-4">Opening Hours</h3>
            <p className="mb-2">Tuesday - Friday</p>
            <p>9:00 AM - 5:00 PM</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-serif font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="hover:text-cambridge-blue">About</a></li>
              <li><a href="/dining" className="hover:text-cambridge-blue">Dining</a></li>
              <li><a href="/events" className="hover:text-cambridge-blue">Events</a></li>
              <li><a href="/login" className="hover:text-cambridge-blue">Member Login</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} City University Club. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
