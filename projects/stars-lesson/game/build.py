import sys
src=open('/home/user/work/stars/src/index.src.html',encoding='utf-8').read()
sfx=open('/home/user/work/stars/sfx_game.js',encoding='utf-8').read()
assert '</script' not in sfx
out=src.replace('/*__SFX__*/',sfx,1)
open('/home/user/work/stars/game/index.html','w',encoding='utf-8').write(out)
print(len(out.encode()))
