import React from 'react';

// دالة لتوليد الميتا تايتل والدسكربشن واستهداف محركات البحث بدقة
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decodedQuery = decodeURIComponent(slug).replace(/-/g, ' ');
  
  return {
    title: `حساب ${decodedQuery} - النتائج والأمثلة الفورية | ميتريا`,
    description: `احسب ${decodedQuery} بدقة وسرعة عبر أدوات ميتريا الحسابية المعتمدة. نتائج فورية، أمثلة حقيقية وشرح مفصل.`,
    alternates: {
      canonical: `https://meteria.vercel.app/calc/${slug}`,
    },
  };
}

export default async function DynamicCalcPage({ params }) {
  const { slug } = await params;
  const query = decodeURIComponent(slug).replace(/-/g, ' ');

  // Structured Data (JSON-LD) لجعل جوجل يظهر الصفحة بشكل مميز في نتائج البحث
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': `حاسبة ${query}`,
    'operatingSystem': 'All',
    'applicationCategory': 'CalculatorApplication',
    'description': `أداة تفاعلية لحساب ${query} بدقة فورية مع الأمثلة والشرح.`,
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6 md:p-12">
      {/* إدراج الـ Schema Markup لجوجل */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-emerald-400">
          حاسبة ونتائج: {query}
        </h1>
        <p className="text-gray-300 mb-8 leading-relaxed">
          تم معالجة استفسارك حول &quot;{query}&quot; بناءً على الخوارزميات المتقدمة لمنصة ميتريا. إليك تفاصيل العملية الحسابية والأمثلة المرتبطة بها.
        </p>

        {/* صندوق الحاسبة التفاعلية */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-xl mb-8">
          <div className="text-lg font-semibold mb-4 text-gray-200">الأداة الحاسبة المخصصة</div>
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 text-center text-gray-400">
            {/* هنا يمكنك ربط الكلمة بالـ 309 حاسبة الخاصة بك */}
            [جاري تشغيل الحاسبة المناسبة لـ: {query}...]
          </div>
        </div>

        {/* محتوى نصي ديناميكي لتحسين السيو */}
        <section className="space-y-4 text-gray-400 text-sm bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
          <h2 className="text-xl font-bold text-white">دليل الاستخدام والأمثلة الحقيقية</h2>
          <p>
            تتيح لك هذه الصفحة الحصول على نتائج فورية ودقيقة لأي عملية مرتبطة بـ &quot;{query}&quot; بدون الحاجة لحسابات معقدة يدوياً.
            فقط أدخل القيم المطلوبة في الحاسبة بالأعلى لتظهر النتيجة الفورية.
          </p>
        </section>
      </div>
    </main>
  );
}
