import React, { useState } from 'react';
import { Upload, Video, Trash2 } from 'lucide-react';

export interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  type: 'image' | 'video';
}

const FileUploader = ({ onFilesChange }: { onFilesChange: (files: UploadedFile[]) => void }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const simulateUpload = (id: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: 100, status: 'completed' } : f));
      } else {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, progress } : f));
      }
    }, 300);
  };

  const handleFiles = (incomingFiles: FileList | File[]) => {
    const newFiles: UploadedFile[] = Array.from(incomingFiles).map(file => {
      const id = Math.random().toString(36).substr(2, 9);
      const isImage = file.type.startsWith('image/');
      const fileObj: UploadedFile = {
        id,
        file,
        preview: isImage ? URL.createObjectURL(file) : '',
        progress: 0,
        status: 'uploading',
        type: isImage ? 'image' : 'video'
      };
      simulateUpload(id);
      return fileObj;
    });
    const updated = [...files, ...newFiles];
    setFiles(updated);
    onFilesChange(updated);
  };

  const removeFile = (id: string) => {
    const updated = files.filter(f => f.id !== id);
    setFiles(updated);
    onFilesChange(updated);
  };

  return (
    <div className="space-y-6">
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
        className={`bg-emerald-50/50 p-12 rounded-[3rem] border-2 border-dashed transition-all text-center cursor-pointer ${isDragging ? 'border-emerald-500 bg-emerald-100' : 'border-emerald-200'}`}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input id="file-input" type="file" multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        <Upload className="mx-auto mb-4 text-emerald-400" size={40} />
        <div className="text-sm font-black text-emerald-950 uppercase tracking-widest">Drop Assets Here</div>
        <p className="text-[10px] text-emerald-600/60 font-bold mt-1 uppercase">Images or Videos (Max 20MB)</p>
      </div>
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {files.map(f => (
            <div key={f.id} className="aspect-square rounded-3xl overflow-hidden relative group bg-slate-100 border border-slate-200 shadow-sm">
              {f.type === 'image' ? <img src={f.preview} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><Video size={24} /></div>}
              <div className={`absolute inset-0 flex flex-col items-center justify-center ${f.status === 'uploading' ? 'bg-slate-900/40' : 'bg-slate-900/60 opacity-0 group-hover:opacity-100'} transition-all`}>
                {f.status === 'uploading' ? (
                  <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-emerald-400 animate-spin" />
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); removeFile(f.id); }} className="p-3 bg-rose-500 text-white rounded-full"><Trash2 size={18} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
