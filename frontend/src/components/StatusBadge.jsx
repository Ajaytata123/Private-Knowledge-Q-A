import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../config';

const StatusBadge = () => {
    const [status, setStatus] = useState('unknown');
    const [loading, setLoading] = useState(true);

    const checkHealth = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/health`);
            if (data.status === 'healthy') {
                setStatus('online');
            } else {
                setStatus('issues');
            }
        } catch (error) {
            setStatus('offline');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const getStatusInfo = () => {
        switch (status) {
            case 'online':
                return {
                    color: 'bg-green-50 text-green-700 border-green-200',
                    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                    label: 'Operational',
                    dot: 'bg-green-500'
                };
            case 'issues':
                return {
                    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                    icon: <AlertCircle className="w-3.5 h-3.5" />,
                    label: 'Issues',
                    dot: 'bg-yellow-500'
                };
            case 'offline':
                return {
                    color: 'bg-red-50 text-red-700 border-red-200',
                    icon: <AlertCircle className="w-3.5 h-3.5" />,
                    label: 'Offline',
                    dot: 'bg-red-500'
                };
            default:
                return {
                    color: 'bg-gray-50 text-gray-500 border-gray-200',
                    icon: <Activity className="w-3.5 h-3.5" />,
                    label: 'Checking...',
                    dot: 'bg-gray-400'
                };
        }
    };

    const { color, icon, label, dot } = getStatusInfo();

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${color} shadow-sm`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot} ${status === 'online' ? 'animate-pulse' : ''}`}></span>
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </div>
    );
};

export default StatusBadge;
