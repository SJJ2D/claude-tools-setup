# تعليمات للجلسات
- المهارات المركّبة في ~/.claude/skills تُستخدم تلقائياً حسب الحاجة بدون انتظار أمر من المستخدم: اختر المهارة التي تفيد المهمة وطبّقها.
- سجل التركيب: /tmp/claude-tools-install.log. إن لم تظهر مهارة، شغّل: bash install-all.sh
- مصادر خارجية (Context7 وغيره) لا تُرسل لها أسراراً ولا بيانات طلاب.

## Video and voiceover preferences (from the user's notes on the "الحرب العظمى" trailer)
- **Camera:** steady with smooth movements. No continuous handheld shake, and no strong shake on steps or impacts. If needed, one light, short shake on an important hit only. Transitions use a cut on the beat or a fade instead of a fast camera spin.
- **Lighting:** consistent across the whole video. Measure each shot's brightness and match it to one level, use one colour grade, and don't shoot characters against the sun (silhouettes); light them from the side or from behind the camera.
- **Voice:** use the `arabic-voiceover` skill. The user wants a professional voice like ElevenLabs, and the dialect for real (Bahraini) when he asks for it, not MSA. The best option is his own voice on ElevenLabs (v4/v3 with tags), with his consent. The local model is only a fallback, and if used he must be told clearly that it leans toward MSA.
- Before rendering a long video: an approval package (script + voice sample + stills), then the edits in one batch.
