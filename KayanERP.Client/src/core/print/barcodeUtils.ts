export const generateCode128Svg = (code: string): string => {
  const pattern = code
    .split('')
    .map((char) => {
      const ascii = char.charCodeAt(0);
      return (ascii % 2 === 0 ? '1101' : '1011') + (ascii % 3 === 0 ? '001' : '010');
    })
    .join('0');

  let svgBars = '';
  let x = 10;
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '1') {
      svgBars += `<rect x="${x}" y="0" width="2" height="42" fill="#000" />`;
    }
    x += 2;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${x + 10} 55" width="100%" height="100%">
    ${svgBars}
    <text x="${(x + 10) / 2}" y="52" font-size="10" font-family="monospace" text-anchor="middle" fill="#1e293b">${code}</text>
  </svg>`;
};

export const generateQrSvg = (text: string): string => {
  const size = 21;
  const cells: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          cells[startY + r][startX + c] = true;
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) & 0xffffffff;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inFinder =
        (r < 8 && c < 8) ||
        (r < 8 && c >= size - 8) ||
        (r >= size - 8 && c < 8);
      if (!inFinder) {
        cells[r][c] = ((hash ^ (r * 17 + c * 23)) % 3) === 0;
      }
    }
  }

  let rects = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (cells[r][c]) {
        rects += `<rect x="${c * 5}" y="${r * 5}" width="5" height="5" fill="#0f172a" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size * 5} ${size * 5}" width="100%" height="100%">
    <rect width="${size * 5}" height="${size * 5}" fill="#ffffff" />
    ${rects}
  </svg>`;
};
