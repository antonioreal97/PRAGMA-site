import fitz
import os

pdf_path = "attached_assets/PRAGMA_-_Apresentacao_Visual_da_Marca_1789659028158.pdf"
out_dir = ".agents/outputs/pragma_pages"
os.makedirs(out_dir, exist_ok=True)

doc = fitz.open(pdf_path)
print("pages", doc.page_count, "metadata", doc.metadata)
for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    out = os.path.join(out_dir, f"page-{i + 1:02d}.png")
    pix.save(out)
    print(
        i + 1,
        "size",
        page.rect.width,
        page.rect.height,
        "images",
        len(page.get_images(full=True)),
        "text_chars",
        len(page.get_text()),
    )

for i, page in enumerate(doc):
    for j, img in enumerate(page.get_images(full=True)):
        xref = img[0]
        info = doc.extract_image(xref)
        ext = info["ext"]
        out = os.path.join(out_dir, f"embedded-p{i + 1:02d}-{j + 1:02d}.{ext}")
        with open(out, "wb") as f:
            f.write(info["image"])
        print("embedded", i + 1, j + 1, info["width"], info["height"], ext, out)