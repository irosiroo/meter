import React from 'react';

// توليد الميتا تايتل والدسكربشن تلقائياً لكل كلمة بحثية
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decodedQuery = decodeURIComponent(slug).replace(/-/g, ' ');
  
  return {
    title: `حساب ${decodedQuery} - النتائج والأمثلة الفورية`,
    description: `احسب ${decodedQuery} بدقة وسرعة عبر أدوات ميتريا الحسابية المعتمدة.`,
  };
}

export default async function DynamicCalcPage({ params }) {
  const { slug } = await params;
  const query = decodeURIComponent(slug).replace(/-/g, ' ');

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-emerald-400">
          نتيجة حساب: {query}
        </h1>
        <p className="text-gray-300 mb-8 leading-relaxed">
          تم معالجة استفسارك بناءً على الخوارزميات المتقدمة لمنصة ميتريا. إليك تفاصيل العملية الحسابية والأمثلة المرتبطة بها.
        </p>

        {/* صندوق الحاسبة التفاعلية */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-xl mb-8">
          <div className="text-lg font-semibold mb-4 text-gray-200">الأداة الحاسبة المخصصة</div>
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 text-center text-gray-400">
            [جاري تحميل الحاسبة الفورية لـ: {query}...]
          </div>
        </div>

        {/* محتوى نصي ديناميكي لتحسين السيو */}
        <section className="space-y-4 text-gray-400 text-sm">
          <h2 className="text-xl font-bold text-white">كيفية استخدام هذه الحاسبة</h2>
          <p>
            تتيح لك هذه الصفحة الحصول على نتائج فورية ودقيقة لأي عملية مرتبطة بـ &quot;{query}&quot; بدون الحاجة لحسابات معقدة. 
            فقط أدخل القيم المطلوبة في الحقول بالأعلى لتظهر النتيجة مباشرة.
          </p>
        </section>
      </div>
    </main>
  );
}
