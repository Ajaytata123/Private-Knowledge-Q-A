import { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';

const UploadSection = ({ onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['text/plain', 'text/markdown'];
        if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
            setMessage({ type: 'error', text: 'Only .txt and .md files are allowed' });
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'File size must be less than 5MB' });
            return;
        }

        setUploading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(`${API_URL}/api/upload`, formData);
            setMessage({ type: 'success', text: `Uploaded: ${file.name}` });
            onUploadSuccess();
            e.target.value = ''; // Reset input
        } catch (error) {
            setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="glass rounded-xl p-5 border border-white/30 shadow-md">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                Upload Documents
            </h3>

            <label className="block cursor-pointer group">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                        {uploading ? 'Uploading...' : 'Click to upload'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">.txt or .md files (max 5MB)</p>
                </div>
                <input
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                />
            </label>

            {message && (
                <div className={`mt-3 p-3 rounded-lg text-xs flex items-center gap-2 ${message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {message.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>{message.text}</span>
                </div>
            )}
        </div>
    );
};

export default UploadSection;
