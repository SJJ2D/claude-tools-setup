from base import page
from cover import cover, COVER_CSS
import slides6, slides
# order: idea/goals -> procedures & stations -> tools & safety -> development
parts = [slides6.s2(),
         slides6.s4().replace('<div class="pg">4</div>', '<div class="pg">3</div>'),
         slides6.s3().replace('<div class="pg">3</div>', '<div class="pg">4</div>'),
         slides6.s5()]
html = page(cover() + ''.join(parts))
html = html.replace('</style>', COVER_CSS + slides.EXTRA_CSS + slides6.CSS6 + '</style>', 1)
open('slides6.html', 'w', encoding='utf-8').write(html)
print('ok')
