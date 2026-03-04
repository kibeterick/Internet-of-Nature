import React, { useState } from 'react';
import { Download, Share2, FileText, FileJson, FileSpreadsheet } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { dataExportService, ExportFormat } from '../services/dataExportService';

interface DataExportPanelProps {
  data: any[];
  title?: string;
}

export const DataExportPanel: React.FC<DataExportPanelProps> = ({ data, title = 'Sensor Data' }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const formats: { value: ExportFormat; label: string; icon: React.ElementType }[] = [
    { value: 'csv', label: 'CSV', icon: FileSpreadsheet },
    { value: 'json', label: 'JSON', icon: FileJson },
    { value: 'pdf', label: 'PDF', icon: FileText },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      dataExportService.exportData(data, { format: selectedFormat });
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  const handleShare = async () => {
    await dataExportService.shareData(data, title);
  };

  return (
    <div className="glass p-6 rounded-3xl space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Download size={20} className="text-nature-600" />
          Export Data
        </h3>
      </div>

      <div className="flex gap-2">
        {formats.map(format => (
          <button
            key={format.value}
            onClick={() => setSelectedFormat(format.value)}
            className={cn(
              "flex-1 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
              selectedFormat === format.value
                ? "border-nature-600 bg-nature-50"
                : "border-nature-200 hover:border-nature-300"
            )}
          >
            <format.icon size={24} className={selectedFormat === format.value ? "text-nature-600" : "text-nature-400"} />
            <span className="text-xs font-bold">{format.label}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleExport}
          disabled={isExporting || data.length === 0}
          className="flex-1 bg-nature-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-nature-800 transition-colors"
        >
          <Download size={16} />
          {isExporting ? 'Exporting...' : 'Export'}
        </motion.button>
        
        {navigator.share && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            disabled={data.length === 0}
            className="px-4 py-3 bg-nature-100 text-nature-900 rounded-xl font-bold hover:bg-nature-200 transition-colors disabled:opacity-50"
          >
            <Share2 size={16} />
          </motion.button>
        )}
      </div>

      <p className="text-xs text-nature-500 text-center">
        {data.length} records ready for export
      </p>
    </div>
  );
};
