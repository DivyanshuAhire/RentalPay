import dbConnect from "@/lib/db";
import { Settings } from "@/models/Settings";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  await dbConnect();
  const settings = await Settings.findOne() || {
    contactEmail: "rentalpay.in@gmail.com",
    contactPhone: "+91 0000000000",
    contactAddress: "123 Rental Street, Fashion City",
    contactText: "We'd love to hear from you. Drop us a line!",
    contactInstagram: "@rentalpay"
  };

  return (
    <div className="max-w-4xl mx-auto py-20 px-4 md:px-8">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4">Contact Us</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">{settings.contactText}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center flex flex-col items-center hover:-translate-y-1 transition-transform">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-3xl mb-4">
            📧
          </div>
          <h3 className="font-bold text-gray-900 text-xl mb-2">Email Us</h3>
          <p className="text-gray-500 mb-4 text-sm">We'll respond within 24 hours.</p>
          <a href={`mailto:${settings.contactEmail}`} className="text-indigo-600 font-bold hover:underline mt-auto">
            {settings.contactEmail}
          </a>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center flex flex-col items-center hover:-translate-y-1 transition-transform">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-3xl mb-4">
            📞
          </div>
          <h3 className="font-bold text-gray-900 text-xl mb-2">Call Us</h3>
          <p className="text-gray-500 mb-4 text-sm">Mon-Fri from 9am to 6pm.</p>
          <a href={`tel:${settings.contactPhone}`} className="text-emerald-600 font-bold hover:underline mt-auto">
            {settings.contactPhone}
          </a>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center flex flex-col items-center hover:-translate-y-1 transition-transform">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-3xl mb-4">
            📍
          </div>
          <h3 className="font-bold text-gray-900 text-xl mb-2">Visit Us</h3>
          <p className="text-gray-500 mb-4 text-sm">Come say hello at our office.</p>
          <div className="text-rose-600 font-bold mt-auto text-sm">
            {settings.contactAddress}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center flex flex-col items-center hover:-translate-y-1 transition-transform">
          <div className="w-16 h-16 bg-fuchsia-50 rounded-full flex items-center justify-center text-3xl mb-4">
            📸
          </div>
          <h3 className="font-bold text-gray-900 text-xl mb-2">Instagram</h3>
          <p className="text-gray-500 mb-4 text-sm">Follow us for updates.</p>
          <a href={`https://instagram.com/${settings.contactInstagram?.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-fuchsia-600 font-bold hover:underline mt-auto">
            {settings.contactInstagram}
          </a>
        </div>
      </div>
    </div>
  );
}
