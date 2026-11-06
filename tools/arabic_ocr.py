"""قراءة نص عربي من صورة أو PDF بنموذج Qari-OCR (NAMAA-Space، Apache-2.0). بطيء على CPU.
python arabic_ocr.py page.png|file.pdf [--model NAMAA-Space/Qari-OCR-v0.3-VL-2B-Instruct] [--dpi 200]"""
import sys, argparse, torch
from PIL import Image
from transformers import AutoProcessor
try: from transformers import Qwen2VLForConditionalGeneration as M
except ImportError: from transformers import AutoModelForImageTextToText as M
ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('--model', default='NAMAA-Space/Qari-OCR-v0.3-VL-2B-Instruct'); ap.add_argument('--dpi', type=int, default=200)
a = ap.parse_args()
if a.src.lower().endswith('.pdf'):
    from pdf2image import convert_from_path; pages = convert_from_path(a.src, dpi=a.dpi)
else: pages = [Image.open(a.src).convert('RGB')]
torch.set_num_threads(max(1, torch.get_num_threads()))
model = M.from_pretrained(a.model, torch_dtype=torch.float32).eval(); proc = AutoProcessor.from_pretrained(a.model)
prompt = "Below is the image of one page of a document, as well as some raw textual content that was previously extracted for it. Just return the plain text representation of this document as if you were reading it naturally. Do not hallucinate."
for i, img in enumerate(pages, 1):
    img.thumbnail((1400, 1400))
    msgs = [{"role": "user", "content": [{"type": "image"}, {"type": "text", "text": prompt}]}]
    text = proc.apply_chat_template(msgs, tokenize=False, add_generation_prompt=True)
    x = proc(text=[text], images=[img], return_tensors='pt')
    with torch.no_grad(): y = model.generate(**x, max_new_tokens=2000, do_sample=False)
    print(f'--- صفحة {i} ---'); print(proc.batch_decode(y[:, x['input_ids'].shape[1]:], skip_special_tokens=True)[0].strip(), flush=True)
