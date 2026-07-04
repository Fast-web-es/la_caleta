#!/usr/bin/env python3
"""
Convierte un PNG/JPG con fondo blanco a PNG con fondo transparente.
Mantiene el anti-aliasing de los bordes (no quedan dentados).

Uso:
    python3 scripts/remove-white-bg.py <archivo_entrada> [archivo_salida]

Si no pasas archivo_salida, sobrescribe el de entrada como .png.

Ejemplo:
    python3 scripts/remove-white-bg.py public/img/cat-beers-raw.jpg public/img/cat-beers.png
"""
import sys
from pathlib import Path
from PIL import Image


def remove_white_background(input_path: Path, output_path: Path, threshold: int = 240) -> None:
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    w, h = img.size

    # Para cada pixel: si es casi-blanco, hacerlo transparente.
    # Usa luminancia para definir "qué tan blanco" es y modula el alpha
    # proporcionalmente, así los bordes anti-aliased quedan suaves.
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            # Distancia a blanco puro (0 = blanco, 255 = negro/saturado)
            min_channel = min(r, g, b)
            if min_channel >= threshold:
                # Casi blanco — totalmente transparente
                pixels[x, y] = (r, g, b, 0)
            elif min_channel >= threshold - 30:
                # Borde anti-aliased — alpha proporcional
                ratio = (threshold - min_channel) / 30.0
                pixels[x, y] = (r, g, b, int(255 * ratio))
            # else: pixel "de color" — se deja intacto

    img.save(output_path, "PNG", optimize=True)
    print(f"OK: {input_path} -> {output_path} ({output_path.stat().st_size // 1024} KB)")


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    input_path = Path(sys.argv[1])
    if not input_path.exists():
        print(f"ERROR: no existe {input_path}")
        return 1
    output_path = Path(sys.argv[2]) if len(sys.argv) >= 3 else input_path.with_suffix(".png")
    remove_white_background(input_path, output_path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
