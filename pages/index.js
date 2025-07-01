import Head from 'next/head';
import { useEffect } from 'react';

export default function Landing() {
  useEffect(() => {
    document.body.classList.add('landing-page');
    return () => document.body.classList.remove('landing-page');
  }, []);

  return (
    <>
      <Head>
        <title>Garage-Vision | Revolutionize Your Garage</title>
      </Head>
      <section className="hero">
        <img src="/logo.png" alt="Garage Vision Logo" className="hero-logo" />
        <h1>Revolutionize Your Garage. Own Your Future.</h1>
        <p>
          From first tap to final drive-away, Garage-Vision orchestrates every phase
          of your repair shop with precision, power, and profitability.
        </p>
        <img
          src="/web-header-image.png"
          alt="Modern garage workspace"
          className="hero-image"
        />
        <div className="hero-buttons">
          <a href="/login" className="garage-login">Garage Login</a>
          <a href="/local/login" className="owner-login">Car Owner Login</a>
        </div>
      </section>

      <section className="section">
        <h2>Why Every Shop Deserves Garage-Vision</h2>
        <div className="features-grid">
          <div className="feature">
            <img
              src="https://source.unsplash.com/400x300/?mechanic,tools"
              alt="Mechanic tools organized"
              className="feature-image"
            />
            <h3>Laser-Focused Efficiency</h3>
            <p>
              Slash admin overhead by 20%—jobs auto-assign, parts auto-order,
              invoices auto-generate, and your team works at peak power.
            </p>
          </div>
          <div className="feature">
            <img
              src="https://source.unsplash.com/400x300/?car,diagnostic"
              alt="Vehicle diagnostic screen"
              className="feature-image"
            />
            <h3>Ultimate Transparency</h3>
            <p>
              Customers track their vehicle in real time—no more endless
              &lsquo;where is my car?&rsquo; calls. Satisfaction scores skyrocket.
            </p>
          </div>
          <div className="feature">
            <img
              src="https://source.unsplash.com/400x300/?analytics,graph"
              alt="Analytics dashboard"
              className="feature-image"
            />
            <h3>Data-Driven Growth</h3>
            <p>
              Dashboards reveal your most profitable services and busiest hours—pivot
              instantly to maximize revenue per bay.
            </p>
          </div>
          <div className="feature">
            <img
              src="https://source.unsplash.com/400x300/?garage,workflow"
              alt="Team collaborating in garage"
              className="feature-image"
            />
            <h3>Seamless Ecosystem</h3>
            <p>Ditch whiteboards and silos. Your shop—powered by a unified workflow that just works.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>See the Impact</h2>
        <div className="impact-stats">
          <div className="impact">
            <h3>+80%</h3>
            <p>Time Saved</p>
          </div>
          <div className="impact">
            <h3>+35%</h3>
            <p>More Jobs Completed</p>
          </div>
          <div className="impact">
            <h3>⭐ 4.9/5</h3>
            <p>Average Rating</p>
          </div>
          <div className="impact">
            <h3>250+</h3>
            <p>Garages Running</p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>What Our Customers Say</h2>
        <div className="testimonials">
          <blockquote>
            <p>
              Garage-Vision transformed our shop overnight. Jobs flow seamlessly and
              customers love the transparency. It’s literally the heart of our
              operation.
            </p>
            <footer>— AutoTech Repairs</footer>
          </blockquote>
          <blockquote>
            <p>
              We’ve doubled our throughput without adding staff. The analytics module
              pinpoints exactly where we win and where we lose. Unbeatable.
            </p>
            <footer>— Speedy Garage</footer>
          </blockquote>
        </div>
      </section>

      <style jsx global>{`
        body.landing-page {
          margin: 0;
          font-family: 'Segoe UI', sans-serif;
          background: #f9f9f9;
          color: #2c3e50;
        }
        .hero {
          background: linear-gradient(135deg, #2c3e50 0%, #8e44ad 100%);
          color: white;
          text-align: center;
          padding: 100px 20px;
        }
        .hero h1 {
          font-size: 3rem;
          margin-bottom: 20px;
        }
        .hero p {
          font-size: 1.25rem;
          max-width: 600px;
          margin: 0 auto 40px;
        }
        .hero-logo {
          width: 150px;
          margin: 0 auto 20px;
          display: block;
        }
        .hero-image {
          width: 80%;
          max-width: 800px;
          display: block;
          margin: 40px auto;
          border-radius: 8px;
        }
        .hero-buttons a {
          display: inline-block;
          margin: 0 10px;
          padding: 15px 30px;
          border-radius: 8px;
          font-weight: bold;
          text-decoration: none;
          color: white;
        }
        .garage-login {
          background: #e74c3c;
        }
        .owner-login {
          background: #3498db;
        }
        .section {
          padding: 60px 20px;
          max-width: 1100px;
          margin: auto;
          text-align: center;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
          margin-top: 40px;
        }
        .feature {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        .feature-image {
          width: 100%;
          height: auto;
          margin-bottom: 15px;
          border-radius: 8px;
        }
        .impact-stats {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 40px;
          margin-top: 40px;
        }
        .impact {
          text-align: center;
        }
        .impact h3 {
          color: #8e44ad;
          font-size: 2rem;
        }
        .testimonials {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 30px;
          margin-top: 40px;
        }
        blockquote {
          background: #f1f1f1;
          padding: 20px;
          border-left: 5px solid #8e44ad;
          border-radius: 8px;
        }
      `}</style>
    </>
  );
}
