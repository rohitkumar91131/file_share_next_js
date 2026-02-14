"use client";
import { useReceiveFileData } from '@/context/ReceiveFileDataContext';
import { File, Download } from 'lucide-react';

export default function ReceiverFileList() {
    const { files } = useReceiveFileData();

    if (files.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 text-sm">
                Waiting for files...
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Receiving Files</h3>
            {files.map((file, i) => (
                <div key={i} className="border dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <File className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                <span>{file.size}</span>
                                {file.status === 'pending' && (
                                    <span className="text-amber-500 font-medium px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded">Waiting...</span>
                                )}
                                {file.status === 'receiving' && <span className="text-blue-500">Receiving...</span>}
                                {file.status === 'completed' && <span className="text-green-500">Completed</span>}
                            </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                            {file.progress === 100 && <Download className="w-4 h-4 text-green-600 dark:text-green-400" />}
                            <span className={`text-xs font-medium ${file.status === 'completed' || file.progress === 100 ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                                }`}>
                                {file.status === 'pending' ? '' : `${file.progress}%`}
                            </span>
                        </div>
                    </div>
                    {file.status !== 'pending' && (
                        <div className="mt-2 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${file.status === 'completed' || file.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                                    }`}
                                style={{ width: `${file.progress}%` }}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
