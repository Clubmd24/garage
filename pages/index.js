import Head from 'next/head';
import Image from 'next/image';

export default function Landing() {
  return (
    <>
      <Head>
        <title>Garage-Vision | Revolutionize Your Garage</title>
      </Head>
      <header className="flex items-center justify-between px-6 py-3 text-gray-100">
        <Image src="/logo.png" alt="Garage Vision Logo" width={32} height={32} className="h-8 w-auto" />
        <nav className="space-x-6 text-sm">
          <a href="/login" className="hover:underline">Garage Login</a>
          <a href="/local/login" className="hover:underline">Car Owner Login</a>
          <a href="/fleet/login" className="hover:underline">Company Login</a>
        </nav>
      </header>

      <section className="bg-gradient-to-b from-[#0d1e45] via-[#3f5dc6] to-[#d2e1ff] text-white py-20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Revolutionize Your Garage. Own Your Future.
            </h1>
            <p className="text-lg">
              From first tap to final drive-away, Garage-Vision orchestrates every phase
              of your repair shop with precision, power, and profitability.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="/login" className="button-accent px-6">Garage Login</a>
              <a href="/local/login" className="button px-6">Car Owner Login</a>
              <a href="/fleet/login" className="button px-6">Company Login</a>
            </div>
          </div>
          <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
            <Image
              src="/mechanic-cards.png"
              alt="Mechanic illustration"
              width={1}
              height={1}
              sizes="100vw"
              style={{ width: '100%', height: 'auto' }}
              className="max-w-md w-full rounded-2xl shadow-xl"
              unoptimized
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--color-bg)] text-[var(--color-text-primary)]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-12">Why Every Shop Deserves Garage-Vision</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-2">Mechanic Tools</h3>
              <p>
                Slash admin overhead by 20%—jobs auto-assign, parts auto-order,
                invoices auto-generate, and your team works at peak power.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-2">Vehicle Dispatch</h3>
              <p>
                Customers track their vehicle in real time—no more endless
                &lsquo;where is my car?&rsquo; calls. Satisfaction scores skyrocket.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-2">Analytics Dashboard</h3>
              <p>
                Dashboards reveal your most profitable services and busiest hours—pivot
                instantly to maximize revenue per bay.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-2">Team Collaboration</h3>
              <p>Ditch whiteboards and silos. Your shop—powered by a unified workflow that just works.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 flex justify-center">
          <Image
            src="/web-header-image.png"
            alt="App preview"
            width={1}
            height={1}
            sizes="100vw"
            style={{ width: '100%', height: 'auto' }}
            className="max-w-4xl w-full rounded-2xl shadow-2xl"
            unoptimized
          />
        </div>
      </section>

      <section className="py-16 bg-[var(--color-bg)] text-[var(--color-text-primary)]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-10">See the Impact</h2>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 text-center">
            <div>
              <h3 className="text-2xl font-bold text-[var(--color-primary)]">+80%</h3>
              <p>Time Saved</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--color-primary)]">+35%</h3>
              <p>More Jobs Completed</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--color-primary)]">4.9/5</h3>
              <p>Average Rating</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--color-primary)]">250+</h3>
              <p>Garages Running</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white text-[var(--color-text-primary)]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center mb-10">What Our Customers Say</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <blockquote className="bg-[var(--color-bg)] rounded-2xl p-6 shadow">
              <p>
                Garage-Vision transformed our shop overnight. Jobs flow seamlessly and
                customers love the transparency. It’s literally the heart of our
                operation.
              </p>
              <footer className="mt-4 font-semibold">— AutoTech Repairs</footer>
            </blockquote>
            <blockquote className="bg-[var(--color-bg)] rounded-2xl p-6 shadow">
              <p>
                We’ve doubled our throughput without adding staff. The analytics module
                pinpoints exactly where we win and where we lose. Unbeatable.
              </p>
              <footer className="mt-4 font-semibold">— Speedy Garage</footer>
            </blockquote>
          </div>
        </div>
      </section>

      <footer className="py-6 text-center text-sm text-white bg-[#0d1e45]">
        <Image src="/logo.png" alt="Garage Vision Logo" width={24} height={24} className="h-6 w-auto mx-auto mb-2" />
        Garage Vision © 2025
      </footer>
    </>
  );
}
