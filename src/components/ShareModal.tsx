import React, { useState, useRef } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  Sparkles
} from 'lucide-react';
import { MemoryItem, PromptWave, TagInfo } from '../types';
import { soundManager } from '../utils/audioHelper';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryItem[];
  prompts: PromptWave[];
  tags: TagInfo[];
  onImportData: (data: { memories: MemoryItem[]; prompts: PromptWave[]; tags: TagInfo[] }) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  memories,
  prompts,
  tags,
  onImportData,
}) => {
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopyLink = () => {
    soundManager.playMemoryChime(1.3);
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportJSON = () => {
    soundManager.playMemoryChime(1.4);
    const exportPayload = {
      version: 1,
      appName: 'Das ist Leo, the Civil Monkey',
      exportedAt: new Date().toISOString(),
      memories,
      prompts,
      tags,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `das-ist-leo-archive-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target?.result as string);
          if (parsed.memories && Array.isArray(parsed.memories)) {
            soundManager.playMemoryChime(1.5);
            onImportData(parsed);
            alert(`Successfully imported ${parsed.memories.length} stories into Leo's canvas!`);
            onClose();
          } else {
            alert('Invalid backup file format.');
          }
        } catch {
          alert('Could not parse JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0917]/90 overflow-y-auto animate-fadeIn select-none font-pixel">
      <div className="relative w-full max-w-lg pixel-box p-5 md:p-6 my-6 space-y-4 text-xs">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b-2 border-[#3e2e5c] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#451a03] border-2 border-[#f59e0b] flex items-center justify-center text-[#ffd285] text-sm">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#ffd285] uppercase">
                Share with Friends
              </h2>
              <p className="text-[11px] text-[#cbd5e1]">
                Invite friends to add stories or download an archive backup
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-[#181328] border-2 border-[#3e2e5c] text-[#cbd5e1] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="space-y-4">
          
          {/* LINK COPY SECTION */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-[#cbd5e1]">
              Shareable Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 bg-[#100d1c] border-2 border-[#3e2e5c] px-3 py-1.5 text-xs text-[#f1f5f9] font-mono focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className={`pixel-btn px-4 py-1.5 font-bold text-xs flex items-center gap-1 transition-all ${
                  copied
                    ? 'bg-[#10b981] text-[#052e16]'
                    : 'bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1c120c]'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[10px] text-[#94a3b8]">
              Send this link to friends so they can add photos, notes, and voice messages for Leo.
            </p>
          </div>

          {/* EXPORT & IMPORT BACKUP */}
          <div className="p-3.5 bg-[#100d1c] border-2 border-[#3e2e5c] space-y-2.5">
            <div className="text-xs font-bold text-[#ffd285] flex items-center gap-1.5 uppercase">
              <Download className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Backup & Data Export</span>
            </div>
            <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
              Download all {memories.length} stories, questions, and notes into a JSON file to keep forever or merge between devices.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleExportJSON}
                className="flex-1 py-1.5 px-3 bg-[#181328] hover:bg-[#282142] text-[#f1f5f9] text-xs font-bold flex items-center justify-center gap-1.5 border-2 border-[#3e2e5c]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export (.json)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-1.5 px-3 bg-[#181328] hover:bg-[#282142] text-[#f1f5f9] text-xs font-bold flex items-center justify-center gap-1.5 border-2 border-[#3e2e5c]"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import (.json)</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </div>
          </div>

          {/* MESSAGE TEMPLATE */}
          <div className="p-3 bg-[#451a03]/40 border-2 border-[#f59e0b] space-y-1.5">
            <div className="font-bold text-[#ffd285] flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Invite template for group chat:</span>
            </div>
            <p className="text-[#fde047] italic text-[11px] bg-[#100d1c] p-2 border border-[#3e2e5c]">
              “Hey everyone! We created ‘Das ist Leo, the Civil Monkey’ — an interactive canvas where everyone can leave photos, voice notes, and stories for him! 🏔️✨ Take a minute to add yours here: {currentUrl}”
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
