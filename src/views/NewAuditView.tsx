import React, { useState } from 'react';
import { DatasetPackage } from '../types';
import { parseCsv } from '../utils/csvParser';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RefreshCw,
  FolderArchive,
  Download,
  AlertTriangle
} from 'lucide-react';

interface NewAuditViewProps {
  currentDataset: DatasetPackage;
  onUpdateDataset: (pkg: DatasetPackage) => void;
  onRunAudit: () => void;
  onLoadPreloadedIncident: () => void;
  onLoadPostRemediationBenchmark: () => void;
}

export const NewAuditView: React.FC<NewAuditViewProps> = ({
  currentDataset,
  onUpdateDataset,
  onRunAudit,
  onLoadPreloadedIncident,
  onLoadPostRemediationBenchmark
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFilesSummary, setUploadedFilesSummary] = useState<string[]>([]);
  const [activePackageName, setActivePackageName] = useState(currentDataset.metadata.packageName);

  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newFiles: Record<string, any[]> = { ...currentDataset.files };
    const schemaHealth = [...currentDataset.metadata.schemaHealth];
    const uploadedNames: string[] = [];
    let totalAddedRows = 0;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.name.endsWith('.csv')) continue;

      const text = await file.text();
      const parsed = parseCsv(text);

      newFiles[file.name] = parsed.rows;
      uploadedNames.push(file.name);
      totalAddedRows += parsed.rowCount;

      // Update schema health record
      const existingIdx = schemaHealth.findIndex(s => s.fileName === file.name);
      const healthEntry = {
        fileName: file.name,
        detectedColumns: parsed.headers,
        rowCount: parsed.rowCount,
        hasErrors: parsed.hasErrors,
        issues: parsed.errors
      };

      if (existingIdx >= 0) {
        schemaHealth[existingIdx] = healthEntry;
      } else {
        schemaHealth.push(healthEntry);
      }
    }

    const updatedPackage: DatasetPackage = {
      files: newFiles,
      metadata: {
        packageName: `Custom Upload Package (${uploadedNames.length} custom files)`,
        fileCount: Object.keys(newFiles).length,
        totalRows: Object.values(newFiles).reduce((acc, rows) => acc + rows.length, 0),
        uploadedAt: new Date().toISOString(),
        schemaHealth
      }
    };

    onUpdateDataset(updatedPackage);
    setUploadedFilesSummary(uploadedNames);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header Explainer */}
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Dataset Ingestion & Package Manager
        </h2>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
          The AI Deletion Audit Agent operates strictly on authoritative dataset packages. It detects columns, normalizes timestamps, verifies relationships between files, and checks for missing evidence before computing compliance decisions.
        </p>
      </div>

      {/* Package Switcher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Preset 1: $2.4M Incident Failure Package */}
        <div className="bg-white border border-rose-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Active Breach Scenario
              </span>
              <span className="text-[11px] text-slate-400 font-mono">19 Files · 88 Rows</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Northstar Shop $2.4M Incident Package
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Historical baseline evidence featuring the Sarah Jenkins deletion request. Contains active sync write-after-deletion, CRM profile leakage, unpurged S3 driver license scans, and uncompacted Kafka queues.
            </p>
          </div>
          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={onLoadPreloadedIncident}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
            >
              Load Incident Package
            </button>
            <span className="text-[11px] text-slate-500 font-medium">Authoritative Case Study</span>
          </div>
        </div>

        {/* Preset 2: Post-Remediation Benchmark Package */}
        <div className="bg-white border border-emerald-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Verified Compliant
              </span>
              <span className="text-[11px] text-slate-400 font-mono">19 Files · Fully Sanitized</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Post-Remediation Verification Package
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Demonstrates state after executing all 11 remediation steps: account tombstoned with nullified PII, CRM profile purged, S3 scan shredded, Kafka compacted, and tax records safely retained.
            </p>
          </div>
          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={onLoadPostRemediationBenchmark}
              className="px-3.5 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors"
            >
              Load Sanitized Package
            </button>
            <span className="text-[11px] text-emerald-700 font-medium">Demonstrates COMPLETE</span>
          </div>
        </div>
      </div>

      {/* Drag & Drop Multi-file CSV Uploader */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`bg-white border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? 'border-slate-800 bg-slate-50' : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Upload Audit Dataset Package (Multi-CSV)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Drag and drop your enterprise CSV files here, or browse your local directory.
            </p>
          </div>

          <label className="inline-block px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer transition-colors">
            <span>Browse CSV Files</span>
            <input
              type="file"
              multiple
              accept=".csv"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </label>

          <p className="text-[11px] text-slate-400">
            Supports: deletion_requests.csv, deletion_rules.csv, customer_accounts.csv, sync_jobs.csv, etc.
          </p>
        </div>
      </div>

      {/* Schema Health & Inventory Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Schema Health & Ingested File Inventory
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automatic column detection, row counts, and structural integrity checks.
            </p>
          </div>
          <button
            onClick={onRunAudit}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
          >
            Re-run Audit on Current Package
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-4">File Name</th>
                <th className="py-2.5 px-4 font-mono">Rows</th>
                <th className="py-2.5 px-4">Detected Columns</th>
                <th className="py-2.5 px-4">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {currentDataset.metadata.schemaHealth.map(s => (
                <tr key={s.fileName} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{s.fileName}</span>
                  </td>
                  <td className="py-3 px-4 tabular-nums text-slate-700">
                    {s.rowCount}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-sans text-xs">
                    <div className="flex flex-wrap gap-1">
                      {s.detectedColumns.slice(0, 4).map(col => (
                        <span key={col} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono">
                          {col}
                        </span>
                      ))}
                      {s.detectedColumns.length > 4 && (
                        <span className="text-[10px] text-slate-400 font-sans">
                          +{s.detectedColumns.length - 4} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-sans text-xs">
                    {s.hasErrors ? (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Schema Malformed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified Schema</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
