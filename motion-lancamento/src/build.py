"""Gera os dois projetos HyperFrames a partir de src/template.html + _base/.
   feed-4x5/   → 1080×1350 (4:5, feed do LinkedIn)
   wide-16x9/  → 1920×1080 (16:9, enquadramento adaptado)
Cada pasta é um projeto HyperFrames independente (index.html + assets/).
Uso (na pasta pragma-motion):  python3 src/build.py"""
import shutil
from pathlib import Path
root = Path(__file__).resolve().parent.parent
t = (root / "src/template.html").read_text(encoding="utf-8")
base = root / "_base"
for folder, W, H, fmt, label in [("feed-4x5", 1080, 1350, "portrait", "4:5"), ("wide-16x9", 1920, 1080, "landscape", "16:9")]:
    d = root / folder
    d.mkdir(exist_ok=True)
    # project files (hyperframes.json, package.json, meta.json, ...) + assets mirrored from _base
    for f in base.iterdir():
        if f.is_file():
            shutil.copy2(f, d / f.name)
    shutil.copytree(base / "assets", d / "assets", dirs_exist_ok=True)
    s = t.replace("{{W}}", str(W)).replace("{{H}}", str(H)).replace("{{FMT}}", fmt).replace("{{FMTLABEL}}", label)
    (d / "index.html").write_text(s, encoding="utf-8")
    print("wrote", folder + "/index.html")
