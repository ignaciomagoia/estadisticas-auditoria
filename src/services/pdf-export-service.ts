import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ExportDashboardPdfOptions {
  rootElement: HTMLElement;
  periodLabel: string;
  viewLabel: string;
  filtersSummary: string[];
  fileName: string;
}

const waitForPaint = async () => {
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => requestAnimationFrame(resolve));
};

const hasUnsupportedCanvasColor = (value: string) => /oklch|lab\(|lch\(|color\(/i.test(value);

const sanitizeCloneColors = (clonedRoot: HTMLElement) => {
  const elements = [clonedRoot, ...Array.from(clonedRoot.querySelectorAll<HTMLElement>('*'))];

  elements.forEach((element) => {
    const styles = getComputedStyle(element);

    if (hasUnsupportedCanvasColor(styles.color)) element.style.color = '#0f172a';
    if (hasUnsupportedCanvasColor(styles.backgroundColor)) {
      element.style.backgroundColor = styles.backgroundColor === 'rgba(0, 0, 0, 0)' ? 'transparent' : '#ffffff';
    }
    if (hasUnsupportedCanvasColor(styles.borderTopColor)) element.style.borderColor = '#e2e8f0';
    if (hasUnsupportedCanvasColor(styles.outlineColor)) element.style.outlineColor = '#e2e8f0';
    if (hasUnsupportedCanvasColor(styles.boxShadow)) element.style.boxShadow = 'none';
  });
};

const addPageHeader = (pdf: jsPDF, options: ExportDashboardPdfOptions, pageWidth: number, margin: number) => {
  const generatedAt = new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, 28, 'F');
  pdf.setTextColor(15, 23, 42);
  pdf.setFontSize(14);
  pdf.text('Dashboard de Auditorias', margin, 12);
  pdf.setFontSize(9);
  pdf.text(`Periodo: ${options.periodLabel}`, margin, 18);
  pdf.text(`Vista: ${options.viewLabel}`, margin + 54, 18);
  pdf.text(`Generado: ${generatedAt}`, margin + 100, 18);
  pdf.text(`Filtros: ${options.filtersSummary.length ? options.filtersSummary.join(' | ') : 'Sin filtros aplicados'}`, margin, 24, {
    maxWidth: pageWidth - margin * 2,
  });
};

const addCanvasToPdf = (pdf: jsPDF, canvas: HTMLCanvasElement, pageWidth: number, pageHeight: number, margin: number, yPosition: number) => {
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;
  const imageWidth = usableWidth;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;
  let nextYPosition = yPosition;

  if (imageHeight <= usableHeight && nextYPosition + imageHeight > pageHeight - margin) {
    pdf.addPage();
    nextYPosition = margin + 20;
  }

  const imageData = canvas.toDataURL('image/png');

  if (imageHeight <= usableHeight) {
    pdf.addImage(imageData, 'PNG', margin, nextYPosition, imageWidth, imageHeight);
    return nextYPosition + imageHeight + 6;
  }

  let remainingHeight = imageHeight;
  let sourceY = 0;
  let firstSlice = true;
  const sliceCanvas = document.createElement('canvas');
  const sliceContext = sliceCanvas.getContext('2d');
  const pageSliceHeightPx = Math.floor((canvas.width / imageWidth) * usableHeight);
  sliceCanvas.width = canvas.width;
  sliceCanvas.height = pageSliceHeightPx;

  while (remainingHeight > 0 && sliceContext) {
    if (!firstSlice) pdf.addPage();
    sliceContext.clearRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    sliceContext.drawImage(canvas, 0, sourceY, canvas.width, pageSliceHeightPx, 0, 0, sliceCanvas.width, sliceCanvas.height);
    const sliceHeight = Math.min(usableHeight, remainingHeight);
    pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, margin, imageWidth, sliceHeight);
    sourceY += pageSliceHeightPx;
    remainingHeight -= usableHeight;
    firstSlice = false;
  }

  return margin + 20;
};

export const exportDashboardToPdf = async (options: ExportDashboardPdfOptions) => {
  document.body.classList.add('pdf-export-mode');
  await waitForPaint();

  try {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    let yPosition = 32;

    addPageHeader(pdf, options, pageWidth, margin);

    const sections = Array.from(options.rootElement.children).filter((element): element is HTMLElement => {
      const htmlElement = element as HTMLElement;
      return !htmlElement.classList.contains('pdf-hide') && htmlElement.offsetParent !== null;
    });

    for (const section of sections) {
      const canvas = await html2canvas(section, {
        backgroundColor: '#ffffff',
        scale: Math.min(2, window.devicePixelRatio || 2),
        useCORS: true,
        logging: false,
        onclone: (_document, clonedElement) => {
          sanitizeCloneColors(clonedElement as HTMLElement);
        },
      });
      yPosition = addCanvasToPdf(pdf, canvas, pageWidth, pageHeight, margin, yPosition);
    }

    pdf.save(options.fileName);
  } finally {
    document.body.classList.remove('pdf-export-mode');
  }
};
