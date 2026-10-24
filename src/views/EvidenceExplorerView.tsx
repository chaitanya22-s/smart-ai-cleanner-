import React, { useState } from 'react';
import { DatasetPackage } from '../types';
import { exportToCsv } from '../utils/csvParser';
import {
  Database,
  Search,
  Download,
  FileSpreadsheet,
  Layers,
  Info,
  X
} from 'lucide-react';

interface EvidenceExplorerViewProps {
  dataset: DatasetPackage;
}

export const EvidenceExplorerView: React.FC<EvidenceExplorerViewProps> = ({ dataset }) => {
  const fileNames = Object.keys(dataset.files);
  const [selectedFileName, setSelectedFileName] = useState<string>(fileNames[0] || 'customer_accounts.csv');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(null);

  const activeRows = dataset.files[selectedFileName] || [];
  const headers = activeRows.length > 0 ? Object.keys(activeRows[0]) : [];

  const filteredRows = activeRows.filter(row => {
    if (!searchQuery) return true;
    return Object.values(row).some(val =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleDownloadCsv = () => {
    const csvStr = exportToCsv(activeRows);
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Raw Evidence Explorer
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect raw underlying database tables, CDC stream payloads, search documents, and cold snapshot records.
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Download {selectedFileName}</span>
        </button>
      </div>

      {/* File Selector & Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Active Table:</span>
            <select
              value={selectedFileName}
              onChange={(e) => {
                setSelectedFileName(e.target.value);
                setSearchQuery('');
                setSelectedRow(null);
              }}
              className="w-full sm:w-auto text-xs font-bold font-mono text-slate-900 bg-slate-50 border border-slate-200 rounded px-3 py-2 focus:outline-none cursor-pointer"
            >
              {fileNames.map(f => (
                <option key={f} value={f}>
                  {f} ({dataset.files[f]?.length || 0} rows)
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${selectedFileName}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Raw Data Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 font-mono">
            {selectedFileName}
          </span>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            Showing {filteredRows.length} of {activeRows.length} rows
          </span>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0 z-10">
              <tr>
                <th className="py-2 px-3 font-mono text-[11px] text-slate-400">#</th>
                {headers.map(h => (
                  <th key={h} className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                    {h}
                  </th>
                ))}
                <th className="py-2.5 px-3">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={headers.length + 2} className="py-8 text-center text-slate-400 font-sans text-xs">
                    No rows match current search query in this file.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 px-3 text-slate-400 select-none">{idx + 1}</td>
                    {headers.map(h => (
                      <td key={h} className="py-2.5 px-3 truncate max-w-xs text-slate-800" title={String(row[h] || '')}>
                        {row[h] !== null && row[h] !== undefined && row[h] !== '' ? String(row[h]) : <span className="text-slate-300 italic font-sans">null</span>}
                      </td>
                    ))}
                    <td className="py-2.5 px-3 font-sans">
                      <button
                        onClick={() => setSelectedRow(row)}
                        className="text-slate-800 hover:text-slate-950 font-semibold hover:underline"
                      >
                        JSON
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Record Inspector Modal */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Raw Record Evidence
                </span>
                <h3 className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                  {selectedFileName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRow(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-900 rounded-lg text-emerald-400 font-mono text-xs max-h-96 overflow-y-auto whitespace-pre-wrap">
              {JSON.stringify(selectedRow, null, 2)}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRow(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
