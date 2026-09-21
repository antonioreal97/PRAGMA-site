// Prepara fotos para o site a partir dos originais (câmera ou celular).
//
// Uso:  swift scripts/photos/process-photos.swift scripts/photos/metodo.json
//
// Para cada item do manifesto:
//   1. aplica a orientação EXIF nos pixels — foto em retrato fica em pé de
//      verdade, e não depende mais da tag que vamos descartar;
//   2. recorta, se o item pedir (frações da imagem já orientada);
//   3. converte para sRGB — iPhone grava em Display P3, e um arquivo sem
//      perfil seria lido como sRGB, com as cores lavadas;
//   4. grava AVIF nas larguras pedidas e um JPEG progressivo de reserva,
//      SEM nenhum metadado: nada de EXIF, modelo de câmera ou GPS.
//
// O passo 4 importa: os originais de celular carregam as coordenadas de
// onde a foto foi tirada, e isso não pode ir parar num site público.

import CoreGraphics
import Foundation
import ImageIO

struct Job: Decodable {
    let src: String
    let name: String
    let widths: [Int]
    let jpeg: Int
    /// Recorte em frações da imagem orientada: [x, y, largura, altura].
    let crop: [Double]?
}

struct Manifest: Decodable {
    let out: String
    let quality: Double
    let jpegQuality: Double
    let jobs: [Job]
}

func fail(_ message: String) -> Never {
    FileHandle.standardError.write(Data("erro: \(message)\n".utf8))
    exit(1)
}

/// Imagem inteira, já com a orientação aplicada nos pixels.
func loadOriented(_ path: String) -> CGImage {
    let url = URL(fileURLWithPath: path)
    guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
        let props = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any],
        let w = props[kCGImagePropertyPixelWidth] as? Int,
        let h = props[kCGImagePropertyPixelHeight] as? Int
    else { fail("não consegui ler \(path)") }
    // A API de miniatura é a que sabe aplicar a orientação; pedindo o maior
    // lado como tamanho máximo, ela devolve a imagem em resolução cheia.
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

/// Redimensiona desenhando num contexto sRGB: escala e converte a cor de uma vez.
///
/// A altura é sempre par. AVIF guarda a cor em blocos de 2×2 pixels (4:2:0),
/// e um AVIF de altura ímpar gravado pelo macOS abre PRETO no Chrome — sem
/// erro nenhum, a imagem só não aparece. Arredondar para par distorce a
/// proporção em menos de um pixel.
func render(_ image: CGImage, width: Int) -> CGImage {
    guard width % 2 == 0 else { fail("largura \(width) é ímpar — use larguras pares") }
    let exact = Double(image.height) * Double(width) / Double(image.width)
    let height = Int((exact / 2).rounded()) * 2
    guard let srgb = CGColorSpace(name: CGColorSpace.sRGB),
        let ctx = CGContext(
            data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 0,
            space: srgb, bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)
    else { fail("não consegui criar o contexto de \(width)px") }
    ctx.interpolationQuality = .high
    ctx.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
    guard let out = ctx.makeImage() else { fail("falha ao renderizar \(width)px") }
    return out
}

/// Grava só a imagem e a qualidade. Nenhuma propriedade da origem é copiada.
func write(_ image: CGImage, to path: String, type: String, properties: [CFString: Any]) {
    let url = URL(fileURLWithPath: path)
    guard let dest = CGImageDestinationCreateWithURL(url as CFURL, type as CFString, 1, nil)
    else { fail("o sistema não grava \(type)") }
    CGImageDestinationAddImage(dest, image, properties as CFDictionary)
    guard CGImageDestinationFinalize(dest) else { fail("falha ao gravar \(path)") }
}

guard CommandLine.arguments.count == 2 else {
    fail("uso: swift scripts/photos/process-photos.swift <manifesto.json>")
}
let manifestPath = CommandLine.arguments[1]
guard let data = FileManager.default.contents(atPath: manifestPath) else {
    fail("manifesto não encontrado: \(manifestPath)")
}
let manifest: Manifest
do { manifest = try JSONDecoder().decode(Manifest.self, from: data) } catch {
    fail("manifesto inválido: \(error)")
}
try? FileManager.default.createDirectory(
    atPath: manifest.out, withIntermediateDirectories: true)

for job in manifest.jobs {
    var image = loadOriented(job.src)
    if let c = job.crop {
        guard c.count == 4 else { fail("\(job.name): crop precisa de 4 números") }
        let W = Double(image.width), H = Double(image.height)
        let rect = CGRect(x: c[0] * W, y: c[1] * H, width: c[2] * W, height: c[3] * H).integral
        guard let cropped = image.cropping(to: rect) else { fail("\(job.name): recorte fora da imagem") }
        image = cropped
    }
    var written: [String] = []
    for width in job.widths {
        guard width <= image.width else {
            fail("\(job.name): \(width)px é maior que a origem (\(image.width)px) — não amplio foto")
        }
        let path = "\(manifest.out)/\(job.name)-\(width).avif"
        write(render(image, width: width), to: path, type: "public.avif",
              properties: [kCGImageDestinationLossyCompressionQuality: manifest.quality])
        written.append(path)
    }
    let jpegPath = "\(manifest.out)/\(job.name)-\(job.jpeg).jpg"
    write(render(image, width: job.jpeg), to: jpegPath, type: "public.jpeg",
          properties: [
              kCGImageDestinationLossyCompressionQuality: manifest.jpegQuality,
              kCGImagePropertyJFIFDictionary: [kCGImagePropertyJFIFIsProgressive: true],
          ])
    written.append(jpegPath)
    print("\(job.name): \(image.width)×\(image.height) → \(written.map { ($0 as NSString).lastPathComponent }.joined(separator: ", "))")
}
