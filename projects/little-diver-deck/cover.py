# -*- coding: utf-8 -*-
from base import E

COVER_CSS = r"""
#cover{background:linear-gradient(180deg,#BDEBFA 0%,#E4F8FB 40%,#E4F8FB 52%,#7FD6DE 53%,#2FB3C2 68%,#0E7E98 86%,#0B5E7C 100%)}
#cover .sun{position:absolute;left:760px;top:120px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,#FFE27A 0 55%,#FFC83A 56% 100%);box-shadow:0 0 0 22px rgba(255,214,90,.25),0 0 0 48px rgba(255,214,90,.12)}
#cover .cloud{position:absolute;background:#FFFFFF;border-radius:999px;opacity:.95}
#cover .logo{position:absolute;top:44px;height:150px;background:#FFFFFF;border-radius:30px;box-shadow:0 10px 26px rgba(14,58,91,.16);display:flex;align-items:center;justify-content:center;padding:12px 22px}
#cover .logo img{height:126px}
#cover .course{position:absolute;top:70px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,.85);border-radius:999px;padding:12px 34px;font-size:28px;font-weight:800;color:#0E3A5B;white-space:nowrap;box-shadow:0 8px 20px rgba(14,58,91,.10)}
#cover .course span{color:#F2683F}
#cover .titlebox{position:absolute;right:120px;top:250px;width:980px;text-align:right}
#cover .kicker{display:inline-block;background:#F2683F;color:#fff;font-weight:800;font-size:32px;padding:10px 30px;border-radius:999px;box-shadow:0 8px 18px rgba(242,104,63,.30);transform:rotate(-1.5deg)}
#cover h1{font-family:'Baloo Bhaijaan 2';font-weight:800;font-size:156px;line-height:.98;margin:18px 0 0 0;color:#0E3A5B;
  text-shadow:0 6px 0 #FFFFFF,0 10px 22px rgba(14,58,91,.18)}
#cover h1 .p{color:#F2683F}
#cover .sub{font-family:'Baloo Bhaijaan 2';font-weight:800;font-size:70px;line-height:1.1;color:#FFFFFF;margin:6px 0 0 0;text-shadow:0 4px 0 #0B7F95,0 8px 18px rgba(4,50,70,.35)}
#cover .tagline{font-size:31px;font-weight:700;color:#FFFFFF;margin:30px 0 0 0;line-height:1.6;width:980px;text-shadow:0 2px 6px rgba(7,60,84,.35)}
#cover .namebar{position:absolute;bottom:46px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:0;background:#FFFDF7;border-radius:999px;box-shadow:0 16px 36px rgba(4,40,60,.35);padding:14px 16px;white-space:nowrap}
#cover .namebar .seg{padding:8px 34px;font-size:32px;font-weight:700;color:#30495F}
#cover .namebar .seg b{color:#0E3A5B;font-weight:800}
#cover .namebar .sep{width:3px;height:54px;background:#E2E9EA;border-radius:2px}
#cover .namebar .ic{width:70px;height:70px;border-radius:50%;background:#FFC83A;display:flex;align-items:center;justify-content:center}
#cover .namebar .ic img{width:48px;height:48px}
#cover .floor{position:absolute;left:0;bottom:0;width:1920px;height:150px}
"""

def cover():
    return f"""<section class="slide" id="cover">
<div class="sun"></div>
<div class="cloud" style="left:300px;top:230px;width:220px;height:62px"></div><div class="cloud" style="left:350px;top:200px;width:120px;height:70px"></div>
<div class="cloud" style="left:1000px;top:200px;width:180px;height:50px;opacity:.8"></div>
<div class="logo" style="right:70px"><img src="img/uob_logo.png" alt="جامعة البحرين"></div>
<div class="logo" style="left:70px"><img src="img/btc_logo_crop.png" alt="كلية البحرين للمعلمين"></div>
<div class="course">TCHL418 <span>•</span> الصحة والسلامة والتغذية للأطفال <span>•</span> التقييم 3 <span>•</span> الفصل الأول 2026/2027</div>

<!-- dhow on the waterline -->
<img src="img/dhow.svg" style="position:absolute;left:150px;top:200px;width:620px">
<svg style="position:absolute;left:0;top:548px;width:1920px;height:60px" viewBox="0 0 1920 60" preserveAspectRatio="none"><path d="M0 22 C120 0 240 0 360 22 C480 44 600 44 720 22 C840 0 960 0 1080 22 C1200 44 1320 44 1440 22 C1560 0 1680 0 1800 22 C1860 33 1890 36 1920 34 L1920 60 L0 60 Z" fill="#7FD6DE"/></svg>

<!-- underwater life -->
<img src="img/diver.svg" style="position:absolute;left:520px;top:640px;width:300px;transform:rotate(14deg)">
<img src="{E}tropical_fish.svg" style="position:absolute;left:250px;top:700px;width:120px;transform:scaleX(-1)">
<img src="{E}fish.svg" style="position:absolute;left:150px;top:640px;width:80px;transform:scaleX(-1)">
<img src="{E}oyster.svg" style="position:absolute;left:220px;top:840px;width:140px">
<img src="{E}coral.svg" style="position:absolute;left:30px;top:800px;width:190px">
<img src="{E}crab.svg" style="position:absolute;left:1610px;top:878px;width:110px">
<img src="{E}coral.svg" style="position:absolute;right:40px;top:880px;width:150px;transform:scaleX(-1)">

<img src="{E}dolphin.svg" style="position:absolute;left:840px;top:620px;width:110px;transform:scaleX(-1) rotate(-10deg)">
<div class="bub" style="left:690px;top:600px;width:34px;height:34px"></div><div class="bub" style="left:720px;top:560px;width:20px;height:20px"></div>
<div class="bub" style="left:470px;top:820px;width:26px;height:26px"></div><div class="bub" style="left:440px;top:780px;width:14px;height:14px"></div>


<div class="titlebox">
  <span class="kicker">خطة نشاط بدني متمركزة حول الطفل</span>
  <h1>الغوّاص <span class="p">الصغير</span></h1>
  <p class="sub">رحلة البحث عن اللؤلؤ</p>
  <p class="tagline">نشاط حركي تعاوني مستوحى من تراث الغوص على اللؤلؤ في البحرين<br>للصف الثاني الابتدائي (7–8 سنوات) — داخل الصف وخارجه ورقمياً</p>
</div>

<svg class="floor" viewBox="0 0 1920 150" preserveAspectRatio="none"><path d="M0 70 C200 40 420 44 640 66 C860 88 1060 90 1280 68 C1500 46 1720 44 1920 64 L1920 150 L0 150 Z" fill="#F6DDA8"/><path d="M0 100 C260 82 520 84 780 98 C1040 112 1300 112 1560 96 C1700 88 1820 88 1920 94 L1920 150 L0 150 Z" fill="#EFCB86"/></svg>
<div class="namebar">
  <div class="ic"><img src="{E}student.svg"></div>
  <div class="seg">إعداد الطالب: <b>سجاد مهدي عبدالله الصياد</b></div>
  <div class="sep"></div>
  <div class="seg">الرقم الأكاديمي: <b>202102571</b></div>
  <div class="sep"></div>
  <div class="seg">الشعبة: <b>1</b></div>
</div>
</section>"""
