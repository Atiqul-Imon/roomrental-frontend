import html2canvas from 'html2canvas';

/**
 * Export chart as PNG image
 */
export async function exportChartAsPNG(
  chartElement: HTMLElement,
  filename: string
) {
  try {
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#0F172A', // dark background
      scale: 2, // Higher quality
    });

    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.png`;
      link.click();
      URL.revokeObjectURL(url);
    });
  } catch (error) {
    console.error('Failed to export chart:', error);
    alert('Failed to export chart. Please try again.');
  }
}

/**
 * Export chart as SVG (if using SVG-based charts)
 */
export function exportChartAsSVG(
  svgElement: SVGElement,
  filename: string
) {
  try {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export chart:', error);
    alert('Failed to export chart. Please try again.');
  }
}

