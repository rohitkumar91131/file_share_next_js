"use client";

import { useReceiveFileData } from "@/context/ReceiveFileDataContext";
import { Download, File } from "lucide-react";

export default function FilesList() {
  const { files } = useReceiveFileData();
  const items = files || [];

  // Show empty state message if no files yet
  if (items.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 px-4">
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <p className="text-sm">Waiting for files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Receiving Files
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Files being received via peer-to-peer connection
        </p>
      </div>

      {/* Files Grid */}
      <div className="space-y-3">
        {items.map((file, i) => (
          <div
            key={i}
            id={`file-${file.name}`}
            className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 scroll-mt-24"
          >
            <div className="flex items-start gap-4">
              {/* File Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <File className="w-6 h-6 text-white" />
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white truncate mb-1">
                  {file.name}
                </h3>
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-medium">
                    {file.type}
                  </span>
                  <span>{file.size}</span>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-600 dark:text-slate-400">
                      {file.progress === 100 ? "Download Complete" : "Receiving..."}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {file.progress}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${file.progress === 100
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                        : "bg-gradient-to-r from-blue-500 to-purple-500"
                        }`}
                      style={{ width: `${file.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              {file.progress === 100 && (
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                    <Download className="w-4 h-4" />
                    <span className="text-xs font-semibold">Downloaded</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
