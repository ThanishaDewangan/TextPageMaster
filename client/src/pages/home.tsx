import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ImageCarousel } from "@/components/image-carousel";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Professional Invoice
              <span className="text-primary-400"> Generator</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Create, manage, and generate professional PDF invoices with our powerful MERN stack application.
              Perfect for freelancers, small businesses, and enterprises.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                <Button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="border-primary-500 text-primary-400 hover:bg-primary-500 hover:text-white px-8 py-3 rounded-lg text-lg font-semibold">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>

          <ImageCarousel />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose Our Invoice Generator?</h2>
            <p className="text-gray-300">Built with modern technology for maximum efficiency</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900 rounded-xl p-8 border border-gray-700">
              <div className="text-primary-400 text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold text-white mb-4">Secure Authentication</h3>
              <p className="text-gray-300">JWT-based authentication ensures your data is safe and secure.</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-8 border border-gray-700">
              <div className="text-primary-400 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-4">Automatic Calculations</h3>
              <p className="text-gray-300">Automatic GST calculations and product totals with real-time updates.</p>
            </div>
            <div className="bg-gray-900 rounded-xl p-8 border border-gray-700">
              <div className="text-primary-400 text-4xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-white mb-4">PDF Generation</h3>
              <p className="text-gray-300">Generate professional PDF invoices with Puppeteer technology.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Invoice Generator</h3>
              <p className="text-gray-400">Professional invoice generation made simple with modern technology stack.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>PDF Generation</li>
                <li>User Authentication</li>
                <li>Product Management</li>
                <li>Invoice Templates</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Technology</h4>
              <ul className="space-y-2 text-gray-400">
                <li>React + TypeScript</li>
                <li>Node.js + Express</li>
                <li>PostgreSQL</li>
                <li>Puppeteer</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Community</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">© 2025 Invoice Generator. Built with MERN Stack.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
