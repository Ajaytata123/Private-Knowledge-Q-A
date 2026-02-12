import { useState } from 'react';
import axios from 'axios';
import { Send, FileText, ChevronDown, ChevronRight, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { API_URL } from '../config';

const ChatInterface = () => {
    const [question, setQuestion] = useState('');
    const [lastQuestion, setLastQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [answer, setAnswer] = useState(null); // { text, sources }
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        const currentQ = question;
        setLastQuestion(currentQ);
        setQuestion('');
        setLoading(true);
        setError(null);
        setAnswer(null);

        try {
            const { data } = await axios.post(`${API_URL}/api/ask`, { question: currentQ });
            setAnswer(data);
        } catch (err) {
            setError('Failed to get an answer. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Simple markdown renderer for structured AI output
    const formatAnswer = (text) => {
        if (!text) return null;

        return text.split('\n').map((line, idx) => {
            // Headers
            if (line.startsWith('## ')) {
                return <h3 key={idx} className="text-lg font-bold text-gray-800 mt-4 mb-2 flex items-center gap-2">{line.replace('## ', '')}</h3>;
            }
            // Bold text
            if (line.includes('**')) {
                const parts = line.split('**');
                return (
                    <p key={idx} className="mb-2 text-gray-700">
                        {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part)}
                    </p>
                );
            }
            // Bullet points
            if (line.startsWith('•')) {
                return <li key={idx} className="ml-4 text-gray-700 mb-1">{line.replace('• ', '')}</li>;
            }
            // Horizontal rule
            if (line.trim() === '---') {
                return <hr key={idx} className="my-4 border-gray-200" />;
            }
            // Empty line
            if (line.trim() === '') {
                return <br key={idx} />;
            }
            // Regular text
            return <p key={idx} className="mb-2 text-gray-700 leading-relaxed">{line}</p>;
        });
    };

    return (
        <div className="flex flex-col h-full glass rounded-xl border border-white/20 overflow-hidden shadow-lg">
            {/* Header */}
            <div className="px-5 py-3 border-b border-gray-100/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold text-gray-800">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    Ask Questions
                </h2>
                <div className="text-xs text-gray-500 font-medium">
                    AI-Powered Search
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-[400px] custom-scrollbar">
                {!answer && !loading && !error && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                        <MessageSquare className="w-14 h-14 mb-3 stroke-1" />
                        <p className="text-base font-medium">Ask something about your documents</p>
                        <p className="text-sm">Upload files first for better results</p>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-12 text-blue-600">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <span className="text-sm font-medium">Analyzing documents...</span>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        {error}
                    </div>
                )}

                {answer && (
                    <div className="space-y-4 fade-in">
                        {/* Question Bubble */}
                        <div className="flex justify-end">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-md">
                                <p className="text-xs font-medium opacity-80 uppercase tracking-wide mb-1">You asked</p>
                                <p className="text-base">{lastQuestion}</p>
                            </div>
                        </div>

                        {/* Answer Bubble */}
                        <div className="flex justify-start">
                            <div className="glass border border-white/30 px-6 py-5 rounded-2xl rounded-tl-sm w-full shadow-md">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <p className="font-medium text-xs text-gray-500 uppercase tracking-wide">
                                        AI Answer
                                    </p>
                                </div>

                                <div className="text-sm">
                                    {formatAnswer(answer.answer)}
                                </div>

                                {/* Sources */}
                                {answer.sources && answer.sources.length > 0 && (
                                    <div className="mt-5 pt-4 border-t border-gray-200">
                                        <h4 className="text-xs font-semibold text-gray-600 flex items-center gap-2 mb-3">
                                            <FileText className="w-3.5 h-3.5" />
                                            Sources ({answer.sources.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {answer.sources.map((source, idx) => (
                                                <SourceCitation key={idx} source={source} index={idx} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/50 border-t border-gray-100/50">
                <form onSubmit={handleSubmit} className="relative">
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask a question about your documents..."
                        className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none outline-none text-gray-700 text-sm min-h-[56px] max-h-[120px] bg-white"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={!question.trim() || loading}
                        className="absolute right-2 bottom-2 p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </form>
                <div className="flex justify-between items-center mt-2 px-1">
                    <p className="text-[10px] text-gray-400">Press Enter to send • Shift+Enter for new line</p>
                    <p className="text-[10px] text-gray-400 font-mono">{question.length} chars</p>
                </div>
            </div>
        </div>
    );
};

// Reusable component for document source citations
const SourceCitation = ({ source, index }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-gray-50/80 rounded-lg border border-gray-200/50 overflow-hidden text-sm hover:border-blue-200 transition-colors">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-100/50 transition-colors text-left"
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className="w-6 h-6 min-w-[24px] rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                    </span>
                    <span className="truncate font-medium text-gray-800">{source.documentName}</span>
                    <span className="text-xs text-gray-500 hidden sm:inline-block ml-1">
                        {(source.score * 100).toFixed(0)}% match
                    </span>
                </div>
                {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </button>

            {expanded && (
                <div className="px-3 py-3 border-t border-gray-200/50 bg-white/50">
                    <div className="pl-3 border-l-2 border-blue-300 text-gray-600 text-xs leading-relaxed">
                        "{source.snippet}"
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatInterface;
