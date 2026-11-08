import * as THREE from 'three';
import { buildWorld } from './lib/world.js';
import { buildZones, DT, PLAZA, DS } from './lib/zones.js';
import { makeCrowd, makeFlamingo, makeCamel, camelPose, makeQuad, quadPose, makePigeons, makeDolphin, makeCrab } from './lib/creatures.js';
import { makeChar, pose, anim } from './lib/chars.js';
import * as P from './lib/props.js';
import * as T from './lib/tex.js';
import { makePost } from './lib/post.js';
import * as UI from './lib/ui.js';
import { cl, lerp, seg, eio, eo, ei, back, elastic, noise1, hash, deg, rng } from './lib/util.js';

const W = 1920, H = 1080;
// ---------------- timeline (replaced from timing_v2.json) ----------------
let TL = /*TL*/{"lines": {"n0": {"s": 0.743, "e": 3.387, "who": "narr"}, "n1": {"s": 3.924, "e": 4.852, "who": "narr"}, "n2": {"s": 5.458, "e": 8.485, "who": "narr"}, "n3": {"s": 10.035, "e": 11.06, "who": "narr"}, "n4": {"s": 12.194, "e": 17.606, "who": "narr"}, "c_leader": {"s": 18.437, "e": 21.611, "who": "leader"}, "n5": {"s": 23.705, "e": 27.902, "who": "narr"}, "c_hasan": {"s": 28.525, "e": 30.028, "who": "hasan"}, "n6": {"s": 31.166, "e": 36.017, "who": "narr"}, "c_jeff": {"s": 36.427, "e": 39.25, "who": "jeff"}, "c_sul_cute": {"s": 40.48, "e": 41.365, "who": "sulaili"}, "n7": {"s": 41.902, "e": 46.588, "who": "narr"}, "c_sul_dark": {"s": 47.473, "e": 48.674, "who": "sulaili_dark"}, "n8": {"s": 50.025, "e": 53.137, "who": "narr"}, "c_alaish": {"s": 53.658, "e": 55.302, "who": "alaish"}, "n9": {"s": 56.796, "e": 57.612, "who": "narr"}, "n10": {"s": 58.129, "e": 61.974, "who": "narr"}, "c_ali": {"s": 62.4, "e": 64.307, "who": "ali"}, "n11": {"s": 64.962, "e": 70.625, "who": "narr"}, "n12": {"s": 72.43, "e": 74.73, "who": "narr"}, "c_aboudi": {"s": 75.506, "e": 77.229, "who": "aboudi"}, "n13": {"s": 77.668, "e": 79.477, "who": "narr"}, "n14": {"s": 80.346, "e": 82.052, "who": "narr"}, "n15": {"s": 83.015, "e": 84.548, "who": "narr"}, "c_alaish_end": {"s": 85.039, "e": 85.791, "who": "alaish"}}, "words": [{"w": "في", "s": 0.743, "e": 0.934, "line": 0, "who": "narr"}, {"w": "عالم", "s": 0.934, "e": 1.386, "line": 0, "who": "narr"}, {"w": "ما", "s": 1.386, "e": 1.716, "line": 1, "who": "narr"}, {"w": "فيه", "s": 1.716, "e": 1.994, "line": 1, "who": "narr"}, {"w": "قانون", "s": 1.994, "e": 2.726, "line": 1, "who": "narr"}, {"w": "ولا", "s": 2.726, "e": 2.952, "line": 2, "who": "narr"}, {"w": "رحمة", "s": 2.952, "e": 3.387, "line": 2, "who": "narr"}, {"w": "ولا", "s": 3.924, "e": 4.176, "line": 4, "who": "narr"}, {"w": "حتى", "s": 4.176, "e": 4.437, "line": 4, "who": "narr"}, {"w": "واي", "s": 4.437, "e": 4.68, "line": 4, "who": "narr"}, {"w": "فاي", "s": 4.68, "e": 4.852, "line": 4, "who": "narr"}, {"w": "في", "s": 5.458, "e": 5.683, "line": 5, "who": "narr"}, {"w": "ولاية", "s": 5.683, "e": 6.344, "line": 5, "who": "narr"}, {"w": "ليونيدا", "s": 6.344, "e": 7.164, "line": 5, "who": "narr"}, {"w": "بتبدا", "s": 7.164, "e": 7.651, "line": 6, "who": "narr"}, {"w": "الحرب", "s": 7.651, "e": 7.964, "line": 6, "who": "narr"}, {"w": "العظمى", "s": 7.964, "e": 8.485, "line": 6, "who": "narr"}, {"w": "فريق", "s": 10.035, "e": 10.555, "line": 7, "who": "narr"}, {"w": "الصيّاد!", "s": 10.555, "e": 11.06, "line": 7, "who": "narr"}, {"w": "بقيادة", "s": 12.194, "e": 12.776, "line": 9, "who": "narr"}, {"w": "الشبّاس", "s": 12.776, "e": 13.194, "line": 9, "who": "narr"}, {"w": "الصيّاد", "s": 13.194, "e": 13.896, "line": 9, "who": "narr"}, {"w": "يصيد", "s": 13.896, "e": 14.38, "line": 10, "who": "narr"}, {"w": "أي", "s": 14.38, "e": 14.588, "line": 10, "who": "narr"}, {"w": "شي", "s": 14.588, "e": 14.954, "line": 10, "who": "narr"}, {"w": "حتى", "s": 14.954, "e": 15.406, "line": 11, "who": "narr"}, {"w": "السمك", "s": 15.406, "e": 15.928, "line": 11, "who": "narr"}, {"w": "والسمك", "s": 15.928, "e": 16.467, "line": 12, "who": "narr"}, {"w": "بعد", "s": 16.467, "e": 16.762, "line": 12, "who": "narr"}, {"w": "لابس", "s": 16.762, "e": 17.18, "line": 12, "who": "narr"}, {"w": "نظارة!", "s": 17.18, "e": 17.606, "line": 12, "who": "narr"}, {"w": "أنا", "s": 18.437, "e": 18.748, "line": 14, "who": "leader"}, {"w": "ما", "s": 18.748, "e": 18.899, "line": 14, "who": "leader"}, {"w": "أصيد", "s": 18.899, "e": 19.276, "line": 14, "who": "leader"}, {"w": "السمك", "s": 19.276, "e": 19.951, "line": 14, "who": "leader"}, {"w": "السمك", "s": 19.951, "e": 20.535, "line": 15, "who": "leader"}, {"w": "يسلّم", "s": 20.535, "e": 21.007, "line": 15, "who": "leader"}, {"w": "نفسه", "s": 21.007, "e": 21.611, "line": 15, "who": "leader"}, {"w": "حسن", "s": 23.705, "e": 24.113, "line": 16, "who": "narr"}, {"w": "محمد", "s": 24.113, "e": 24.582, "line": 16, "who": "narr"}, {"w": "البيب", "s": 24.582, "e": 25.104, "line": 16, "who": "narr"}, {"w": "دوم", "s": 25.104, "e": 25.417, "line": 17, "who": "narr"}, {"w": "يوصل", "s": 25.417, "e": 25.765, "line": 17, "who": "narr"}, {"w": "قبل", "s": 25.765, "e": 26.008, "line": 17, "who": "narr"}, {"w": "الكل", "s": 26.008, "e": 26.473, "line": 17, "who": "narr"}, {"w": "بس", "s": 26.473, "e": 26.828, "line": 18, "who": "narr"}, {"w": "هرنه", "s": 26.828, "e": 27.263, "line": 18, "who": "narr"}, {"w": "يوصل", "s": 27.263, "e": 27.593, "line": 18, "who": "narr"}, {"w": "قبله", "s": 27.593, "e": 27.902, "line": 18, "who": "narr"}, {"w": "وصلت!", "s": 28.525, "e": 29.195, "line": 19, "who": "hasan"}, {"w": "وين", "s": 29.195, "e": 29.314, "line": 20, "who": "hasan"}, {"w": "الكل؟", "s": 29.314, "e": 30.028, "line": 20, "who": "hasan"}, {"w": "الجيف", "s": 31.166, "e": 31.607, "line": 22, "who": "narr"}, {"w": "جيف", "s": 31.607, "e": 31.901, "line": 22, "who": "narr"}, {"w": "جيفي", "s": 31.901, "e": 32.268, "line": 22, "who": "narr"}, {"w": "أبو", "s": 32.268, "e": 32.562, "line": 23, "who": "narr"}, {"w": "شَامَة", "s": 32.562, "e": 33.077, "line": 23, "who": "narr"}, {"w": "الشَّامَة", "s": 33.077, "e": 33.812, "line": 24, "who": "narr"}, {"w": "بروحها", "s": 33.812, "e": 34.326, "line": 24, "who": "narr"}, {"w": "عندها", "s": 34.326, "e": 34.767, "line": 24, "who": "narr"}, {"w": "متابعين", "s": 34.767, "e": 35.355, "line": 24, "who": "narr"}, {"w": "أكثر", "s": 35.355, "e": 35.723, "line": 24, "who": "narr"}, {"w": "منه", "s": 35.723, "e": 36.017, "line": 24, "who": "narr"}, {"w": "لا", "s": 36.427, "e": 36.756, "line": 25, "who": "jeff"}, {"w": "تطالعون", "s": 36.756, "e": 37.36, "line": 25, "who": "jeff"}, {"w": "الشَّامَة", "s": 37.36, "e": 38.0, "line": 25, "who": "jeff"}, {"w": "الشَّامَة", "s": 38.0, "e": 38.613, "line": 26, "who": "jeff"}, {"w": "تطالعكم", "s": 38.613, "e": 39.25, "line": 26, "who": "jeff"}, {"w": "اني", "s": 40.48, "e": 40.913, "line": 27, "who": "sulaili"}, {"w": "كيوته!", "s": 40.913, "e": 41.365, "line": 27, "who": "sulaili"}, {"w": "سليلي", "s": 41.902, "e": 42.536, "line": 29, "who": "narr"}, {"w": "الكيوت", "s": 42.536, "e": 43.11, "line": 29, "who": "narr"}, {"w": "لا", "s": 43.11, "e": 43.336, "line": 30, "who": "narr"}, {"w": "يغرّك", "s": 43.336, "e": 43.736, "line": 30, "who": "narr"}, {"w": "شكله", "s": 43.736, "e": 44.24, "line": 30, "who": "narr"}, {"w": "حتى", "s": 44.24, "e": 44.553, "line": 31, "who": "narr"}, {"w": "أمه", "s": 44.553, "e": 44.918, "line": 31, "who": "narr"}, {"w": "ما", "s": 44.918, "e": 45.075, "line": 31, "who": "narr"}, {"w": "تدري", "s": 45.075, "e": 45.405, "line": 31, "who": "narr"}, {"w": "شنو", "s": 45.405, "e": 45.858, "line": 31, "who": "narr"}, {"w": "ناوي", "s": 45.858, "e": 46.292, "line": 31, "who": "narr"}, {"w": "عليه", "s": 46.292, "e": 46.588, "line": 31, "who": "narr"}, {"w": "بس", "s": 47.473, "e": 48.062, "line": 32, "who": "sulaili_dark"}, {"w": "مو", "s": 48.062, "e": 48.287, "line": 33, "who": "sulaili_dark"}, {"w": "دايماً", "s": 48.287, "e": 48.674, "line": 33, "who": "sulaili_dark"}, {"w": "والعليش", "s": 50.025, "e": 50.502, "line": 34, "who": "narr"}, {"w": "أبو", "s": 50.502, "e": 50.746, "line": 34, "who": "narr"}, {"w": "زلف", "s": 50.746, "e": 51.076, "line": 34, "who": "narr"}, {"w": "زلفه", "s": 51.076, "e": 51.669, "line": 35, "who": "narr"}, {"w": "يوصل", "s": 51.669, "e": 52.051, "line": 35, "who": "narr"}, {"w": "قبله", "s": 52.051, "e": 52.486, "line": 35, "who": "narr"}, {"w": "بثانيتين", "s": 52.486, "e": 53.137, "line": 35, "who": "narr"}, {"w": "يبو", "s": 53.658, "e": 54.023, "line": 36, "who": "alaish"}, {"w": "خشم", "s": 54.023, "e": 54.389, "line": 36, "who": "alaish"}, {"w": "يبو", "s": 54.389, "e": 54.754, "line": 37, "who": "alaish"}, {"w": "خشيم!", "s": 54.754, "e": 55.302, "line": 37, "who": "alaish"}, {"w": "وفي", "s": 56.796, "e": 56.988, "line": 39, "who": "narr"}, {"w": "الصوب", "s": 56.988, "e": 57.276, "line": 39, "who": "narr"}, {"w": "الثاني", "s": 57.276, "e": 57.612, "line": 39, "who": "narr"}, {"w": "علي", "s": 58.129, "e": 58.433, "line": 41, "who": "narr"}, {"w": "الشبّاس", "s": 58.433, "e": 59.32, "line": 41, "who": "narr"}, {"w": "النسخة", "s": 59.32, "e": 59.929, "line": 42, "who": "narr"}, {"w": "التجريبية", "s": 59.929, "e": 60.743, "line": 42, "who": "narr"}, {"w": "لسه", "s": 60.743, "e": 61.302, "line": 43, "who": "narr"}, {"w": "فيها", "s": 61.302, "e": 61.615, "line": 43, "who": "narr"}, {"w": "أخطاء", "s": 61.615, "e": 61.974, "line": 43, "who": "narr"}, {"w": "أنا", "s": 62.4, "e": 62.617, "line": 44, "who": "ali"}, {"w": "الشبّاس", "s": 62.617, "e": 63.126, "line": 44, "who": "ali"}, {"w": "الأصلي", "s": 63.126, "e": 63.676, "line": 44, "who": "ali"}, {"w": "الأصلي", "s": 63.676, "e": 64.307, "line": 45, "who": "ali"}, {"w": "وعبودي", "s": 64.962, "e": 65.631, "line": 46, "who": "narr"}, {"w": "المتين", "s": 65.631, "e": 66.21, "line": 46, "who": "narr"}, {"w": "دبابة", "s": 66.21, "e": 66.933, "line": 47, "who": "narr"}, {"w": "على", "s": 66.933, "e": 67.038, "line": 47, "who": "narr"}, {"w": "رجلين", "s": 67.038, "e": 67.559, "line": 47, "who": "narr"}, {"w": "إذا", "s": 67.559, "e": 67.855, "line": 48, "who": "narr"}, {"w": "دعس", "s": 67.855, "e": 68.359, "line": 48, "who": "narr"}, {"w": "جهاز", "s": 68.359, "e": 68.812, "line": 49, "who": "narr"}, {"w": "الزلازل", "s": 68.812, "e": 69.438, "line": 49, "who": "narr"}, {"w": "يتصل", "s": 69.438, "e": 69.872, "line": 49, "who": "narr"}, {"w": "يتطمّن", "s": 69.872, "e": 70.429, "line": 49, "who": "narr"}, {"w": "عليه", "s": 70.429, "e": 70.625, "line": 49, "who": "narr"}, {"w": "خمسة", "s": 72.43, "e": 73.116, "line": 50, "who": "narr"}, {"w": "ضد", "s": 73.116, "e": 73.412, "line": 50, "who": "narr"}, {"w": "ثنين؟", "s": 73.412, "e": 73.986, "line": 50, "who": "narr"}, {"w": "سهالات", "s": 73.986, "e": 74.73, "line": 51, "who": "narr"}, {"w": "منو", "s": 75.506, "e": 76.213, "line": 53, "who": "aboudi"}, {"w": "قال", "s": 76.213, "e": 76.536, "line": 53, "who": "aboudi"}, {"w": "سهالات؟", "s": 76.536, "e": 77.229, "line": 53, "who": "aboudi"}, {"w": "لا", "s": 77.668, "e": 77.99, "line": 55, "who": "narr"}, {"w": "والله", "s": 77.99, "e": 78.72, "line": 55, "who": "narr"}, {"w": "مو", "s": 78.72, "e": 78.946, "line": 56, "who": "narr"}, {"w": "سهالات!", "s": 78.946, "e": 79.477, "line": 56, "who": "narr"}, {"w": "انتو", "s": 80.346, "e": 80.657, "line": 58, "who": "narr"}, {"w": "مستعدين", "s": 80.657, "e": 81.249, "line": 58, "who": "narr"}, {"w": "للحرب", "s": 81.249, "e": 81.666, "line": 59, "who": "narr"}, {"w": "العظمى؟", "s": 81.666, "e": 82.052, "line": 59, "who": "narr"}, {"w": "العليش", "s": 83.015, "e": 83.482, "line": 61, "who": "narr"}, {"w": "لا", "s": 83.482, "e": 83.682, "line": 62, "who": "narr"}, {"w": "تتأخر", "s": 83.682, "e": 84.082, "line": 62, "who": "narr"}, {"w": "هالمرة", "s": 84.082, "e": 84.548, "line": 62, "who": "narr"}, {"w": "زلفي", "s": 85.039, "e": 85.575, "line": 63, "who": "alaish"}, {"w": "وصل!", "s": 85.575, "e": 85.791, "line": 63, "who": "alaish"}], "marks": {"fish": 14.954, "followers": 34.767, "zalf": 51.076, "beta": 59.32, "quake": 68.359}, "lips": {"c_leader": {"s": 18.39, "env": [0.01, 0.54, 1.04, 0.75, 0.76, 1.01, 1.06, 0.74, 0.55, 0.33, 0.37, 0.63, 0.69, 0.53, 0.18, 0.09, 0.47, 0.42, 0.34, 0.34, 0.36, 0.99, 0.97, 0.39, 0.39, 0.65, 0.22, 0.35, 0.31, 0.29, 0.33, 1.07, 0.79, 0.76, 0.59, 0.38, 0.1, 0.04, 0.0, 0.06, 0.12, 0.03, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.3, 0.68, 0.35, 0.38, 0.29, 0.28, 1.05, 0.78, 0.6, 0.89, 1.0, 0.18, 0.09, 0.41, 0.74, 0.48, 0.42, 0.47, 0.27, 0.33, 0.43, 0.91, 0.73, 0.53, 0.82, 0.66, 0.58, 0.32, 0.35, 0.42, 0.51, 0.58, 0.98, 0.71, 0.1, 0.18, 0.32, 0.34, 0.6, 0.32, 0.1, 0.16, 0.09, 0.03, 0.0, 0.0, 0.05, 0.03, 0.09, 0.05, 0.08, 0.05, 0.05]}, "c_hasan": {"s": 28.483, "env": [0.0, 0.61, 0.91, 0.67, 0.23, 0.23, 0.68, 0.77, 0.34, 0.2, 0.05, 0.03, 0.28, 0.15, 0.02, 0.0, 0.0, 0.08, 0.58, 1.07, 0.91, 0.92, 0.99, 0.99, 1.04, 0.98, 0.52, 0.04, 0.1, 1.0, 0.78, 0.36, 0.18, 0.08, 0.04, 0.0, 0.0, 0.0, 0.02, 0.07, 0.03, 0.0, 0.0, 0.01, 0.07, 0.1, 0.02]}, "c_jeff": {"s": 36.38, "env": [0.0, 0.14, 0.38, 0.49, 0.44, 0.83, 0.94, 0.74, 0.63, 0.27, 0.17, 0.39, 0.97, 0.63, 0.18, 0.68, 1.02, 1.1, 0.8, 0.72, 0.82, 0.59, 0.56, 0.74, 0.98, 0.88, 0.83, 0.88, 0.4, 0.56, 0.64, 0.52, 0.42, 0.54, 0.76, 0.65, 0.48, 0.21, 0.22, 0.21, 0.15, 0.13, 0.05, 0.04, 0.03, 0.01, 0.01, 0.01, 0.0, 0.17, 0.49, 0.29, 0.64, 0.68, 0.6, 0.64, 0.3, 0.8, 0.72, 0.62, 0.55, 0.63, 1.11, 0.8, 0.29, 0.2, 0.42, 0.19, 0.24, 0.44, 0.08, 0.23, 1.08, 1.1, 0.77, 0.47, 0.33, 0.53, 0.43, 0.35, 0.2, 0.08, 0.12, 0.07, 0.1, 0.11, 0.03, 0.01, 0.01, 0.03, 0.02]}, "c_sul_cute": {"s": 40.433, "env": [0.0, 0.28, 0.94, 1.06, 0.9, 0.83, 0.99, 1.01, 0.82, 0.37, 0.04, 0.19, 0.3, 0.38, 0.84, 0.78, 0.68, 0.75, 0.53, 0.68, 0.5, 0.35, 0.84, 0.93, 0.87, 0.71, 0.64, 0.64, 0.35, 0.17, 0.05, 0.0]}, "c_sul_dark": {"s": 47.422, "env": [0.0, 0.06, 0.66, 1.05, 0.87, 0.71, 0.49, 0.59, 0.5, 0.41, 0.2, 0.05, 0.0, 0.0, 0.0, 0.0, 0.0, 0.03, 0.64, 0.91, 1.0, 0.82, 0.64, 0.42, 0.25, 1.04, 0.95, 0.71, 0.69, 0.62, 0.5, 0.56, 0.71, 0.93, 0.6, 0.38, 0.28, 0.2, 0.13, 0.02]}, "c_alaish": {"s": 53.613, "env": [0.0, 0.11, 0.35, 0.83, 1.1, 0.65, 0.46, 0.65, 0.77, 0.53, 0.15, 0.26, 0.85, 0.93, 0.44, 0.42, 0.38, 0.7, 0.52, 0.44, 0.2, 0.2, 0.19, 0.11, 0.08, 0.0, 0.0, 0.02, 0.68, 1.2, 1.07, 0.47, 0.24, 0.88, 0.93, 0.3, 0.11, 0.18, 0.94, 0.53, 0.27, 0.31, 0.31, 0.64, 0.67, 0.56, 0.66, 0.37, 0.18, 0.17, 0.05, 0.0]}, "c_ali": {"s": 62.353, "env": [0.0, 0.46, 0.97, 1.0, 1.02, 0.86, 0.82, 0.42, 0.48, 0.48, 0.46, 0.52, 0.74, 0.21, 0.2, 0.18, 0.11, 0.96, 1.2, 0.6, 0.3, 0.21, 0.09, 0.35, 0.27, 0.2, 0.36, 0.21, 0.36, 0.29, 0.16, 0.15, 0.25, 0.29, 0.33, 0.14, 0.04, 0.02, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.07, 0.87, 0.48, 0.55, 0.57, 0.25, 0.27, 0.25, 0.1, 0.34, 0.59, 0.69, 0.76, 0.82, 0.65, 0.2, 0.01]}, "c_aboudi": {"s": 75.455, "env": [0.0, 0.05, 0.18, 0.19, 0.54, 0.36, 0.23, 0.28, 0.48, 0.53, 0.56, 0.54, 0.44, 0.39, 0.33, 0.18, 0.02, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.23, 0.35, 0.98, 1.08, 1.07, 1.03, 0.76, 0.88, 0.7, 0.37, 0.52, 0.51, 0.79, 0.57, 0.38, 0.45, 0.64, 0.74, 0.7, 0.39, 0.36, 0.6, 0.57, 0.5, 0.49, 0.3, 0.04, 0.0, 0.07, 0.07, 0.02]}, "c_alaish_end": {"s": 84.994, "env": [0.0, 0.46, 0.66, 0.77, 1.2, 0.96, 0.89, 0.77, 0.13, 0.14, 0.15, 0.58, 0.71, 0.52, 0.54, 0.79, 1.0, 0.6, 0.18, 0.23, 1.0, 0.94, 0.58, 0.1, 0.02]}}, "dur": 88.85}/*END*/;
let EXPO = /*EXPO*/{"0": 0.987, "1": 0.45, "2": 0.742, "3": 0.802, "4": 2.3, "5": 1.763, "6": 0.734, "7": 0.712, "8": 1.8, "9": 1.532, "10": 1.254, "11": 0.709, "12": 1.225, "13": 0.782}/*END*/;
const ORDER = [['n0', .8, 3.0], ['n1', .55, 1.5], ['n2', .7, 3.2], ['n3', 1.5, 1.1], ['n4', 1.35, 4.8], ['c_leader', 1.0, 2.4], ['n5', 2.0, 4.6], ['c_hasan', .7, 1.6], ['n6', 1.3, 4.4], ['c_jeff', .5, 2.4],
  ['c_sul_cute', 1.2, 1.0], ['n7', .45, 4.4], ['c_sul_dark', .9, 1.3], ['n8', 1.5, 3.4], ['c_alaish', .6, 1.6], ['n9', 1.6, 1.4], ['n10', .6, 3.2], ['c_ali', .45, 2.2], ['n11', .7, 5.2], ['n12', 2.0, 2.2],
  ['c_aboudi', .9, 1.4], ['n13', .45, 1.6], ['n14', 1.0, 2.4], ['n15', .5, 1.8], ['c_alaish_end', .5, .9]];
