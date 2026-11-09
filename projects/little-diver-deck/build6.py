from base import page
from cover import cover, COVER_CSS
import slides6, slides
html = page(cover() + ''.join(f() for f in slides6.ALL))
html = html.replace('</style>', COVER_CSS + slides.EXTRA_CSS + slides6.CSS6 + '</style>', 1)
open('slides6.html', 'w', encoding='utf-8').write(html)
print('ok')
