import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700">
      <Head>
        <title>Garage-Vision | Revolutionize Your Garage</title>
        <meta name="description" content="Revolutionize your garage operations with Garage-Vision. Streamline jobs, manage parts, and boost profitability." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      {/* Header */}
      <header className="flex items-center justify-between px-4 lg:px-6 py-3 text-white">
        <div className="flex items-center">
          <img src="/logo.png" alt="Garage Vision Logo" className="h-6 lg:h-8 w-auto mr-2 lg:mr-3" />
          <span className="text-lg lg:text-xl font-bold">Garage Vision</span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-2 lg:space-x-4 text-sm">
          <Link href="/login" className="bg-white text-blue-900 px-3 lg:px-4 py-2 rounded-full hover:bg-gray-100 transition text-xs lg:text-sm">
            Garage Login
          </Link>
          <Link href="/local/login" className="bg-white text-blue-900 px-3 lg:px-4 py-2 rounded-full hover:bg-gray-100 transition text-xs lg:text-sm">
            Car Owner Login
          </Link>
          <Link href="/fleet/login" className="bg-white text-blue-900 px-3 lg:px-4 py-2 rounded-full hover:bg-gray-100 transition text-xs lg:text-sm">
            Company Login
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-blue-800 rounded"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-800 border-t border-blue-700">
          <nav className="flex flex-col space-y-2 p-4">
            <Link 
              href="/login" 
              className="bg-white text-blue-900 px-4 py-3 rounded-full hover:bg-gray-100 transition text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Garage Login
            </Link>
            <Link 
              href="/local/login" 
              className="bg-white text-blue-900 px-4 py-3 rounded-full hover:bg-gray-100 transition text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Car Owner Login
            </Link>
            <Link 
              href="/fleet/login" 
              className="bg-white text-blue-900 px-4 py-3 rounded-full hover:bg-gray-100 transition text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Company Login
            </Link>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-12 lg:py-20 px-4 lg:px-6">
        <div className="container mx-auto flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 space-y-4 lg:space-y-6 text-white text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Revolutionize Your Garage. Own Your Future.
            </h1>
            <p className="text-base lg:text-lg opacity-90">
              From first tap to final drive-away, Garage-Vision orchestrates every phase
              of your repair shop with precision, power, and profitability.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center lg:justify-start">
              <Link href="/login" className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition text-center">
                Garage Login
              </Link>
              <Link href="/local/login" className="bg-white text-blue-900 px-6 py-3 rounded-full hover:bg-gray-100 transition text-center">
                Car Owner Login
              </Link>
              <Link href="/fleet/login" className="bg-white text-blue-900 px-6 py-3 rounded-full hover:bg-gray-100 transition text-center">
                Company Login
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 mt-8 lg:mt-0 flex justify-center">
            <img src="/mechanic cards.png" alt="Mechanic illustration" className="max-w-sm lg:max-w-md w-full rounded-2xl shadow-xl" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 lg:py-16 bg-gray-50 text-gray-900">
        <div className="container mx-auto px-4 lg:px-6">
          <h2 className="text-2xl lg:text-3xl font-semibold text-center mb-8 lg:mb-12">Why Every Shop Deserves Garage-Vision</h2>
          <div className="grid gap-6 lg:gap-8 md:grid-cols-2">
            <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-bold mb-2">Mechanic Tools</h3>
              <p className="text-sm lg:text-base">
                Slash admin overhead by 20%—jobs auto-assign, parts auto-order,
                invoices auto-generate, and your team works at peak power.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-bold mb-2">Vehicle Dispatch</h3>
              <p className="text-sm lg:text-base">
                Customers track their vehicle in real time—no more endless
                where is my car calls. Satisfaction scores skyrocket.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-bold mb-2">Analytics Dashboard</h3>
              <p className="text-sm lg:text-base">
                Dashboards reveal your most profitable services and busiest hours—pivot
                instantly to maximize revenue per bay.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-bold mb-2">Team Collaboration</h3>
              <p className="text-sm lg:text-base">Ditch whiteboards and silos. Your shop—powered by a unified workflow that just works.</p>
            </div>
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-6 flex justify-center">
          <img src="/web-header-image.png" alt="App preview" className="max-w-2xl lg:max-w-4xl w-full rounded-2xl shadow-2xl" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 text-gray-900">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-10">See the Impact</h2>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 text-center">
            <div>
              <h3 className="text-2xl font-bold text-blue-600">+80%</h3>
              <p>Time Saved</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-600">+35%</h3>
              <p>More Jobs Completed</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-600">4.9/5</h3>
              <p>Average Rating</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-600">250+</h3>
              <p>Garages Running</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white text-gray-900">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-10">What Our Customers Say</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <blockquote className="bg-gray-50 rounded-2xl p-6 shadow">
              <p>
                Garage-Vision transformed our shop overnight. Jobs flow seamlessly and
                customers love the transparency. It&apos;s literally the heart of our
                operation.
              </p>
              <footer className="mt-4 font-semibold">— AutoTech Repairs</footer>
            </blockquote>
            <blockquote className="bg-gray-50 rounded-2xl p-6 shadow">
              <p>
                We&apos;ve doubled our throughput without adding staff. The analytics module
                pinpoints exactly where we win and where we lose. Unbeatable.
              </p>
              <footer className="mt-4 font-semibold">— Speedy Garage</footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-white bg-blue-900">
        <img src="/logo.png" alt="Garage Vision Logo" className="h-6 w-auto mx-auto mb-2" />
        Garage Vision © 2025
      </footer>
    </div>
  );
}