if (!TL){ TL = { lines: {}, words: [], marks: {}, lips: {} }; let t = 0; ORDER.forEach(([id, pre, d], i) => { const s = i ? t + pre : pre; TL.lines[id] = { s, e: s + d, who: id.startsWith('n') ? 'narr' : id.split('_')[1] }; t = s + d; }); TL.dur = t + 3.0; }
const DUR = TL.dur;
const L = id => TL.lines[id];
const MK = (k, d) => TL.marks[k] ?? d;

const glc = document.getElementById('gl'), uic = document.getElementById('ui'), g = uic.getContext('2d');
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, W / H, .3, 30000);
const FILL = new THREE.DirectionalLight(0xFFE8D6, 1.1); scene.add(FILL, FILL.target);   // soft key from the camera side: faces never go to silhouette
let world, zones, post, C, PR, crowd, pigeons, AN;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------------- NPC layout ----------------
function crowdDefs(){
  const r = rng(4242), D = [], add = d => { D.push(d); return D.length - 1; };
  for (let i = 0; i < 26; i++){ const z = i % 2 ? 42.6 : 57.4, x0 = -210 + r() * 420; add({ zone: 'ocean', type: 'walk', x: x0, z, x2: x0 + (r() < .5 ? 1 : -1) * (25 + r() * 40), z2: z, sp: .9 + r() * .5 }); }
  for (let i = 0; i < 22; i++){ let x, z; do { x = -130 + r() * 260; z = 9 + r() * 24; } while (Math.abs(x + 30) < 9 && z < 16 || Math.abs(x) < 6 || Math.abs(x + 40) < 5);
    add({ zone: 'beach', type: r() < .45 ? 'lie' : 'stand', x, z, ry: r() * 6.28, y: 0 }); }
  const honkJumpers = [];
  for (let i = 0; i < 30; i++){ const z = i % 2 ? 321.4 : 338.6, x0 = -150 + r() * 300; honkJumpers.push(add({ zone: 'down', type: 'walk', x: x0, z, x2: x0 + (r() < .5 ? 1 : -1) * (20 + r() * 30), z2: z, sp: .8 + r() * .5 })); }
  for (let i = 0; i < 4; i++) honkJumpers.push(add({ zone: 'down', type: 'walk', x: -82 + i * 1.3, z: 323.5, x2: -82 + i * 1.3, z2: 336.5, sp: .5 }));
  const papz = []; for (let i = 0; i < 7; i++){ const sd = i % 2 ? 1 : -1, k = Math.floor(i / 2); papz.push(add({ zone: 'plaza', type: 'stand', x: PLAZA.x + sd * (2.6 + k * .9), z: PLAZA.z - 8 + .6 + k * .9 - (i === 6 ? -1.5 : 0), ry: 0 })); }
  for (let i = 0; i < 10; i++){ const x0 = PLAZA.x - 30 + r() * 60, z0 = PLAZA.z - 25 + r() * 40; add({ zone: 'plaza', type: 'walk', x: x0, z: z0, x2: x0 + (r() - .5) * 30, z2: z0 + (r() - .5) * 20, sp: .8 }); }
  const fleers = []; for (let i = 0; i < 10; i++){ const z = i % 2 ? 42.6 : 57.4; fleers.push(add({ zone: 'dusk', type: 'stand', x: 214 + r() * 26, z, ry: -Math.PI / 2 })); }
  const onlook = []; for (let i = 0; i < 12; i++){ const z = i % 2 ? 42.4 : 57.6, x = (i < 6 ? -1 : 1) * (12 + r() * 14); onlook.push(add({ zone: 'ocean', type: 'stand', x, z, ry: Math.atan2(-x, 50 - z) })); }
  return { D, honkJumpers, papz, fleers, onlook };
}
let CD;

