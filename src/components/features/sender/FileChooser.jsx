"use client";
import { useState } from 'react';
import { Upload } from 'lucide-react';
import { useFileTransfer } from '@/hooks/useFileTransfer';
import { formatFileSize } from '@/utils/fileUtils';

export default function FileChooser({ onFileSelect }) {
    const { isConnected } = useFileTransfer();
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            onFileSelect?.(file);
        }
    };

    return (
        <div className="space-y-4">
            <label
                className={`
          block w-full p-8 border-2 border-dashed rounded-lg text-center cursor-pointer
          transition-all
          ${isConnected
                        ? 'border-blue-300 hover:border-blue-400 hover:bg-blue-50'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    }
        `}
            >
                <input
                    type="file"
                    onChange={handleFileChange}
                    disabled={!isConnected}
                    className="hidden"
                />
                <Upload className={`w-8 h-8 mx-auto mb-2 ${isConnected ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className="text-sm font-medium text-gray-700">
                    {isConnected ? 'Choose file to send' : 'Waiting for connection...'}
                </p>
                {selectedFile && (
                    <p className="text-xs text-gray-500 mt-2">
                        Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                )}
            </label>
        </div>
    );
}
