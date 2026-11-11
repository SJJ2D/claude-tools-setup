# جزيرة الطقس: واقع معزز حقيقي على الآيفون (AR Quick Look)
سفاري iOS لا يدعم WebXR، فتُصدَّر الجزيرة (المحطات التسع) كملف USDZ يفتحه AR Quick Look: يثبت على سطح أفقي حقيقي، ويُحرَّك بإصبع، ويُدار بإصبعين، ويُكبَّر بالقرص.
- المصدر: الموقع المنشور على Netlify (weather/index.html). build.js يفتح نسخة معدلة تكشف `window.__ZN`، و convert.js يحوّل الخامات إلى MeshStandard ويضيف لوحات الأسماء، ثم export.html (three 0.187 USDZExporter) يكتب weather_island.usdz.
- يحتاج: lib/three128.min.js, gsap, lenis (تُنزَّل من CDN)، وthree 0.187 من ~/tools/js/node_modules، وخادم محلي على 8813 بجذر مجلد العمل.
- في الصفحة: زر «الواقع المعزز» يفتح Quick Look إذا كان `a.relList.supports('ar')`، ويبقى WebXR على أندرويد كما هو. `_headers` يضبط نوع ملف usdz.

## تحديث: الضغط على المجسمات داخل الواقع المعزز على الآيفون (8th Wall)
- `ar8.js` يُدرج في weather/index.html: على iOS يحمّل محرك 8th Wall (SLAM) من jsDelivr (`@8thwall/engine-binary@1`، رخصة استخدام محدودة من Niantic Spatial، مع سطر نسبة ظاهر)، وينقل `stage` إلى مشهده، ويضع الجزيرة بدائرة صفراء على السطح، ثم الضغط يفتح المحطة نفسها (pick)، والسحب يدوّر، والقرص يكبّر.
- Quick Look صار احتياطاً إذا فشل التتبع. أندرويد يبقى على WebXR.
- `test8.js` يختبر المسار بمحرك وهمي (`mockxr8.js`)؛ التتبع الحقيقي يُجرَّب على جهاز.
