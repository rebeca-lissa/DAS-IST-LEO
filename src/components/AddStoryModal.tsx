import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  Mic, 
  FileText, 
  Sparkles, 
  Upload,
  Square,
  Smile,
  Check
} from 'lucide-react';
import { MemoryItem, MemoryType, PromptWave } from '../types';
import { soundManager, AudioVoiceRecorder } from '../utils/audioHelper';

interface AddStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMemory: (memory: Omit<MemoryItem, 'id' | 'createdAt' | 'reactions' | 'likes'>) => void;
  prompts: PromptWave[];
  defaultPromptId?: string | null;
  currentMemoriesCount: number;
}

export const AddStoryModal: React.FC<AddStoryModalProps> = ({
  isOpen,
  onClose,
  onAddMemory,
  prompts,
  defaultPromptId,
  currentMemoriesCount,
}) => {
  const [type, setType] = useState<MemoryType>('polaroid');
  const [author, setAuthor] = useState('');
  const [authorRelation, setAuthorRelation] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedPromptId, setSelectedPromptId] = useState<string>(defaultPromptId || '');
  
  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const recorderRef = useRef<AudioVoiceRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleStartRecording = async () => {
    soundManager.playMemoryChime(1.2);
    recorderRef.current = new AudioVoiceRecorder();
    const ok = await recorderRef.current.startRecording();
    if (ok) {
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = window.setInterval(() => {
        setRecordingDuration((p) => p + 1);
      }, 1000);
    }
  };

  const handleStopRecording = async () => {
    soundManager.playMemoryChime(1.4);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recorderRef.current) {
      const result = await recorderRef.current.stopRecording();
      setIsRecording(false);
      
      // Convert blob to Base64 data URL for durable storage
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setRecordedAudioUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(result.blob);
    }
  };

  // Compress and resize image client-side to ensure lightweight localStorage persistence
  const processAndSetImageFile = (file: File) => {
    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDimension = 1000;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setMediaUrl(compressedDataUrl);
        } else {
          setMediaUrl(event.target?.result as string);
        }
        setIsProcessingImage(false);
      };
      img.onerror = () => {
        setMediaUrl(event.target?.result as string);
        setIsProcessingImage(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundManager.playMemoryChime(1.3);
      processAndSetImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      soundManager.playMemoryChime(1.3);
      processAndSetImageFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    soundManager.playLevelUpFanfare();

    // Parse custom tags
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    // If associated with a prompt wave, include that prompt's tag
    if (selectedPromptId) {
      const p = prompts.find((pr) => pr.id === selectedPromptId);
      if (p && !parsedTags.includes(p.tag)) {
        parsedTags.unshift(p.tag);
      }
    }

    if (parsedTags.length === 0) {
      parsedTags.push('#LeoBirthday');
    }

    // Assign dynamic non-overlapping coordinate
    const cols = 4;
    const row = Math.floor(currentMemoriesCount / cols);
    const col = currentMemoriesCount % cols;
    const posX = 150 + col * 360 + (Math.random() * 80 - 40);
    const posY = 150 + row * 340 + (Math.random() * 80 - 40);
    const rotation = Math.round(Math.random() * 10 - 5);

    onAddMemory({
      author: author.trim(),
      authorRelation: authorRelation.trim() || undefined,
      type,
      title: title.trim() || undefined,
      content: content.trim(),
      mediaUrl: mediaUrl || (type === 'polaroid' ? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop' : undefined),
      audioDuration: type === 'audio' ? recordingDuration || 30 : undefined,
      location: location.trim() || undefined,
      date: date.trim() || undefined,
      tags: parsedTags,
      promptId: selectedPromptId || undefined,
      position: {
        x: posX,
        y: posY,
        rotation,
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0917]/90 overflow-y-auto animate-fadeIn select-none font-pixel">
      <div className="relative w-full max-w-xl pixel-box p-5 md:p-6 my-6 space-y-4 shadow-2xl border-2 border-[#f59e0b]">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b-2 border-[#3e2e5c] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#451a03] border-2 border-[#f59e0b] flex items-center justify-center text-[#ffd285] text-sm">
              ✨
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-[#ffd285] uppercase">
                Add a Story for Leo
              </h2>
              <p className="text-[11px] text-[#cbd5e1]">
                Leave your photo, voice note, letter, or message on Leo's canvas
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

        {/* MEMORY TYPE SELECTOR TABS */}
        <div className="grid grid-cols-4 gap-1 text-xs">
          {[
            { id: 'polaroid', label: '📸 Photo', icon: Camera },
            { id: 'audio', label: '🎙️ Voice', icon: Mic },
            { id: 'letter', label: '💌 Letter', icon: FileText },
            { id: 'sticky', label: '💬 Note', icon: Smile },
          ].map((item) => {
            const isSelected = type === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  soundManager.playMemoryChime(1.1);
                  setType(item.id as MemoryType);
                }}
                className={`py-2 px-1 border-2 font-bold flex flex-col items-center gap-1 transition-all ${
                  isSelected
                    ? 'bg-[#f59e0b] text-[#1c120c] border-[#fbbf24] shadow-[2px_2px_0_#451a03]'
                    : 'bg-[#100d1c] text-[#cbd5e1] hover:text-white border-[#3e2e5c]'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          
          {/* AUTHOR & RELATION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#cbd5e1] mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Maya"
                className="w-full bg-[#100d1c] border-2 border-[#3e2e5c] px-3 py-1.5 text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#f59e0b]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#cbd5e1] mb-1">
                How do you know Leo?
              </label>
              <input
                type="text"
                value={authorRelation}
                onChange={(e) => setAuthorRelation(e.target.value)}
                placeholder="e.g. Friend / Colleague / Flatmate"
                className="w-full bg-[#100d1c] border-2 border-[#3e2e5c] px-3 py-1.5 text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#f59e0b]"
              />
            </div>
          </div>

          {/* TITLE & ASSOCIATED PROMPT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#cbd5e1] mb-1">
                Story Title / Caption
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hiking with Leo"
                className="w-full bg-[#100d1c] border-2 border-[#3e2e5c] px-3 py-1.5 text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#f59e0b]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#cbd5e1] mb-1">
                Link to Question / Prompt
              </label>
              <select
                value={selectedPromptId}
                onChange={(e) => setSelectedPromptId(e.target.value)}
                className="w-full bg-[#100d1c] border-2 border-[#3e2e5c] px-3 py-1.5 text-xs text-[#f1f5f9] focus:outline-none focus:border-[#f59e0b]"
              >
                <option value="">-- General Story --</option>
                {prompts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.tag} ({p.question.slice(0, 30)}...)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PHOTO UPLOAD OR AUDIO RECORDER BASED ON TYPE */}
          {type === 'polaroid' && (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="p-3 bg-[#100d1c] border-2 border-[#3e2e5c] space-y-2"
            >
              <label className="block text-[11px] font-bold text-[#ffd285]">
                📸 Upload Photo or Enter Image URL (Drag & drop supported):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="Paste image URL or choose file"
                  className="flex-1 bg-[#181328] border-2 border-[#3e2e5c] px-3 py-1 text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#f59e0b]"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="pixel-btn px-3 py-1 bg-[#291e45] text-[#ffd285] hover:bg-[#451a03] text-xs flex items-center gap-1 font-bold"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose File</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {isProcessingImage && (
                <p className="text-[10px] text-[#fbbf24] animate-pulse">Optimizing photo for canvas...</p>
              )}

              {mediaUrl && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-24 h-16 border-2 border-[#f59e0b] overflow-hidden bg-black">
                    <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover pixelated" />
                  </div>
                  <span className="text-[10px] text-[#34d399] flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Photo attached!
                  </span>
                </div>
              )}
            </div>
          )}

          {type === 'audio' && (
            <div className="p-3 bg-[#064e3b] border-2 border-[#34d399] space-y-2">
              <label className="block text-[11px] font-bold text-[#ecfdf5]">
                🎙️ Record Voice Note:
              </label>
              <div className="flex items-center gap-3">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="pixel-btn px-3 py-1.5 bg-[#f43f5e] text-white hover:bg-[#fb7185] font-bold text-xs flex items-center gap-1.5"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{recordedAudioUrl ? 'Re-record Voice Note' : 'Record Voice Note'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="pixel-btn px-3 py-1.5 bg-[#ef4444] text-white font-bold text-xs flex items-center gap-1.5 animate-pulse"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Recording ({recordingDuration}s)</span>
                  </button>
                )}

                {recordedAudioUrl && !isRecording && (
                  <span className="text-[10px] text-[#a7f3d0] flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Voice message saved! ({recordingDuration}s)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* MAIN MESSAGE CONTENT */}
          <div>
            <label className="block text-[11px] font-bold text-[#cbd5e1] mb-1">
              Your Message for Leo *
            </label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell Leo why he is such a special friend, share a favorite memory, or wish him a great birthday..."
              className="w-full bg-[#100d1c] border-2 border-[#3e2e5c] p-2.5 text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#f59e0b] leading-relaxed"
            />
          </div>

          {/* LOCATION & DATE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#cbd5e1] mb-1">
                Location (Optional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Vienna / Berlin / Mountain summit"
                className="w-full bg-[#100d1c] border-2 border-[#3e2e5c] px-3 py-1.5 text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#f59e0b]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#cbd5e1] mb-1">
                Year / Date (Optional)
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. 2024"
                className="w-full bg-[#100d1c] border-2 border-[#3e2e5c] px-3 py-1.5 text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#f59e0b]"
              />
            </div>
          </div>

          {/* TAGS */}
          <div>
            <label className="block text-[11px] font-bold text-[#cbd5e1] mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="#Leo, #Travel, #Adventures"
              className="w-full bg-[#100d1c] border-2 border-[#3e2e5c] px-3 py-1.5 text-xs text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#f59e0b]"
            />
          </div>

          {/* SUBMIT BUTTONS */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-[#3e2e5c]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#cbd5e1] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pixel-btn px-5 py-2 bg-[#f59e0b] hover:bg-[#fbbf24] text-[#1c120c] font-bold text-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Add to Canvas</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
