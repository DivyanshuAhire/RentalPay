import dbConnect from "@/lib/db";
import { Settings } from "@/models/Settings";

export default async function FAQPage() {
  await dbConnect();
  const settings = await Settings.findOne() || {
    faqs: []
  };

  const faqs = settings.faqs || [];

  return (
    <div className="max-w-4xl mx-auto py-20 px-4 md:px-8">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">Have questions? We're here to help.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
        {faqs.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            No FAQs available at the moment.
          </div>
        ) : (
          faqs.map((faq: any, idx: number) => (
            <div key={idx} className="pb-8 border-b border-gray-100 last:border-0 last:pb-0">
              <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.question}</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-12 text-center bg-indigo-50 rounded-3xl p-8 border border-indigo-100">
        <h3 className="text-xl font-bold text-indigo-900 mb-2">Still have questions?</h3>
        <p className="text-indigo-700/80 mb-4">Can't find the answer you're looking for? Please chat to our friendly team.</p>
        <a href="/contact" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-colors">
          Get in Touch
        </a>
      </div>
    </div>
  );
}
