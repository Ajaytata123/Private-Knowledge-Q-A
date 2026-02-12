import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Trash2, Calendar, HardDrive, Folder } from 'lucide-react';
import { API_URL, SESSION_ID } from '../config';

const DocumentList = ({ refreshTrigger }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDocuments = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/documents`, {
                headers: { 'x-session-id': SESSION_ID }
            });
            setDocuments(data);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
        // Add auto-sync: check for changes every 30 seconds
        const interval = setInterval(fetchDocuments, 30000);
        return () => clearInterval(interval);
    }, [refreshTrigger]);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            await axios.delete(`${API_URL}/api/documents/${id}`, {
                headers: { 'x-session-id': SESSION_ID }
            });
            setDocuments(docs => docs.filter(d => d.id !== id));
        } catch (error) {
            console.error('Failed to delete document:', error);
            alert('Failed to delete document');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="glass rounded-xl p-5 border border-white/30 shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Folder className="w-4 h-4 text-blue-600" aria-hidden="true" />
                    Your Documents
                </h3>
                <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                    {documents.length} {documents.length === 1 ? 'file' : 'files'}
                </span>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-600 text-sm">
                    Loading documents...
                </div>
            ) : documents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" aria-hidden="true" />
                    <p className="text-sm font-medium">No documents uploaded yet</p>
                    <p className="text-xs mt-1">Upload files to get started</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="group bg-white/60 hover:bg-white border border-gray-200/50 hover:border-blue-200 rounded-lg p-3 transition-all duration-200 hover:shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                    <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">
                                            {doc.name}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <HardDrive className="w-3 h-3" aria-hidden="true" />
                                                {formatFileSize(doc.size)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" aria-hidden="true" />
                                                {formatDate(doc.uploadDate)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(doc.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-red-600 rounded transition-all"
                                    aria-label={`Delete ${doc.name}`}
                                    title={`Delete ${doc.name}`}
                                >
                                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DocumentList;
