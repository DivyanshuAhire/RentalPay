import React from "react";

interface LegalPageProps {
  title: string;
  content: string;
}

export const LegalPage: React.FC<LegalPageProps> = ({ title, content }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-sm border border-slate-200 rounded-3xl overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-8 py-6">
          <h1 className="text-3xl font-black text-slate-900">{title}</h1>
        </div>
        <div className="p-8 sm:p-12">
          <div className="prose prose-slate max-w-none">
            <div className="text-slate-700 whitespace-pre-wrap font-medium leading-relaxed space-y-4">
              {content}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} RentalPay. All rights reserved.</p>
      </div>
    </div>
  );
};
