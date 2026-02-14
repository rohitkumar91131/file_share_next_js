"use client";

import { useSendFileData } from "@/context/SendFileDataContext";
import { X, File as FileIcon } from "lucide-react";
import { useEffect } from "react";

export default function SelectedFiles() {
  const { selectedFiles, removeFile, isActive } = useSendFileData();

  useEffect(() => {
    console.log("Selected Files:", selectedFiles);
  }, [selectedFiles]);

  useEffect(() => {
    console.log("isActive changed:", isActive);
  }, [isActive]);

  const formatSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileType = (fileName) => {
    return fileName.split(".").pop().toUpperCase() || "FILE";
  };

  if (!selectedFiles || selectedFiles.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 space-y-3 px-4 md:px-0">
      <div className="hidden md:grid md:[grid-template-columns:2fr_1fr_1fr_1fr_0.5fr] text-sm font-medium text-gray-500 px-4">
        <span>Name</span>
        <span>Type</span>
        <span>Size</span>
        <span>Progress</span>
        <span className="text-right">Action</span>
      </div>

      {selectedFiles.map((item) => (
        <div
          key={item.id}
          className="relative border rounded-xl p-4 flex flex-col gap-4 md:[grid-template-columns:2fr_1fr_1fr_1fr_0.5fr] md:grid md:items-center bg-white shadow-sm"
        >
          <button
            onClick={() => removeFile(item.id)}
            className="md:hidden absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 rounded-full"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3 pr-6 md:pr-0 overflow-hidden">
            <FileIcon className="w-5 h-5 text-emerald-500 flex-shrink-0 md:hidden" />
            <div className="flex flex-col min-w-0">
              <p className="font-medium text-sm md:text-base truncate text-slate-700">
                {item.file.name}
              </p>
              <span className="md:hidden text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded w-fit mt-1">
                {getFileType(item.file.name)}
              </span>
            </div>
          </div>

          <div className="hidden md:block">
            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold text-gray-600 border border-gray-200">
              {getFileType(item.file.name)}
            </span>
          </div>

          <div className="flex justify-between items-center md:block">
            <span className="md:hidden text-xs text-gray-400">Size</span>
            <span className="text-sm text-gray-600 font-mono">
              {formatSize(item.file.size)}
            </span>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between md:block">
              <span className="md:hidden text-xs text-gray-400">Status</span>
              <span className="hidden md:block text-xs text-gray-500 mb-1">
                {item.progress}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${item.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="hidden md:flex justify-end">
            <button
              onClick={() => removeFile(item.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
