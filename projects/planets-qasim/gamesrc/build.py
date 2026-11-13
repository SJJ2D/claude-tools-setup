import pathlib
d=pathlib.Path('/home/user/work/p3')
page=(d/'gamesrc/page.html').read_text()
sfx=(d/'sfx_planets.js').read_text()
game=(d/'gamesrc/game.js').read_text()
out=page.replace('/*__SFX__*/',sfx).replace('/*__GAME__*/',game)
(d/'game').mkdir(exist_ok=True)
(d/'game/index.html').write_text(out)
print(len(out.encode())/1e6,'MB')
