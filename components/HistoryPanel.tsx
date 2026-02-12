import React from 'react';
import { Clock, MessageSquare, Trash2, X } from 'lucide-react';
import { StoredSession } from '../types';

interface HistoryPanelProps {
  sessions: StoredSession[];
  onClose: () => void;
  onClearHistory: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ sessions, onClose, onClearHistory }) => {
  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-2 text-slate-200">
          <Clock className="w-5 h-5" />
          <h2 className="font-semibold text-lg">Conversation History</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {sessions.length === 0 ? (
          <div className="text-center text-slate-500 py-10">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No past conversations found.</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="bg-slate-800 rounded-lg border border-slate-700 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{new Date(session.timestamp).toLocaleString()}</span>
                <span className="bg-slate-700 px-2 py-0.5 rounded-full text-[10px] uppercase">
                  {session.logs.length} events
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto text-sm space-y-2 pr-2 scrollbar-thin bg-slate-900/30 p-2 rounded">
                {session.logs.filter(l => l.role !== 'system').slice(0, 5).map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className={`font-bold text-[10px] uppercase w-10 shrink-0 ${
                      log.role === 'agent' ? 'text-blue-400' : 'text-green-400'
                    }`}>
                      {log.role}
                    </span>
                    <span className="text-slate-300 truncate">{log.message}</span>
                  </div>
                ))}
                 {session.logs.filter(l => l.role !== 'system').length > 5 && (
                  <div className="text-center text-[10px] text-slate-500 italic pt-1">
                    ... and {session.logs.filter(l => l.role !== 'system').length - 5} more
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {sessions.length > 0 && (
        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
          <button
            onClick={onClearHistory}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-900/30"
          >
            <Trash2 className="w-4 h-4" /> Clear All History
          </button>
        </div>
      )}
    </div>
  );
};
