import json,glob,os
H=os.path.expanduser('~/tools/sfx/')
I=json.load(open(glob.glob(H+'index-*.json')[0])); d={x['id']:x for x in I['sfx']+I['music']}
M={'sting':('sfx/jingle/hit-08',.8),'whoosh':('sfx/whoosh/classic-sweep',.6),'whip':('sfx/whoosh/swish-9',.7),
'impact':('sfx/impact/rock-hit-01',.8),'boom':('sfx/explosion/explosion',.7),'bark':('sfx/creature/barking-01',.7),
'fail':('sfx/notification/error-buzz',.6),'scream':('sfx/creature/scream-01',.6),'pop':('sfx/pop/pop-1',.6),
'tick':('sfx/ui/tick-004',.5),'stamp':('sfx/impact/classic-stamp',.8),'riser':('sfx/transition/swell-cymbal-long',.55),
'beep':('sfx/ui/beep-15',.4),'ding':('sfx/notification/notify-ding',.5),'typing':('sfx/keyboard/key-001',.5),
'slide':('sfx/paper/slide',.5),'shutter':('sfx/camera/shutter-dslr',.7),'scratch':('sfx/ui/scratch-004',.7),
'boing':('sfx/misc/spring-07',.65),'sad':('sfx/game/low-down',.6)}
out={};cr=['Sound effects: alvana-audio library (github.com/seyedpouramir/alvana-audio), all CC0-1.0 (no credit required):']
for n,(i,g) in M.items():
    x=d[i];out[n]={'file':H+x['file'],'gain':g,'lic':x['lic'],'credit':f"{x.get('title',i)} / {x.get('pack')}"}
    cr.append(f"  {n}: {i} [{x['lic']}] pack {x.get('pack')}")
    assert os.path.exists(out[n]['file']),out[n]['file']
json.dump(out,open('sfx_map.json','w'),indent=1)
x=d['music/intro/beginning-7']
cr.append(f"Music: \"{x['title']}\" by {x['artist']} ({x['pack']}), {x['lic']} (CC0, no credit required; credited as courtesy).")
open('CREDITS.txt','w').write('\n'.join(cr)+'\n')
