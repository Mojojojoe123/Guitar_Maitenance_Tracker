import React from 'react';
import { Camera, X, Upload } from 'lucide-react';

interface ImagePresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
}

const PRESET_IMAGES = [
  {
    name: 'Teal Flame (PRS Style)',
    url: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&w=1200&q=85'
  },
  {
    name: 'Sunburst Bass (Stingray Style)',
    url: 'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?auto=format&fit=crop&w=1200&q=85'
  },
  {
    name: 'Dark Acoustic (Eastman Style)',
    url: 'https://images.unsplash.com/photo-1550226891-ef816a34ba37?auto=format&fit=crop&w=1200&q=85'
  },
  {
    name: 'Blue Flame Maple (Bacchus Style)',
    url: 'https://images.unsplash.com/photo-1525201548942-d8c8b09d55f0?auto=format&fit=crop&w=1200&q=85'
  },
  {
    name: 'Modern Headless (Eart Style)',
    url: 'https://images.unsplash.com/photo-1605020422156-2055787ec3a2?auto=format&fit=crop&w=1200&q=85'
  },
  {
    name: 'Natural Acoustic (Yamaha Style)',
    url: 'https://images.unsplash.com/photo-1445985543470-41fba5c3144a?auto=format&fit=crop&w=1200&q=85'
  },
  {
    name: 'Vintage Red Semi-Hollow',
    url: 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=1200&q=85'
  },
  {
    name: 'Golden Amber Solid Body',
    url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=1200&q=85'
  }
];

export default function ImagePresetsModal({
  isOpen,
  onClose,
  onSelectImage
}: ImagePresetsModalProps) {
  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1920;
            const MAX_HEIGHT = 1920;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
              onSelectImage(compressedDataUrl);
              onClose();
            } else {
              onSelectImage(reader.result as string);
              onClose();
            }
          };
          img.onerror = () => {
            onSelectImage(reader.result as string);
            onClose();
          };
          img.src = reader.result;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        id="image-presets-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-emerald-500">
            <Camera className="h-5 w-5" />
            <h3 className="text-base font-semibold font-display tracking-tight text-white">Choose Instrument Photo</h3>
          </div>
          <button 
            type="button" 
            id="close-presets-modal-btn"
            onClick={onClose} 
            className="p-1 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* File Upload Zone */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Upload from your Device
            </label>
            <div className="relative group flex flex-col items-center justify-center border border-dashed border-neutral-800 hover:border-emerald-500/50 bg-neutral-950 hover:bg-neutral-950/80 p-6 rounded-xl transition-all cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file-upload-input"
              />
              <Upload className="h-8 w-8 text-neutral-500 group-hover:text-emerald-500 transition-colors mb-2" />
              <p className="text-sm font-medium text-neutral-300">Choose a file or drag here</p>
              <p className="text-xs text-neutral-500 mt-1">Supports JPEG, PNG, WEBP</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
