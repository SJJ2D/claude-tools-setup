# جزيرة الطقس: واقع معزز حقيقي على الآيفون (AR Quick Look)
سفاري iOS لا يدعم WebXR، فتُصدَّر الجزيرة (المحطات التسع) كملف USDZ يفتحه AR Quick Look: يثبت على سطح أفقي حقيقي، ويُحرَّك بإصبع، ويُدار بإصبعين، ويُكبَّر بالقرص.
- المصدر: الموقع المنشور على Netlify (weather/index.html). build.js يفتح نسخة معدلة تكشف `window.__ZN`، و convert.js يحوّل الخامات إلى MeshStandard ويضيف لوحات الأسماء، ثم export.html (three 0.187 USDZExporter) يكتب weather_island.usdz.
- يحتاج: lib/three128.min.js, gsap, lenis (تُنزَّل من CDN)، وthree 0.187 من ~/tools/js/node_modules، وخادم محلي على 8813 بجذر مجلد العمل.
- في الصفحة: زر «الواقع المعزز» يفتح Quick Look إذا كان `a.relList.supports('ar')`، ويبقى WebXR على أندرويد كما هو. `_headers` يضبط نوع ملف usdz.
