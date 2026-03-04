// Data Export Service for downloading sensor data
export type ExportFormat = 'csv' | 'json' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  dateRange?: { start: Date; end: Date };
  sensors?: string[];
  includeAnalytics?: boolean;
}

class DataExportService {
  exportData(data: any[], options: ExportOptions): void {
    switch (options.format) {
      case 'csv':
        this.exportAsCSV(data);
        break;
      case 'json':
        this.exportAsJSON(data);
        break;
      case 'pdf':
        this.exportAsPDF(data);
        break;
    }
  }

  private exportAsCSV(data: any[]): void {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    this.downloadFile(csvContent, 'sensor-data.csv', 'text/csv');
  }

  private exportAsJSON(data: any[]): void {
    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, 'sensor-data.json', 'application/json');
  }

  private exportAsPDF(data: any[]): void {
    // Simplified PDF export - in production, use a library like jsPDF
    const textContent = JSON.stringify(data, null, 2);
    this.downloadFile(textContent, 'sensor-data.txt', 'text/plain');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async shareData(data: any[], title: string): Promise<void> {
    if (navigator.share) {
      try {
        const jsonContent = JSON.stringify(data, null, 2);
        const file = new File([jsonContent], 'sensor-data.json', { type: 'application/json' });
        
        await navigator.share({
          title: title,
          text: 'Ecological sensor data from Internet of Nature',
          files: [file]
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  }
}

export const dataExportService = new DataExportService();
