export default async function sitemap() {
  const baseUrl = 'https://meteria.vercel.app';

  // قائمة الكلمات البحثية المستهدفة (يمكنك جلبها من قاعدة بيانات أو مصفوفة ضخمة)
  const targetQueries = [
    'نسبة-الارباح-السنوية',
    'حساب-قسط-السيارة',
    'حساب-الزكاة-الشرعية',
    'النسبة-المئوية-للراتب',
    // أضف هنا آلاف الكلمات أو اربطها بقائمة الحاسبات الـ 309 الخاصة بك
  ];

  // توليد رابط لكل كلمة بحثية
  const dynamicUrls = targetQueries.map((query) => ({
    url: `${baseUrl}/calc/${query}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...dynamicUrls,
  ];
}
