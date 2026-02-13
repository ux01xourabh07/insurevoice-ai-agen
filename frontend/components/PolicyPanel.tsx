import React, { useState, useRef } from 'react';
import { FileText, Save, Edit2, Upload, Loader2, AlertCircle } from 'lucide-react';
import { parseFile } from '../utils/file-utils';

interface PolicyPanelProps {
  policyText: string;
  onUpdatePolicy: (text: string) => void;
  disabled: boolean;
}

export const PolicyPanel: React.FC<PolicyPanelProps> = ({ policyText, onUpdatePolicy, disabled }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(policyText);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdatePolicy(localText);
    setIsEditing(false);
    setError(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const text = await parseFile(file);
      setLocalText(text);
      if (!isEditing) {
        onUpdatePolicy(text);
      }
    } catch (err: any) {
      console.error("File parsing error:", err);
      setError("Failed to parse file. Please upload a valid PDF, MD, or TXT file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
        <div className="flex items-center gap-2 text-blue-400">
          <FileText className="w-5 h-5" />
          <h2 className="font-semibold text-lg">Policy Knowledge Base</h2>
        </div>
        <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".pdf,.txt,.md" 
              className="hidden" 
              disabled={disabled || isUploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                 disabled || isUploading
                 ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                 : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
              title="Upload PDF, TXT, or MD"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload
            </button>

            {!disabled && (
            <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isEditing 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
            >
                {isEditing ? (
                <>
                    <Save className="w-4 h-4" /> Save
                </>
                ) : (
                <>
                    <Edit2 className="w-4 h-4" /> Edit
                </>
                )}
            </button>
            )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 p-2 text-red-400 text-xs flex items-center gap-2 px-4">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}

      <div className="flex-1 relative">
        {isEditing ? (
          <textarea
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            className="w-full h-full p-4 bg-slate-800 text-slate-300 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 scrollbar-thin"
            placeholder="Paste insurance policy text here or upload a file..."
          />
        ) : (
          <div className="w-full h-full p-4 overflow-y-auto scrollbar-thin">
            <pre className="whitespace-pre-wrap font-mono text-sm text-slate-300 leading-relaxed">
              {localText !== policyText ? localText : policyText}
            </pre>
          </div>
        )}
        
        {disabled && (
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
             <span className="bg-slate-800 text-slate-400 px-4 py-2 rounded-md shadow-lg border border-slate-700 text-sm">
               Read-only during active call
             </span>
           </div>
        )}
      </div>
    </div>
  );
};
