/** Convert a rendered Recharts / SVG element to a PNG data URL for reliable print/PDF export. */
export async function svgElementToPngDataUrl(
  svg: SVGElement,
  width: number,
  height: number,
): Promise<string> {
  const cloned = svg.cloneNode(true) as SVGElement;
  cloned.setAttribute("width", String(width));
  cloned.setAttribute("height", String(height));
  if (!cloned.getAttribute("viewBox")) {
    cloned.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }

  const svgString = new XMLSerializer().serializeToString(cloned);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.scale(2, 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load chart SVG"));
    };
    img.src = url;
  });
}
