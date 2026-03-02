import React from 'react'
import { Link } from 'react-router-dom'

export const Home: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-oxford-blue text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-serif font-bold mb-6">
            Welcome to City University Club
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            A private members club in the heart of London, offering fine dining, 
            exclusive events, and reciprocal clubs worldwide.
          </p>
          <Link
            to="/login"
            className="bg-cambridge-blue text-oxford-blue px-8 py-3 rounded-lg font-semibold hover:bg-white transition"
          >
            Member Login
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-serif font-bold text-oxford-blue mb-6">
              About Our Club
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              City University Club provides a home away from home for graduates and 
              academics of City, University of London. Located in the historic heart 
              of London, we offer a warm welcome and exceptional facilities.
            </p>
            <Link
              to="/about"
              className="text-oxford-blue font-semibold hover:text-cambridge-blue"
            >
              Learn More →
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="text-xl font-bold text-oxford-blue mb-2">Fine Dining</h3>
              <p className="text-gray-600">
                Enjoy exquisite meals prepared by our talented chefs in our elegant dining room.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-oxford-blue mb-2">Exclusive Events</h3>
              <p className="text-gray-600">
                Attend member-only events, from wine tastings to cultural gatherings.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-oxford-blue mb-2">Reciprocal Clubs</h3>
              <p className="text-gray-600">
                Access over 450 reciprocal clubs worldwide with your membership.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