function build(){
  world = buildWorld(scene, renderer);
  zones = buildZones(scene, world);
  post = makePost(renderer, scene, camera, W, H);
  C = {
    leader: makeChar({ skin: 0xC08458, shirt: T.shirt(1, '#FF5FA2', 'palm', '#2E8B57'), pants: 0xF2E6D0, shorts: true, shoes: 0xFFFFFF, hair: 0x15100C, beard: true, glasses: 'gold', hat: 'bucket', hatColor: 0xEAD7A8, chain: true }),
    hasan: makeChar({ skin: 0xB97C52, shirt: T.shirt(2, '#2FC4B8', 'flamingo', '#FF7FB6'), pants: 0x2B2F3A, shoes: 0xFF4F9A, hair: 0x120D0A, mustache: true, beard: true, hat: 'cap', hatColor: 0xFF4F9A }),
    jeff: makeChar({ skin: 0xC9905F, shirt: T.shirt(3, '#FFD24A', 'flower', '#FF5A4F'), pants: 0x3A6EA5, hair: 0x1A120C, mole: true, mustache: true }),
    sulaili: makeChar({ skin: 0xD39C6E, shirt: T.shirt(4, '#C9B3FF', 'heart', '#FF5FA2'), pants: 0xF4F0FF, shorts: true, hair: 0x1B130E, blush: true, glasses: 'dark' }),
    alaish: makeChar({ skin: 0xBE8559, shirt: T.shirt(5, '#FF8A3D', 'leaf', '#2F7A3A'), pants: 0xEEE6D6, shorts: true, hair: 0x100B08, sideburns: 'huge' }),
    ali: makeChar({ skin: 0xC08458, shirt: T.shirt(6, '#1E2F6B', 'track', '#3FE6FF'), pants: 0x1E2F6B, sleeve: 'long', hair: 0x15100C, beard: true, glasses: 'cheap', hat: 'bucket', hatColor: 0x2B3F8F, chain: true }),
    aboudi: makeChar({ skin: 0xB27A50, shirt: T.shirt(7, '#14161C', 'track', '#3FE6FF'), pants: 0x23395E, hair: 0x0E0A08, beard: true, bulk: 1.55 }),
  };
  C.aboudi.scale.setScalar(1.1);
  for (const k in C) scene.add(C[k]);
  PR = {
    car: P.makeCar(0xFF3F9A, '#FF3FD0'), rod: P.makeRod(), fish: P.makeFish(), gun: P.makeWaterGun(),
    phone: new THREE.Mesh(new THREE.BoxGeometry(.08, .16, .015), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .2, metalness: .5 })),
    traffic: [P.makeCar(0x2FC4B8, '#3FF2FF'), P.makeCar(0xF5F2EA, '#FFD23F'), P.makeCar(0xFFC23F, '#FF6F3F')],
    rivalCar: P.makeCar(0x1E2F6B, '#3FE6FF'), parked: P.makeCar(0x7A5BD6, '#B07CFF'),
    hearts: new THREE.Group(), sparks: new THREE.Group(), flashes: new THREE.Group(), weed: new THREE.Group(), spit: new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), new THREE.MeshStandardMaterial({ color: 0xE8F0F0, roughness: .1, transparent: true, opacity: .85 })),
    wheel: new THREE.Mesh(new THREE.TorusGeometry(.18, .025, 8, 24), new THREE.MeshStandardMaterial({ color: 0x111111 })),
  };
  const hg = P.heartGeo(), hm = new THREE.MeshStandardMaterial({ color: 0xFF4FA8, emissive: 0xFF2F88, emissiveIntensity: 1.5, roughness: .3 });
  for (let i = 0; i < 9; i++){ const h = new THREE.Mesh(hg, hm); h.scale.setScalar(.22 + (i % 3) * .06); PR.hearts.add(h); }
  const st = P.sparkleTex();
  const spr = () => new THREE.Sprite(new THREE.SpriteMaterial({ map: st, color: new THREE.Color(3, 2.8, 2.2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  for (let i = 0; i < 6; i++) PR.sparks.add(spr());
  for (let i = 0; i < 7; i++){ const f = spr(); f.material = f.material.clone(); f.material.color.setRGB(6, 6, 6); PR.flashes.add(f); }
  const ft = T.frond(); for (let i = 0; i < 4; i++){ const pl = new THREE.Mesh(new THREE.PlaneGeometry(.9, .9), new THREE.MeshStandardMaterial({ map: ft, alphaTest: .4, side: THREE.DoubleSide, color: 0xB89A5A })); pl.rotation.set(i * .8, i * 1.3, i * .4); PR.weed.add(pl); }
  for (const k in PR){ const v = PR[k]; (Array.isArray(v) ? v : [v]).forEach(o => { scene.add(o); o.traverse(m => { if (m.isMesh) m.castShadow = true; }); }); }
  PR.car.add(PR.wheel); PR.wheel.position.set(.05, 1.12, .42); PR.wheel.rotation.y = Math.PI / 2; PR.wheel.rotation.x = .5;
  C.leader.userData.J.handR.add(PR.rod); PR.rod.position.set(0, -.02, .02);
  C.sulaili.userData.J.handR.add(PR.phone); PR.phone.position.set(0, -.05, .06);
  C.sulaili.userData.J.handL.add(PR.gun); PR.gun.position.set(0, -.06, .05); PR.gun.rotation.set(0, 0, -Math.PI / 2); PR.gun.scale.setScalar(.62);
  // living world
  CD = crowdDefs(); crowd = makeCrowd(scene, CD.D);
  pigeons = makePigeons(scene, 26);
  AN = { flam: [], camels: [], dogs: [], cats: [], dolph: [], crab: makeCrab() };
  for (let i = 0; i < 8; i++){ const f = makeFlamingo(); scene.add(f); AN.flam.push(f); }
  for (let i = 0; i < 3; i++){ const c = makeCamel(); scene.add(c); AN.camels.push(c); }
  for (let i = 0; i < 3; i++){ const d = makeQuad('dog', [0x8A5A3A, 0xE8D8C0, 0x222222][i]); scene.add(d); AN.dogs.push(d); }
  for (let i = 0; i < 3; i++){ const c = makeQuad('cat', [0xF2A040, 0x444444, 0xFFFFFF][i]); scene.add(c); AN.cats.push(c); }
  for (let i = 0; i < 2; i++){ const d = makeDolphin(); scene.add(d); AN.dolph.push(d); }
  scene.add(AN.crab);
}

// ---------------- per-frame helpers ----------------
let ENV, FXv, Q;
function resetFrame(){
  for (const k in C) C[k].visible = false;
  for (const k in PR){ const v = PR[k]; (Array.isArray(v) ? v : [v]).forEach(o => o.visible = false); }
  const SJ = C.sulaili.userData.J; SJ.glasses.visible = false; SJ.glasses.position.y = .035;
  ENV = { tod: .3, bloom: .45, expo: 1 }; Q = [];
  FXv = { vignette: .5, grain: .03, chroma: .0012, whip: 0, whipAng: 0, comic: 0, glitch: 0, gseed: 0, sat: 1.16, temp: .1, contrast: 1.08, flash: 0, letterbox: 1, zoomBlur: 0, bw: 0 };
  post.fx.flashCol.value.setRGB(1, 1, 1);
}
function cam(pos, look, fov = 38, roll = 0){
  camera.position.copy(pos); camera.fov = fov; camera.updateProjectionMatrix(); camera.up.set(Math.sin(roll), Math.cos(roll), 0); camera.lookAt(look);
  FILL.position.copy(camera.position).add(V(0, 1.5, 0)); FILL.target.position.copy(look);
}
const show = (...xs) => xs.forEach(o => o.visible = true);
const lp3 = (a, b, k) => a.clone().lerp(b, k);
function onScreen(obj){ const v = new THREE.Vector3(); obj.getWorldPosition(v); v.project(camera); return [(v.x * .5 + .5) * W, (-v.y * .5 + .5) * H]; }
function standIdle(ch, x, y, z, ry, t, extra = {}, ph = 0){ pose(ch, { x, y, z, ry, ...anim.idle(t, ph), ...extra }); show(ch); }
// lip sync: mouth follows the line's loudness envelope
function talk(id, t){ const lp = TL.lips[id], ln = L(id); if (!ln || t < ln.s || t > ln.e) return null;
  let v = .55 + .45 * Math.sin((t - ln.s) * 22); if (lp){ const i = Math.floor((t - lp.s) * 30); v = lp.env[cl(i, 0, lp.env.length - 1)] ?? 0; }
  return v > .12 ? { mouth: 'o', mouthOpen: .45 + v * .9, hp: -.05 * v } : { mouth: 'flat' }; }
function crowdZone(zonesOn){ CD.D.forEach(d => d.hidden = !zonesOn.includes(d.zone)); }

// ---------------- shots ----------------
let SHOTS = [];
function buildShots(){
  const S = [], add = (t0, t1, o) => S.push({ t0, t1, ...o });
  const b1 = L('n1').s - .35, b2 = L('n2').s - .5, b3 = L('n3').s - .45, b4 = L('n4').s - .7, b5 = L('n5').s - 1.65, b6 = L('n6').s - .75, b7 = L('c_sul_cute').s - .75,
    b8 = L('n8').s - .8, b9 = L('n9').s - .35, b10 = L('n10').s - .3, b11 = L('n11').s - .3, b12 = L('n12').s - 1.4, b13 = L('n14').s - .7;
  const E = world.pierEnd;

  // S0 — sunset over the sea, drone turns to reveal Leonida
  add(0, b1, { loc: 'sea', run(c){
    const k = eio(seg(c.st, 0, c.d)), ky = eio(seg(c.st, c.d * .42, c.d));
    const pos = lp3(V(30, 230, -320), V(-25, 62, -175), k), yaw = deg(lerp(192, 352, ky)), pitch = deg(lerp(-1.5, -11, ky));
    cam(pos, pos.clone().add(V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(100)), 44, deg(lerp(-3, 1, k)));
    world.setFocus(V(0, 0, 30)); ENV.tod = .2; ENV.bloom = lerp(.3, .45, k); crowdZone(['beach', 'ocean']);
    FXv.flash = 1 - seg(c.t, 0, .5); FXv.flashCol = [0, 0, 0]; trafficRun(c.st + 3, 1);
  }});
  // S1 — no wifi
  add(b1, b2, { loc: 'beach', run(c){
    const ch = C.sulaili, p = V(-36, 0, 26);
    standIdle(ch, p.x, 0, p.z, Math.PI, c.st, { aR: [0, 2.9, -.25, 0], hp: -.35, brow: -.35, browUp: .012, mouth: 'o', mouthOpen: .6, look: [0, 1] }, 2);
    cam(V(-36.9, 1.45, 22.6).add(V(0, 0, .25 * eo(seg(c.lt, 0, c.d)))), V(-36.1, 1.85, 26), 40, deg(-3));
    show(PR.phone); world.setFocus(p); ENV.tod = .3; crowdZone(['beach']);
    const [sx, sy] = onScreen(ch.userData.J.handR); Q.push(g2 => UI.wifi(g2, cl(sx + 230, 300, 1620), cl(sy + 60, 290, 780), seg(c.lt, .1, .55)));
  }});
  // S2 — Ocean Drive crane + title slam
  add(b2, b3, { loc: 'ocean', run(c){
    const k = seg(c.st, 0, c.d), x = lerp(-120, -20, eio(k));
    cam(V(x, lerp(1.4, 32, eio(seg(c.st, .6, c.d))), lerp(45, 30, eio(k))), V(x + 60, lerp(4, 12, eio(k)), 64), lerp(36, 46, k), deg(lerp(2, -2, k)));
    world.setFocus(V(x + 20, 0, 50)); ENV.tod = .35; trafficRun(c.st + 8, 1.2); crowdZone(['ocean', 'beach']);
    const ts = c.t - (L('n2').e + .02);
    Q.push(g2 => { UI.bigTitle(g2, 'الحرب العظمى', 960, 450, seg(ts, 0, .35), { size: 230 }); UI.txt(g2, 'ليونيدا  •  19.11.2026', 960, 610, { font: '64px Lalezar', fill: '#FFFFFF', stroke: '#000', sw: 10, glow: '#FF3FA4', gb: 22, alpha: seg(ts, .35, .7) }); });
    if (ts > 0){ FXv.flash = .7 * (1 - seg(ts, 0, .18)); FXv.chroma = .004 * (1 - seg(ts, 0, .5)); }
  }});
  // S3 — team walks toward camera, front-lit (camera on the sea side)
  add(b3, b4, { loc: 'beach', run(c){
    const team = [[C.leader, 0, 0], [C.hasan, -1.5, .6], [C.jeff, 1.5, .5], [C.sulaili, -2.9, 1.2], [C.alaish, 2.9, 1.1]];
    team.forEach(([ch, dx, dz], i) => { const z = 17 + dz - c.st * .8; pose(ch, { x: dx, z, ry: Math.PI, ...anim.walk(c.st, .55, i * 1.3), flap: ch === C.alaish ? Math.sin(c.st * 6) * .2 : 0 }); show(ch); });
    show(PR.rod); cam(V(-.2, 1.0, 6.5 - c.st * .5), V(0, 1.7, 30), 34, deg(-1.5)); world.setFocus(V(0, 0, 14)); ENV.tod = .7; crowdZone(['beach', 'ocean']);
    Q.push(g2 => UI.teamBadge(g2, 'فريق الصياد', 960, 300, seg(c.t, L('n3').s - .1, L('n3').s + .35), 'sayyad'));
  }});
  // S4 — the leader on the pier (side-lit), fish in sunglasses, dolphins behind
  add(b4, b5, { loc: 'pier', switchIn: true, freezeAt: L('c_leader').e + .1, card: { name: 'الشبّاس الصيّاد', sub: 'القائد', team: 'sayyad', teamLabel: 'فريق الصياد', stats: [['القيادة', 1, '100%'], ['الصيد', 1, '100%'], ['الخوف', 0.02, '0%']] }, run(c){
    const ls = c.st, punch = MK('fish', L('n4').s + 2.6) - c.t0, turn = eo(seg(ls, punch + .3, punch + .8)), reel = seg(ls, punch - .45, punch);
    const ch = C.leader, lp = V(E.x - .3, E.y, E.z - 4.3), tk = talk('c_leader', c.t);
    pose(ch, { x: lp.x, y: lp.y, z: lp.z, ry: lerp(Math.PI, Math.PI / 2 + .35, turn), ...anim.idle(ls), aR: [lerp(-1.1, -1.9, reel), .15, lerp(-.5, -.2, turn), 0], aL: [-.9, -.1, -1.2, .4], lean: -.08 * reel, hy: turn * .2, mouth: turn > .5 ? 'smile' : 'flat', brow: turn * .3, ...(tk || {}) });
    show(ch, PR.rod); PR.rod.rotation.set(lerp(-.9, -.25, reel), 0, 0);
    const fk = seg(ls, punch - .25, punch + .35); if (fk > 0){ show(PR.fish); const fp = lp3(V(E.x - 2.2, -.2, E.z - 11), V(E.x - 1.1, E.y + 1.95, E.z - 3.45), eo(fk)); fp.y += Math.sin(fk * Math.PI) * 1.1; PR.fish.position.copy(fp); PR.fish.rotation.set(0, -Math.PI / 2 + Math.sin(ls * 14) * .3 * (1 - fk * .5), Math.sin(ls * 9) * .4); PR.fish.scale.setScalar(1.1); }
    AN.dolph.forEach((d, i) => { const ph = ((ls * .55 + i * .5) % 1); d.visible = true; d.position.set(E.x - 30 - i * 14, -1 + Math.sin(ph * Math.PI) * 4.2, E.z - 26 - i * 9 + ph * 6); d.rotation.set(0, -.3, -Math.cos(ph * Math.PI) * .9); });
    cam(V(E.x + 4.6, E.y + 1.55, E.z - 3.7), V(E.x - .6, E.y + 1.35, E.z - 4.9), 36, deg(-1.5)); world.setFocus(V(E.x, E.y, E.z - 4)); ENV.tod = .75;
    if (fk > 0) Q.push(g2 => { const [sx, sy] = onScreen(PR.fish); UI.pop(g2, 'حتى السمك!', cl(sx + 60, 330, 1000), cl(sy + 270, 330, 820), seg(c.t, c.t0 + punch + .1, c.t0 + punch + 1.6), { color: '#FF6F3F', size: 70, rot: .1 }); });
  }});
  // S5 — downtown: the horn arrives before Hasan
  add(b5, b6, { loc: 'down', switchIn: true, freezeAt: L('c_hasan').e + .15, card: { name: 'حسن محمد البيب', sub: 'هرنه يوصل قبله', team: 'sayyad', teamLabel: 'فريق الصياد', stats: [['السرعة', .99, '99%'], ['استخدام الهرن', 1.25, '1000%'], ['الفرامل', .03, '3%']] }, run(c){
    const ls = c.st, honk = .75, arrive = L('n5').e - .5 - c.t0, ak = eo(seg(ls, arrive - 1.2, arrive));
    const carX = lerp(-60, -4, ak), carZ = 327; PR.car.position.set(carX, 0, carZ); PR.car.rotation.set(0, 0, 0); show(PR.car, PR.wheel); PR.car.userData.wheels.forEach(w => w.rotation.z = -carX * 2.6);
    const ch = C.hasan, tk = talk('c_hasan', c.t), look = seg(ls, arrive + .2, arrive + .9);
    pose(ch, { x: carX - .62, y: .16, z: carZ + .38, ry: Math.PI / 2, lL: [-1.45, 1.35], lR: [-1.45, 1.35], aL: [-1.25, -.05, -.6, .2], aR: tk ? [0, 2.4, -.5, 0] : [-1.25, .05, -.6, -.2], hy: lerp(0, Math.sin(ls * 3) * .9, look), mouth: 'smile', brow: .3, ...(tk || {}) }); show(ch);
    CD.honkJumpers.forEach(i => CD.D[i].jumpAt = c.t0 + honk); pigeons.setVisible(true); pigeons.update(c.t, V(-8, 0, 333), c.t0 + honk + .05);
    AN.dogs[1].visible = true; AN.dogs[1].position.set(6 + Math.sin(c.t * .3) * 4, 0, 321.2); quadPose(AN.dogs[1], c.t, 1);
    cam(V(10, 1.6, 321.6), V(-14, 1.6, 330.5), 40, deg(-1)); world.setFocus(V(-4, 0, 327)); ENV.tod = .5; crowdZone(['down', 'plaza']);
    Q.push(g2 => { UI.pop(g2, 'بيب!', 640, 330, seg(c.t, c.t0 + honk - .05, c.t0 + honk + .95), { color: '#FF3FA4', rot: -.15 }); UI.pop(g2, 'بيب!', 1010, 260, seg(c.t, c.t0 + honk + .27, c.t0 + honk + 1.2), { color: '#3FE6FF', rot: .12, size: 70 });
      const lk = seg(c.t, c.t0 + honk + .9, c.t0 + arrive); if (lk > 0 && lk < 1) UI.txt(g2, '...حسن في الطريق', 960, 840, { font: '800 40px Tajawal', fill: '#FFC83A', stroke: '#000', sw: 8, alpha: cl(lk * 6) * cl((1 - lk) * 6) }); });
  }});
  // S6 — the plaza: the mole has more followers than him
  add(b6, b7, { loc: 'plaza', switchIn: true, freezeAt: L('c_jeff').e + .1, card: { name: 'الجيف جيف جيفي', stutter: ['الجيف ', 'جيف ', 'جيفي'], sub: 'أبو شامة', team: 'sayyad', teamLabel: 'فريق الصياد', nameSize: 74, stats: [['الدقة', .7, '70%'], ['متابعين الشامة', 1.25, '1M'], ['متابعينه هو', .03, '12']] }, run(c){
    const ls = c.st, p = V(PLAZA.x, .18, PLAZA.z - 8), ch = C.jeff, tk = talk('c_jeff', c.t);
    standIdle(ch, p.x, p.y, p.z, Math.PI, ls, { hy: -.12, brow: .2, mouth: 'smile', look: [-.3, 0], ...(tk || {}) }, 1);
    const fol = MK('followers', L('n6').s + 2.6), push = eio(seg(c.t, L('c_jeff').s - .2, L('c_jeff').e));
    const dist = lerp(6.5, 1.25, push), fov = lerp(34, 2 * Math.atan(.85 / dist) * 180 / Math.PI, push);
    cam(V(p.x - .2, 1.62 + p.y, p.z - dist), V(p.x - .05, 1.68 + p.y, p.z), fov, deg(1));
    CD.papz.forEach((i, k) => { CD.D[i].ry = Math.atan2(p.x - CD.D[i].x, p.z - CD.D[i].z); });
    show(PR.flashes); PR.flashes.children.forEach((f, k) => { const d = CD.D[CD.papz[k]], on = c.t > fol && hash(Math.floor(c.t * 9) * 13 + k * 7) > .72; f.visible = on; f.position.set(d.x, 1.75, d.z); f.scale.setScalar(.9); });
    world.setFocus(p); ENV.tod = .55; crowdZone(['plaza', 'down']);
    const J = ch.userData.J, ding = L('c_jeff').s + .2; if (c.t >= ding){ show(PR.sparks); const mp = new THREE.Vector3(); J.mole.getWorldPosition(mp); PR.sparks.children.forEach((s, i) => { s.visible = i === 0; s.position.copy(mp).add(V(0, 0, -.03)); s.scale.setScalar(.04 * (1 + Math.sin(c.t * 20) * .2)); }); }
    Q.push(g2 => { if (c.t > fol) UI.pop(g2, '1M متابع', 1380, 300, seg(c.t, fol, fol + 1.6), { color: '#FF3FA4', size: 60, rot: .08 }); const [sx, sy] = onScreen(J.mole); UI.circleMark(g2, sx, sy, 46, seg(c.t, ding + .1, ding + .7), 'الشامة'); });
  }});
  // S7 — beach: «اني كيوته» then the twist
  add(b7, b8, { loc: 'beach2', switchIn: true, freezeAt: L('c_sul_dark').e + .1, card: { name: 'سليلي الكيوت', sub: 'السلاح السري', team: 'sayyad', teamLabel: 'فريق الصياد', stats: [['اللطافة', 1, '100%'], ['الخطورة', 1.25, '???'], ['البراءة', .4, '40%']] }, run(c){
    const ls = c.st, ch = C.sulaili, p = V(-30, 0, 7.5), twist = L('c_sul_dark').s - .45 - c.t0, tw = seg(ls, twist, twist + .25);
    const tk = talk('c_sul_cute', c.t) || talk('c_sul_dark', c.t);
    standIdle(ch, p.x, 0, p.z, Math.PI, ls, tw > 0 ? { aL: [-1.45, .05, -.1, .15], aR: [0, .2, -.1, 0], brow: -.45, mouth: 'flat', eyes: .9, hy: -.05, ...(tk || {}) } : { aR: [-.4, .7, -2.5, -.6], aL: [-.4, -.7, -2.5, .6], hr: Math.sin(ls * 4) * .14, mouth: 'smile', brow: .3, eyes: 1.2, ...(tk || {}) }, 4);
    const J = ch.userData.J; J.glasses.visible = tw > 0; J.glasses.position.y = .035 + (1 - eo(tw)) * .5;
    show(PR.hearts); PR.hearts.visible = tw < 1; PR.hearts.children.forEach((h, i) => { const a = i * .7 + ls * 1.2; h.position.set(p.x + Math.cos(a) * (.9 + i * .05), 1 + ((ls * .5 + i * .23) % 1.6), p.z - .5 + Math.sin(a) * .5); h.rotation.y = ls * 2 + i; });
    if (tw > 0) show(PR.gun);
    AN.flam.slice(0, 5).forEach((f, i) => { const fx = p.x + [-3.6, -2.4, 2.6, 3.8, 5][i], fz = p.z + [1.5, 3.2, 2.2, .6, 3.6][i], flee = tw > 0 ? (ls - twist) * 4 : 0; f.visible = true; f.position.set(fx + Math.sign(fx - p.x) * flee, 0, fz + flee * .6); f.rotation.y = Math.sign(fx - p.x) > 0 ? -.3 : Math.PI + .3; f.children[0].position.y = 1.05 + Math.sin(c.t * 2 + i) * .02; });
    AN.crab.visible = true; AN.crab.position.set(p.x + 1.2 + Math.sin(c.t * 1.2) * .6, 0, p.z - 1.4); AN.crab.rotation.y = Math.PI / 2;
    cam(V(p.x - .4, 1.3, p.z - 5.3).lerp(V(p.x - .2, 1.4, p.z - 3.9), eio(seg(ls, 0, c.d))), V(p.x, 1.25, p.z + 2), 38, deg(-1.5)); world.setFocus(p); ENV.tod = .55; crowdZone(['beach', 'ocean']);
    if (tw > 0){ FXv.temp = -.2; FXv.flash = .45 * (1 - seg(ls, twist, twist + .15)); post.fx.flashCol.value.setRGB(1, .2, .3); }
    Q.push(g2 => { if (tw <= 0) UI.pop(g2, '+100 لطافة', 600, 330, seg(c.t, L('c_sul_cute').s, L('c_sul_cute').s + 1.5), { color: '#FF8FE8', size: 64, rot: -.08 }); });
  }});
  // S8 — desert: Alaish, the camel and «يبو خشم يبو خشيم»
  add(b8, b9, { loc: 'desert', switchIn: true, freezeAt: L('c_alaish').e + .9, card: { name: 'العليش أبو زلف', sub: 'زلفه يوصل قبله', team: 'sayyad', teamLabel: 'فريق الصياد', stats: [['طول الزلف', 1.25, '∞'], ['مقاومة الريح', .02, '0%'], ['احترام الجمال', .05, '5%']] }, run(c){
    const ls = c.st, ch = C.alaish, p = V(DS.x, 0, DS.z), arrive = MK('zalf', L('n8').s + 1.6) - c.t0, enter = eo(seg(ls, arrive - .1, arrive + 1.3));
    const tk = talk('c_alaish', c.t), spitT = L('c_alaish').e + .25 - c.t0, sp = seg(ls, spitT, spitT + .35), hit = ls > spitT + .35;
    standIdle(ch, p.x - (1 - enter) * 2.4, 0, p.z, Math.PI / 2 - .35, ls * .5, { flap: .25 + Math.sin(ls * 7) * .2, hp: -.1, mouth: hit ? 'o' : 'smile', mouthOpen: 1.1, eyes: hit ? 1.35 : 1, brow: hit ? -.3 : .3, aR: tk ? [-1.4, .3, -.1, 0] : [-.2, .2, -2.2, .3], ...(tk || {}) }, 3);
    const cm = AN.camels[0]; cm.visible = true; cm.scale.setScalar(.82); cm.position.set(p.x + 3.4, 0, p.z + 2.0); cm.rotation.y = Math.PI + .45; camelPose(cm, c.t, 0, lerp(0, .55, seg(ls, spitT - .7, spitT - .2)), seg(ls, spitT - .15, spitT) * (1 - seg(ls, spitT + .3, spitT + .6)));
    if (sp > 0 && sp < 1){ show(PR.spit); const mouth = V(p.x + 2.5, 2.5, p.z + 1.6), face = V(p.x - (1 - enter) * 2.4 + .1, 1.75, p.z + .1); PR.spit.position.copy(lp3(mouth, face, sp)).add(V(0, Math.sin(sp * Math.PI) * .3, 0)); }
    AN.camels.slice(1).forEach((cc, i) => { cc.visible = true; cc.position.set(p.x + 40 + i * 18 - c.t * .6, Math.max(0, zones.dune(p.x + 40, p.z + 70)), p.z + 70 + i * 10); cc.rotation.y = Math.PI; camelPose(cc, c.t + i, 1); });
    cam(V(p.x - .1, 1.6, p.z - 7.2), V(p.x + .3, 1.5, p.z + .6), 40, deg(-1.5)); world.setFocus(p); ENV.tod = .7; crowdZone([]);
    Q.push(g2 => { if (ls < arrive + .2) UI.txt(g2, 'الزلف وصل ✔', 960, 300, { font: '70px Lalezar', fill: '#fff', stroke: '#000', sw: 10, alpha: seg(c.t, c.t0 + .7, c.t0 + 1) });
      const lk = seg(c.t, c.t0 + .9, c.t0 + arrive); if (lk < 1 && lk > 0){ UI.txt(g2, 'العليش: جاري التحميل...', 960, 390, { font: '800 44px Tajawal', fill: '#FFC83A', stroke: '#000', sw: 8 }); g2.fillStyle = 'rgba(255,255,255,.25)'; g2.fillRect(760, 430, 400, 16); g2.fillStyle = '#FFC83A'; g2.fillRect(760, 430, 400 * lk, 16); }
      if (hit) UI.pop(g2, 'تفففف!', 760, 330, seg(c.t, c.t0 + spitT + .3, c.t0 + spitT + 1.3), { color: '#9BE8A0', size: 66, rot: -.12 }); });
  }});
  // S9 — glitch into the other side (dusk)
  add(b9, b10, { loc: 'dusk', glitchIn: true, run(c){
    const ls = c.st; ENV.tod = 2; ENV.bloom = .75; crowdZone(['dusk']);
    PR.rivalCar.position.set(232, 0, 50.5); PR.rivalCar.rotation.y = Math.PI; show(PR.rivalCar);
    standIdle(C.ali, 226, .03, 49.2, -Math.PI / 2, ls, anim.cross(), 1); standIdle(C.aboudi, 226, .03, 51.4, -Math.PI / 2, ls, anim.cross(), 2);
    cam(V(lerp(196, 214, eio(seg(ls, 0, c.d))), .9, 50.2), V(240, 1.6, 50.3), 30, 0); world.setFocus(V(226, 0, 50));
    FXv.glitch = .9 * (1 - seg(ls, 0, .5)); FXv.gseed = Math.floor(c.t * 24); FXv.temp = -.35; FXv.sat = .95;
  }});
  // S10 — Ali, the beta version (robot voice + glitches)
  add(b10, b11, { loc: 'dusk', freezeAt: L('c_ali').e + .1, card: { name: 'علي الشبّاس', sub: 'النسخة التجريبية', team: 'rival', teamLabel: 'الفريق الثاني', stats: [['الأصالة', .12, '12%'], ['الأخطاء', 1.25, '404'], ['التقليد', 1, '100%']] }, run(c){
    const ls = c.st, ch = C.ali, p = V(224, .03, 49.4), tk = talk('c_ali', c.t); ENV.tod = 2; ENV.bloom = .75; crowdZone(['dusk']);
    const jit = tk ? (hash(Math.floor(c.t * 15)) - .5) * .04 : 0;
    standIdle(ch, p.x + jit, p.y, p.z, -Math.PI / 2 - .55, ls, { aR: [-1.4, .15, -.2, 0], aL: [-.9, -.1, -1.2, .4], mouth: 'smile', brow: .3, hy: .2, ...(tk || {}) }, 1);
    PR.rivalCar.position.set(232, 0, 50.5); PR.rivalCar.rotation.y = Math.PI; show(PR.rivalCar);
    cam(V(p.x - 3.3, 1.5, p.z - 1.0), V(p.x, 1.45, p.z), 34, deg(2)); world.setFocus(p);
    const st = MK('beta', L('n10').s + 1.1), gl = (tk && hash(Math.floor(c.t * 12)) > .7 ? .45 : 0) + .6 * (1 - seg(c.t, st, st + .3)) * (c.t > st ? 1 : 0);
    FXv.glitch = gl; FXv.gseed = Math.floor(c.t * 30); FXv.temp = -.35;
    Q.push(g2 => { UI.stamp(g2, 'BETA', 620, 420, seg(c.t, st, st + 1.5), { color: '#3FE6FF' }); if (tk) UI.txt(g2, 'ERROR 404: ORIGINAL NOT FOUND', 960, 230, { font: '900 40px Anton', dir: 'ltr', fill: '#FF4F4F', stroke: '#000', sw: 6, alpha: hash(Math.floor(c.t * 8)) > .3 ? 1 : .2 }); });
  }});
  // S11 — Aboudi: every step, the world reacts (no camera shake)
  add(b11, b12, { loc: 'dusk', freezeAt: b12 - .7, card: { name: 'عبودي المتين', sub: 'دبابة على رجلين', team: 'rival', teamLabel: 'الفريق الثاني', stats: [['الصلابة', 1, '100%'], ['السرعة', .05, '5%'], ['قابلية التحريك', .0, '0%']] }, run(c){
    const ls = c.st, ch = C.aboudi; ENV.tod = 2; ENV.bloom = .75; crowdZone(['dusk']);
    const z = 50.3, x = lerp(232, 226.5, seg(ls, 0, c.d * .9)), w = anim.walk(ls, .42);
    pose(ch, { x, z, ry: -Math.PI / 2, ...w, aL: [-.2, -.35, -.3], aR: [.2, .35, -.3], brow: -.35, mouth: 'flat' }); show(ch);
    const steps = [], stepT = n => c.t0 + n * 1.36; for (let n = 1; stepT(n) < c.t1; n++) steps.push(stepT(n));
    const lastStep = steps.filter(s => s <= c.t).pop(), sk = lastStep ? Math.max(0, 1 - (c.t - lastStep) * 3) : 0;
    PR.parked.position.set(229, sk * .12, 46.6); PR.parked.rotation.set(0, 0, sk * .03); show(PR.parked);
    CD.fleers.forEach((i, k) => { const d = CD.D[i]; d.fleeAt = (steps[k % Math.max(1, steps.length)] ?? 1e9); d.fleeDir = [d.x < 226 ? -1 : 1, d.z < 50 ? -.4 : .4]; });
    AN.cats.forEach((ct, i) => { ct.visible = true; const jk = steps[0] ? seg(c.t, steps[0], steps[0] + .5) : 0; ct.position.set(222 + i * 3 + jk * (i % 2 ? 3 : -3), Math.sin(jk * Math.PI) * 1.2, 45.4 + i * .6); ct.rotation.y = i % 2 ? 0 : Math.PI; quadPose(ct, c.t, jk > 0 ? 1 : 0); });
    cam(V(x - 5.6, 1.25, z - 1.4), V(x, 1.65, z), 32, deg(-2)); world.setFocus(V(x, 0, z));
    FXv.temp = -.35;
    const quake = MK('quake', L('n11').s + 3.4);
    Q.push(g2 => { if (lastStep && c.t - lastStep < .6) UI.pop(g2, 'دووم', 520, 300, seg(c.t, lastStep, lastStep + .6), { color: '#3FE6FF', size: 60, rot: -.2 });
      const pk = seg(c.t, quake, quake + .4); if (pk > 0) phoneCall(g2, pk, c.t); });
  }});
  // S12 — the standoff on Ocean Drive; Aboudi: «منو قال سهالات؟»
  add(b12, b13, { loc: 'ocean', switchIn: true, run(c){
    const ls = c.st; ENV.tod = 1.6; ENV.bloom = .6; crowdZone(['ocean']);
    const stomp = L('c_aboudi').e + .15 - c.t0, backK = eo(seg(ls, stomp + .05, stomp + .4)), jump = Math.sin(seg(ls, stomp + .05, stomp + .4) * Math.PI) * .35;
    const Lt = [[C.leader, -2.7, 50], [C.hasan, -3.7, 48.9], [C.jeff, -3.8, 51.1], [C.sulaili, -4.8, 49.7], [C.alaish, -4.9, 51.8]];
    const laugh = seg(c.t, L('n12').s, L('n12').e + .2) * (1 - seg(c.t, L('c_aboudi').s - .2, L('c_aboudi').s));
    Lt.forEach(([ch, x, z], i) => standIdle(ch, x - backK * 1.2, jump, z, Math.PI / 2, ls, laugh > 0 ? { ...anim.flex(ls + i), lean: -.1, mouth: 'o', mouthOpen: .6 + .4 * Math.abs(Math.sin(c.t * 12 + i)) } : (backK > 0 ? { mouth: 'o', mouthOpen: 1.1, eyes: 1.3, brow: -.2 } : { flap: ch === C.alaish ? .15 + Math.sin(ls * 6) * .15 : 0 }), i));
    if (backK > 0){ const S2 = C.sulaili; S2.position.x = -6.1; S2.position.z = 52.4; }
    C.sulaili.userData.J.glasses.visible = true;
    const ax = lerp(2.9, 2.0, eo(seg(c.t, L('c_aboudi').s - .4, L('c_aboudi').s))), tk = talk('c_aboudi', c.t);
    standIdle(C.ali, 3.0, 0, 49.4, -Math.PI / 2, ls, anim.cross(), 5); standIdle(C.aboudi, ax, 0, 51.1, -Math.PI / 2, ls, { ...anim.cross(), brow: -.4, ...(tk || {}) }, 6);
    const pull = eio(seg(ls, 0, c.d));
    cam(V(-.5, lerp(1.9, 1.55, pull), lerp(60.4, 59.0, pull)), V(-.6, 1.5, 40), 44, 0); world.setFocus(V(0, 0, 50));
    CD.onlook.forEach(i => { CD.D[i].jumpAt = c.t0 + stomp; });
    if (ls < SW.post + 1.6 && ls > SW.post) Q.push(g2 => UI.vsSplit(g2, seg(ls, SW.post, SW.post + .5) * (1 - seg(ls, SW.post + 1.2, SW.post + 1.6)) * 1.6, 'فريق الصياد  (5)', 'الفريق الثاني  (2)'));
    show(PR.weed); PR.weed.position.set(lerp(-12, 12, seg(ls, 1.8, 5.2)), .45 + Math.abs(Math.sin(ls * 6)) * .3, 46.8); PR.weed.rotation.z = -ls * 6;
    FXv.flash = Math.max(0, 1 - Math.abs(ls - stomp) * 6) * .25;
  }});
  // S13 — finale: crane to the sky, the question, Alaish late again
  add(b13, DUR, { loc: 'ocean', run(c){
    const ls = c.st; ENV.tod = 1.7; ENV.bloom = .7; crowdZone(['ocean']);
    const late = seg(c.t, L('c_alaish_end').s - .9, L('c_alaish_end').s + .3);
    const Lt = [[C.leader, -3.9, 50], [C.hasan, -4.9, 48.9], [C.jeff, -5.0, 51.1], [C.sulaili, -6.1, 52.4]];
    Lt.forEach(([ch, x, z], i) => standIdle(ch, x, 0, z, Math.PI / 2, ls, {}, i)); C.sulaili.userData.J.glasses.visible = true;
    const tk = talk('c_alaish_end', c.t);
    if (late > 0){ pose(C.alaish, { x: lerp(-16, -6.0, eo(late)), z: 51.8, ry: Math.PI / 2, ...anim.walk(ls, 1.8), flap: .5 + Math.sin(ls * 9) * .4, mouth: 'smile', ...(tk || {}) }); show(C.alaish); }
    standIdle(C.ali, 3.0, 0, 49.4, -Math.PI / 2, ls, anim.cross(), 5); standIdle(C.aboudi, 2.0, 0, 51.1, -Math.PI / 2, ls, anim.cross(), 6);
    const kk = eio(seg(ls, 0, Math.max(.1, L('n15').s - c.t0 - .2)));
    if (c.t < L('n15').s - .3) cam(V(0, lerp(1.6, 30, kk), lerp(59, 30, kk)), V(0, lerp(1.6, 30, kk), lerp(40, -600, kk)), lerp(40, 50, kk), 0);
    else cam(V(-2, 1.6, 58.6), V(-4.5, 1.4, 50.6), 42, 0);
    world.setFocus(V(0, 0, 50));
    const qs = L('n14').s, endT = DUR - 2.8;
    Q.push(g2 => { const a = seg(c.t, qs - .1, qs + .5) * (1 - seg(c.t, L('n15').s - .4, L('n15').s - .1));
      UI.txt(g2, 'انتو مستعدين', 960, 420, { font: '120px Lalezar', fill: '#FFFFFF', stroke: '#000', sw: 12, glow: '#FF3FA4', gb: 30, alpha: a });
      UI.txt(g2, 'للحرب العظمى؟', 960, 580, { font: '150px Lalezar', fill: '#FFC83A', stroke: '#000', sw: 14, glow: '#FF8A2E', gb: 36, alpha: seg(c.t, qs + .9, qs + 1.3) * (1 - seg(c.t, L('n15').s - .4, L('n15').s - .1)) });
      if (c.t > L('n15').s - .1 && c.t < L('c_alaish_end').s - .9) UI.txt(g2, 'وين العليش؟', 600, 330, { font: '72px Lalezar', fill: '#FFF', stroke: '#FF2A4A', sw: 12, alpha: seg(c.t, L('n15').s, L('n15').s + .3) });
      const fk = seg(c.t, endT, endT + .35);
      if (fk > 0){ g2.fillStyle = `rgba(0,0,0,${.6 * fk})`; g2.fillRect(0, 0, W, H); UI.bigTitle(g2, 'الحرب العظمى', 960, 470, fk, { size: 240 });
        UI.txt(g2, 'الشبّاس الصيّاد  ×  علي الشبّاس', 960, 650, { font: '64px Lalezar', fill: '#fff', stroke: '#000', sw: 10, alpha: seg(c.t, endT + .4, endT + .7) });
        UI.txt(g2, '19.11.2026  •  ليونيدا', 960, 740, { font: '900 52px Anton', dir: 'rtl', fill: '#FFC83A', alpha: seg(c.t, endT + .6, endT + .9) });
        UI.finePrint(g2, '* فريق الصياد لا يتحمل مسؤولية تأخير العليش', seg(c.t, endT + 1.0, endT + 1.3)); } });
    FXv.flash = c.t > endT ? .8 * (1 - seg(c.t, endT, endT + .25)) : 0;
    if (c.t > DUR - .45){ FXv.flash = seg(c.t, DUR - .45, DUR); post.fx.flashCol.value.setRGB(0, 0, 0); }
  }});
  for (const s of S) if (s.freezeAt != null) s.freezeAt = cl(s.freezeAt, s.t1 - .9, s.t1 - .3);
  SHOTS = S;
}
function phoneCall(g2, k, t){
  const x = 1380, y = 300, s = back(cl(k * 1.4)); g2.save(); g2.translate(x, y); g2.scale(s, s);
  g2.fillStyle = 'rgba(12,16,24,.92)'; g2.beginPath(); g2.roundRect(-230, -90, 460, 180, 26); g2.fill(); g2.strokeStyle = '#3FE6FF'; g2.lineWidth = 4; g2.stroke();
  UI.txt(g2, 'مركز رصد الزلازل', 30, -36, { font: '800 40px Tajawal', fill: '#fff' }); UI.txt(g2, '...يتصل يتطمّن', 30, 22, { font: '700 32px Tajawal', fill: '#3FE6FF' });
  g2.fillStyle = Math.sin(t * 12) > 0 ? '#2AFF6A' : '#1A9F4A'; g2.beginPath(); g2.arc(-170, 0, 36, 0, 7); g2.fill();
  g2.strokeStyle = '#fff'; g2.lineWidth = 6; g2.lineCap = 'round'; g2.beginPath(); g2.arc(-170, 0, 16, Math.PI * .65, Math.PI * 1.35); g2.stroke();
  g2.strokeStyle = '#FF4F4F'; g2.lineWidth = 3; g2.beginPath(); for (let i = 0; i < 60; i++){ const xx = -200 + i * 7, yy = 70 + Math.sin(i * 1.7 + t * 30) * (i > 25 && i < 40 ? 16 : 3); i ? g2.lineTo(xx, yy) : g2.moveTo(xx, yy); } g2.stroke();
  g2.restore();
}
function trafficRun(t, sp = 1){
  PR.traffic.forEach((car, i) => { const lane = i % 2 ? 46.6 : 53.4, dir = i % 2 ? 1 : -1, x = ((t * (10 + i * 4) * sp + i * 70) % 260) - 130;
    car.position.set(dir * x, 0, lane); car.rotation.y = dir > 0 ? 0 : Math.PI; car.userData.wheels.forEach(w => w.rotation.z = -x * 2.6 * dir); show(car); });
}
function ambient(t){
  AN.flam.slice(5).forEach((f, i) => { f.visible = true; f.position.set(60 + i * 3, 0, 4 + i); f.rotation.y = i; });
  const d0 = AN.dogs[0]; d0.visible = true; d0.position.set(((t * 1.2) % 80) - 40, 0, 42.2); d0.rotation.y = 0; quadPose(d0, t, 1);
  const d2 = AN.dogs[2]; d2.visible = true; d2.position.set(PLAZA.x + 8 + Math.sin(t * .4) * 6, .18, PLAZA.z - 14); quadPose(d2, t, 1);
}

// ---------------- GTA-style character switch ----------------
const SW = { pre: .5, post: .6, H: 170 };
function capturePose(){ return { p: camera.position.clone(), q: camera.quaternion.clone(), fov: camera.fov }; }
function runShot(sh, t, st){ sh.run({ t, lt: t - sh.t0, st, d: sh.t1 - sh.t0, t0: sh.t0, t1: sh.t1 }); }
const DOWNQ = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(V(0, 0, 0), V(0, -1, 0), V(0, 0, -1)));
function switchCam(A, B, k){
  const up = V(0, 1, 0), H = SW.H + Math.min(260, A.p.distanceTo(B.p) * .25), k1 = .33, k2 = .64;
  let p, q, fov;
  if (k < k1){ const u = ei(k / k1); p = A.p.clone().addScaledVector(up, u * H); q = A.q.clone().slerp(DOWNQ, eo(k / k1)); fov = lerp(A.fov, 55, u); }
  else if (k < k2){ const u = eio((k - k1) / (k2 - k1)); p = V(lerp(A.p.x, B.p.x, u), lerp(A.p.y, B.p.y, u) + H, lerp(A.p.z, B.p.z, u)); q = DOWNQ.clone(); fov = 55; }
  else { const u = eo((k - k2) / (1 - k2)); p = B.p.clone().addScaledVector(up, (1 - u) * H); q = DOWNQ.clone().slerp(B.q, ei((k - k2) / (1 - k2))); fov = lerp(55, B.fov, u); }
  camera.position.copy(p); camera.quaternion.copy(q); camera.fov = fov; camera.updateProjectionMatrix();
  FILL.position.copy(p);
  const blur = k < k1 ? Math.sin(k / k1 * Math.PI) : k < k2 ? 1 : Math.sin((1 - (k - k2) / (1 - k2)) * Math.PI * .5);
  FXv.zoomBlur = k < k1 || k >= k2 ? blur * .7 : 0; FXv.whip = k >= k1 && k < k2 ? .55 : 0; FXv.whipAng = Math.atan2(B.p.z - A.p.z, B.p.x - A.p.x);
  FXv.sat = lerp(1.16, .7, Math.sin(k * Math.PI)); FXv.temp = lerp(.1, -.15, Math.sin(k * Math.PI));
}

// ---------------- render ----------------
function seek(t, out = null){
  t = cl(t, 0, DUR - 1e-4);
  const i = SHOTS.findIndex(s => t >= s.t0 && t < s.t1), ii = i < 0 ? SHOTS.length - 1 : i, sh = SHOTS[ii];
  resetFrame(); pigeons.setVisible(false); AN.flam.forEach(f => f.visible = false); [...AN.camels, ...AN.dogs, ...AN.cats, ...AN.dolph, AN.crab].forEach(a => a.visible = false);
  CD.D.forEach(d => { d.jumpAt = null; d.fleeAt = null; });
  ambient(t);
  const lt = t - sh.t0, d = sh.t1 - sh.t0, frozen = sh.freezeAt != null && t > sh.freezeAt;
  const nx = SHOTS[ii + 1], inOut = nx && nx.switchIn && t > nx.t0 - SW.pre, inIn = sh.switchIn && lt < SW.post;
  let swK = null;
  if (inOut || inIn){
    const A = inOut ? sh : SHOTS[ii - 1], B = inOut ? nx : sh, b = B.t0, ta = b - SW.pre, tb = b + SW.post;
    runShot(A, ta, A.freezeAt != null && ta > A.freezeAt ? A.freezeAt - A.t0 : ta - A.t0); const pa = capturePose(), envA = ENV.tod;
    runShot(B, tb, tb - B.t0); const pb = capturePose(), envB = ENV.tod;
    swK = (t - ta) / (tb - ta); Q = []; ENV.tod = lerp(envA, envB, eio(swK)); crowdZone(['ocean', 'beach', 'down', 'plaza', 'dusk']); switchCam(pa, pb, swK);
  } else {
    const st = frozen ? sh.freezeAt - sh.t0 : lt;
    sh.run({ t, lt, st, d, t0: sh.t0, t1: sh.t1 });
    if (sh.glitchIn){ FXv.glitch = Math.max(FXv.glitch, 1 - seg(lt, 0, .35)); FXv.gseed = Math.floor(t * 30); }
    if (nx && nx.glitchIn){ const k = seg(lt, d - .3, d); FXv.glitch = Math.max(FXv.glitch, k); FXv.gseed = Math.floor(t * 30); }
    if (frozen){ const fk = seg(t, sh.freezeAt, sh.freezeAt + .12); FXv.comic = fk; FXv.flash = Math.max(FXv.flash, .5 * (1 - seg(t, sh.freezeAt, sh.freezeAt + .15))); FXv.sat = 1.25; }
  }
  crowd.update(frozen && swK == null ? sh.freezeAt : t);
  zones.update(t);
  world.apply(t, ENV.tod, camera); renderer.toneMappingExposure *= ENV.expo * (EXPO[ii] ?? 1);
  post.bloom.strength = ENV.bloom;
  const f = post.fx; for (const k in FXv){ if (k === 'flashCol') continue; if (f[k]) f[k].value = FXv[k]; }
  if (FXv.flashCol) f.flashCol.value.setRGB(...FXv.flashCol);
  f.time.value = t;
  post.composer.render();
  const G = out || g; if (out) out.drawImage(glc, 0, 0); else g.clearRect(0, 0, W, H);
  for (const q of Q) q(G);
  if (sh.card && swK == null){ const c0 = sh.t0 + (sh.switchIn ? SW.post + .1 : .35); let k = seg(t, c0, c0 + .5); if (t > sh.t1 - .25) k = 1 + seg(t, sh.t1 - .25, sh.t1); UI.nameCard(G, k, sh.card); }
  const rival = SHOTS[9] && t >= SHOTS[9].t0 && t < SHOTS[12].t0;
  if (t < L('n14').s - .2 || t > L('n15').s - .2) UI.captions(G, t, TL.words, rival ? '#3FE6FF' : '#FFC83A');
}
window.seek = seek;
window.__events = () => {
  const E = [], add = (type, t, x = {}) => E.push({ type, t: +t.toFixed(3), ...x });
  SHOTS.forEach((s, i) => { if (i > 0){ if (s.switchIn) add('switch', s.t0 - SW.pre, { d: SW.pre + SW.post }); else add(s.glitchIn ? 'glitch' : 'cut', s.t0); } if (s.card){ add('card', s.t0 + (s.switchIn ? SW.post + .1 : .35)); if (s.freezeAt != null) add('freeze', s.freezeAt); } });
  const S = i => SHOTS[i];
  add('scratch', S(1).t0); add('title', L('n2').e + .02); add('badge', L('n3').s - .1);
  const fish = MK('fish', L('n4').s + 2.6); add('splash', fish - .25); add('pop', fish + .1); add('reel', fish - .45);
  add('honk', S(5).t0 + .75); add('honk', S(5).t0 + 1.07); add('pigeons', S(5).t0 + .8); add('car', L('n5').e - 1.7); add('screech', L('n5').e - .55);
  add('ding', L('c_jeff').s + .2); add('scribble', L('c_jeff').s + .3); [0, .12, .24].forEach(o => add('blip', S(6).t0 + SW.post + .2 + o)); const fol = MK('followers', L('n6').s + 2.6); add('cameras', fol, { d: S(6).t1 - fol });
  add('cute', L('c_sul_cute').s - .1); add('danger', L('c_sul_dark').s - .45);
  add('wind', S(8).t0 + .6, { d: S(8).t1 - S(8).t0 - .6 }); add('check', S(8).t0 + .7); add('loading', S(8).t0 + .9, { d: MK('zalf', L('n8').s + 1.6) - S(8).t0 - .9 }); add('arrive', MK('zalf', L('n8').s + 1.6)); add('spit', L('c_alaish').e + .25); add('camel', L('c_alaish').e - .3);
  add('beta', MK('beta', L('n10').s + 1.1));
  for (let n = 1; S(11).t0 + n * 1.36 < S(11).t1; n++) add('step', S(11).t0 + n * 1.36); add('alarm', S(11).t0 + 1.36, { d: 2.2 }); add('phone', MK('quake', L('n11').s + 3.4), { d: 2.2 });
  add('vs', S(12).t0 + SW.post); add('whistle', S(12).t0 + 1.4); add('tumble', S(12).t0 + 1.8); add('stomp', L('c_aboudi').e + .15); add('flex', L('n12').s + .2);
  add('riser', S(13).t0 - 1.2); add('late', L('c_alaish_end').s - .9); add('final', DUR - 2.8); add('end', DUR - .45);
  return { shots: SHOTS.map(s => [s.t0, s.t1]), dur: DUR, events: E.sort((a, b) => a.t - b.t) };
};
window.__dbg = t => ({ dur: DUR, shots: SHOTS.map((s, i) => [i, +s.t0.toFixed(2), +s.t1.toFixed(2), s.loc, !!s.switchIn]) });
window.__lum = (t) => { seek(t); const c = document.createElement('canvas'); c.width = 96; c.height = 54; const x = c.getContext('2d'); x.drawImage(glc, 0, 0, 96, 54); const d = x.getImageData(0, 8, 96, 38).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += .299 * d[i] + .587 * d[i + 1] + .114 * d[i + 2]; return s / (d.length / 4) / 255; };
const outC = document.createElement('canvas'); outC.width = W; outC.height = H; const og = outC.getContext('2d');
window.frame = (t, q = .92) => { seek(t, og); return outC.toDataURL('image/jpeg', q); };
window.DUR = DUR;
window.ready = (async () => {
  await Promise.all(['120px Lalezar', '900 60px Tajawal', '800 40px Tajawal', '700 30px Tajawal', '900 60px Anton'].map(f => document.fonts.load(f)));
  await document.fonts.ready;
  build(); buildShots(); seek(0); return true;
})();
if (!location.search.includes('render')) window.ready.then(() => { const t0 = performance.now(); const loop = () => { seek(((performance.now() - t0) / 1000) % DUR); requestAnimationFrame(loop); }; loop(); });
