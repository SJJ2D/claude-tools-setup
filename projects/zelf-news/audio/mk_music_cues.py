import json
P=json.load(open('/home/user/work/zelf/audio/placement.json'))
l1_end=P['lines']['l1'][1]; s1b=P['cuts']['S1b'][0]; l4=P['lines']['l4'][0]; l15_end=P['lines']['l15'][1]
C={'bed':'/root/tools/sfx/music/intro/beginning-7.mp3','bed_start_offset':0.0,'dur':P['dur'],
 'segments':[
  {'on':0.0,'off':round(l1_end,3),'gain_db':0,'fade_in':0.3,'fade_out':0.0,'note':'plays from the start, hard stop at end of l1'},
  {'on':round(l4,3),'off':round(l15_end,3),'gain_db':-4,'fade_in':0.4,'fade_out':0.0,'note':'returns quietly at start of l4, hard stop at end of l15'}],
 'silent_ranges':[[round(l1_end,3),round(l4,3)],[round(l15_end,3),P['dur']]],'s1b_cut':s1b,
 'bed_continues':True,'note':'segment 2 continues the bed from where its timeline position is (no restart)'}
json.dump(C,open('/home/user/work/zelf/audio/music_cues.json','w'),indent=1);print(C['segments'],C['silent_ranges'],s1b)
