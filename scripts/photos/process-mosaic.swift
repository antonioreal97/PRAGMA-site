// Prepara fotos do mosaico da abertura a partir de scripts/photos/mosaic.txt.
//
// Uso:  swift scripts/photos/process-mosaic.swift
//
// Para cada JPEG da lista:
//   1. regrava com ffmpeg — o ImageIO do macOS devolve preto em JPEG
//      com gain map (HDR de iPhone); o ffmpeg lê a imagem base, aplica
//      a orientação e descarta EXIF/GPS;
//   2. converte para sRGB;
//   3. grava AVIF com lado maior 640px, SEM metadados.
//      640px cobre a coluna do mosaico em tela retina; o arquivo
//      entra no bundle do Vite como fallback, então precisa ser leve.

import CoreGraphics
import Foundation
import ImageIO

let root = FileManager.default.currentDirectoryPath
let sourceDir = "\(root)/FOTOS"
let outDir = "\(root)/artifacts/pragma-live-production/src/assets/mosaic"
let maxSide = 640
let avifQuality = 0.45

func fail(_ message: String) -> Never {
    FileHandle.standardError.write(Data("erro: \(message)\n".utf8))
    exit(1)
}

func ffmpegBin() -> String {
    for path in ["/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg"]
    where FileManager.default.isExecutableFile(atPath: path) {
        return path
    }
    fail("ffmpeg não encontrado")
}

/// JPEG comum, já orientado e sem EXIF. Apaga no fim do processamento.
func normalizeJPEG(_ src: String) -> String {
    let dst = NSTemporaryDirectory() + "pragma-\(UUID().uuidString).jpg"
    let proc = Process()
    proc.executableURL = URL(fileURLWithPath: ffmpegBin())
    proc.arguments = [
        "-hide_banner", "-loglevel", "error", "-y", "-i", src,
        "-map_metadata", "-1", "-q:v", "3", dst,
    ]
    let pipe = Pipe()
    proc.standardError = pipe
    do { try proc.run() } catch { fail("ffmpeg: \(error)") }
    proc.waitUntilExit()
    guard proc.terminationStatus == 0 else {
        let err = String(data: pipe.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
        fail("ffmpeg falhou em \(src): \(err)")
    }
    return dst
}

func loadOriented(_ path: String) -> CGImage {
    let url = URL(fileURLWithPath: path)
    guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
        let props = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any],
        let w = props[kCGImagePropertyPixelWidth] as? Int,
        let h = props[kCGImagePropertyPixelHeight] as? Int
    else { fail("não consegui ler \(path)") }
    let options: [CFString: Any] = [
        kCGImageSourceCreateThumbnailFromImageAlways: true,
        kCGImageSourceCreateThumbnailWithTransform: true,
        kCGImageSourceThumbnailMaxPixelSize: max(w, h),
        kCGImageSourceShouldCacheImmediately: true,
    ]
    guard let image = CGImageSourceCreateThumbnailAtIndex(source, 0, options as CFDictionary)
    else { fail("não consegui decodificar \(path)") }
    return image
}

/// Redimensiona para o lado maior pedido; altura e largura ficam pares.
/// Usa premultipliedLast — noneSkipLast deixa pretas várias JPEGs de celular.
func render(_ image: CGImage, maxSide: Int) -> CGImage {
    let srcW = image.width
    let srcH = image.height
    let scale = Double(maxSide) / Double(max(srcW, srcH))
    let width = max(2, Int((Double(srcW) * scale / 2).rounded()) * 2)
    let height = max(2, Int((Double(srcH) * scale / 2).rounded()) * 2)
    guard let srgb = CGColorSpace(name: CGColorSpace.sRGB),
        let ctx = CGContext(
            data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 0,
            space: srgb,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
    else { fail("não consegui criar o contexto de \(width)×\(height)") }
    ctx.interpolationQuality = .high
    ctx.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
    guard let out = ctx.makeImage() else { fail("falha ao renderizar \(width)×\(height)") }
    return out
}

func write(_ image: CGImage, to path: String) {
    let url = URL(fileURLWithPath: path)
    guard let dest = CGImageDestinationCreateWithURL(url as CFURL, "public.avif" as CFString, 1, nil)
    else { fail("o sistema não grava AVIF") }
    let properties: [CFString: Any] = [
        kCGImageDestinationLossyCompressionQuality: avifQuality,
    ]
    CGImageDestinationAddImage(dest, image, properties as CFDictionary)
    guard CGImageDestinationFinalize(dest) else { fail("falha ao gravar \(path)") }
}

let listPath = "\(root)/scripts/photos/mosaic.txt"
guard let list = try? String(contentsOfFile: listPath, encoding: .utf8) else {
    fail("lista não encontrada: \(listPath)")
}
let sources = list.split(whereSeparator: \.isNewline).map { String($0).trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty && !$0.hasPrefix("#") }
guard !sources.isEmpty else { fail("scripts/photos/mosaic.txt está vazio") }
for name in sources {
    guard FileManager.default.fileExists(atPath: "\(sourceDir)/\(name)") else {
        fail("foto da lista não está em FOTOS: \(name)")
    }
}

try? FileManager.default.createDirectory(atPath: outDir, withIntermediateDirectories: true)
if let stale = try? FileManager.default.contentsOfDirectory(atPath: outDir) {
    for name in stale where name.hasPrefix("tile-") && (name.hasSuffix(".jpg") || name.hasSuffix(".avif")) {
        try? FileManager.default.removeItem(atPath: "\(outDir)/\(name)")
    }
}

var manifest: [[String: Any]] = []

for (index, name) in sources.enumerated() {
    let src = "\(sourceDir)/\(name)"
    let normalized = normalizeJPEG(src)
    defer { try? FileManager.default.removeItem(atPath: normalized) }
    let image = loadOriented(normalized)
    // Encolhe até o lado maior pedido; se já cabe, só regrava em sRGB sem EXIF.
    let target = min(maxSide, max(image.width, image.height))
    let out = render(image, maxSide: target)
    let outName = String(format: "tile-%02d.avif", index + 1)
    let outPath = "\(outDir)/\(outName)"
    write(out, to: outPath)
    manifest.append([
        "file": outName,
        "width": out.width,
        "height": out.height,
    ])
    print("\(outName): \(image.width)×\(image.height) → \(out.width)×\(out.height)")
}

let manifestURL = URL(fileURLWithPath: "\(outDir)/manifest.json")
let json = try! JSONSerialization.data(withJSONObject: manifest, options: [.prettyPrinted, .sortedKeys])
try! json.write(to: manifestURL)
print("pronto: \(sources.count) tiles em \(outDir)")
