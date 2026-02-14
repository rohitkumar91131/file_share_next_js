"use client";
import { useSendFileData } from '@/context/SendFileDataContext';
import { File } from 'lucide-react';

export default function SenderFileList() {
    const { files } = useSendFileData();

    if (files.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 text-sm">
                No files sent yet
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Sent Files</h3>
            {files.map((file, i) => (
                <div key={i} className="border rounded-lg p-3 bg-white">
                    <div className="flex items-center gap-3">
                        <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{file.size}</p>
                        </div>
                        <div className="text-right">
                            <span className={`text-xs font-medium ${file.progress === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                                {file.progress}%
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all ${file.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${file.progress}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
