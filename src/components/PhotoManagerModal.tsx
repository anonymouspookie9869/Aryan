import React, { useState } from 'react';
import { Upload, Plus, Trash2, Heart, X, Check, Image as ImageIcon, Sparkles, Settings, Calendar, User } from 'lucide-react';
import { PhotoItem, PartnerInfo } from '../types';
import { romanticAudio } from '../utils/romanticAudio';
import { RomanticPhotoImg } from './RomanticPhotoImg';

interface PhotoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: PhotoItem[];
  partner: PartnerInfo;
  onAddPhotos: (newPhotos: Partial<PhotoItem>[]) => void;
  onDeletePhoto: (id: string) => void;
  onUpdatePartner: (updated: Partial<PartnerInfo>) => void;
}

export const PhotoManagerModal: React.FC<PhotoManagerModalProps> = ({
  isOpen,
  onClose,
  photos,
  partner,
  onAddPhotos,
  onDeletePhoto,
  onUpdatePartner,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'upload' | 'manage' | 'partner'>('upload');

  // Single URL form state
  const [urlInput, setUrlInput] = useState('');
  const [captionInput, setCaptionInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [chapterInput, setChapterInput] = useState('Everyday Magic');

  // Partner Settings State
  const [girlfriendName, setGirlfriendName] = useState(partner.girlfriendName);
  const [clientName, setClientName] = useState(partner.clientName);
  const [birthdayDate, setBirthdayDate] = useState(partner.birthdayDate);
  const [anniversaryDate, setAnniversaryDate] = useState(partner.anniversaryDate);
  const [heroTagline, setHeroTagline] = useState(partner.heroTagline);
  const [partnerSaveSuccess, setPartnerSaveSuccess] = useState(false);

  React.useEffect(() => {
    setGirlfriendName(partner.girlfriendName);
    setClientName(partner.clientName);
    setBirthdayDate(partner.birthdayDate);
    setAnniversaryDate(partner.anniversaryDate);
    setHeroTagline(partner.heroTagline);
  }, [partner]);

  // File Upload State for 30-40 photos
  const [selectedFiles, setSelectedFiles] = useState<{ url: string; name: string }[]>([]);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [uploadSuccessCount, setUploadSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  // Handle local file selection (batch upload 30-40 photos!)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsProcessingFiles(true);
    const files = Array.from(e.target.files) as File[];
    const loadedFiles: { url: string; name: string }[] = [];

    let completed = 0;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loadedFiles.push({
            url: event.target.result as string,
            name: file.name.replace(/\.[^/.]+$/, "")
          });
        }
        completed++;
        if (completed === files.length) {
          setSelectedFiles(prev => [...prev, ...loadedFiles]);
          setIsProcessingFiles(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Submit all batch files to gallery
  const handleBatchUploadSubmit = () => {
    if (selectedFiles.length === 0) return;

    const newPhotoItems: Partial<PhotoItem>[] = selectedFiles.map((item, idx) => ({
      url: item.url,
      caption: item.name || `Sweet Memory #${photos.length + idx + 1}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      location: 'Together',
      chapter: 'Everyday Magic',
      notes: 'Every photo with you is a memory I will treasure forever.',
      isFavorite: false
    }));

    onAddPhotos(newPhotoItems);
    setUploadSuccessCount(selectedFiles.length);
    setSelectedFiles([]);
    romanticAudio.playChime([523.25, 659.25, 880]);

    setTimeout(() => {
      setUploadSuccessCount(null);
    }, 3500);
  };

  // Submit single URL photo
  const handleSinglePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    onAddPhotos([{
      url: urlInput.trim(),
      caption: captionInput.trim() || 'A beautiful memory',
      date: dateInput.trim() || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      location: locationInput.trim() || 'Together',
      chapter: chapterInput,
      notes: notesInput.trim() || 'Captured with all my love.',
      isFavorite: true
    }]);

    setUrlInput('');
    setCaptionInput('');
    setDateInput('');
    setLocationInput('');
    setNotesInput('');
    romanticAudio.playChime();
    setUploadSuccessCount(1);
    setTimeout(() => setUploadSuccessCount(null), 3000);
  };

  // Save Partner Details
  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePartner({
      girlfriendName,
      clientName,
      birthdayDate,
      anniversaryDate,
      heroTagline
    });
    setPartnerSaveSuccess(true);
    romanticAudio.playChime();
    setTimeout(() => setPartnerSaveSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#fff0f6] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-pink-200 shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-pink-200 flex items-center justify-between bg-pink-100/50">
          <div>
            <div className="flex items-center gap-2 text-pink-600 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalize Website</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-stone-900">
              Upload Photos & Settings
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-pink-50 border border-pink-200 hover:bg-pink-100 flex items-center justify-center text-stone-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex border-b border-pink-200 px-6 gap-4 bg-[#fff0f6]">
          <button
            onClick={() => setActiveSubTab('upload')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'upload'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            Bulk Photo Uploader (30-40 Photos)
          </button>
          <button
            onClick={() => setActiveSubTab('manage')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'manage'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            Manage Photos ({photos.length})
          </button>
          <button
            onClick={() => setActiveSubTab('partner')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
              activeSubTab === 'partner'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            Names & Dates Customizer
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Notification banner */}
          {uploadSuccessCount !== null && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm animate-fadeIn">
              <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Success!</strong> Successfully added {uploadSuccessCount} photo{uploadSuccessCount > 1 ? 's' : ''} to the Photo Vault!
              </span>
            </div>
          )}

          {/* SUB-TAB 1: UPLOAD PHOTOS */}
          {activeSubTab === 'upload' && (
            <div className="space-y-8">
              
              {/* Box 1: Drop/Select Multiple Photos from computer */}
              <div className="border-2 border-dashed border-pink-300 rounded-3xl p-6 sm:p-8 text-center bg-pink-50/40 hover:bg-pink-50/70 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600 mx-auto mb-3">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="font-display font-bold text-lg text-stone-900 mb-1">
                  Upload Multiple Photos of Her (30-40 Photos)
                </h4>
                <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto mb-4">
                  Select 1, 10, or all 40 of her photos directly from your computer or phone. They will instantly load into your private celebration vault.
                </p>

                <label className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-semibold text-xs sm:text-sm shadow-md shadow-pink-500/25 cursor-pointer transition-transform active:scale-95">
                  <Plus className="w-4 h-4" />
                  <span>Choose Photos (Multiple Files)</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {isProcessingFiles && (
                  <p className="text-xs text-pink-600 font-medium mt-3 animate-pulse">
                    Processing photos... please wait a moment ✨
                  </p>
                )}

                {/* Staged Batch Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-pink-200/80 text-left">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-stone-800">
                        Selected {selectedFiles.length} photo{selectedFiles.length > 1 ? 's' : ''} ready to add:
                      </span>
                      <button
                        onClick={handleBatchUploadSubmit}
                        className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        Confirm & Save All {selectedFiles.length} Photos!
                      </button>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1 bg-pink-50/80 rounded-xl border border-pink-200">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-pink-200">
                          <img src={file.url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Box 2: Single Photo via URL */}
              <div className="bg-pink-50/40 rounded-2xl p-5 border border-pink-200">
                <h4 className="font-display font-bold text-stone-900 text-base mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-pink-500" />
                  <span>Or Add Photo by URL & Custom Caption</span>
                </h4>

                <form onSubmit={handleSinglePhotoSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Image URL *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://..."
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-pink-50/80 text-xs focus:outline-none focus:border-pink-500 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Caption / Moment Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Laughing in the summer rain"
                        value={captionInput}
                        onChange={(e) => setCaptionInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-pink-50/80 text-xs focus:outline-none focus:border-pink-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Date & Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. July 2024, Sunset Bay"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-pink-50/80 text-xs focus:outline-none focus:border-pink-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Secret Note Behind Polaroid
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. I knew right then that I wanted to spend forever with you."
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-pink-50/80 text-xs focus:outline-none focus:border-pink-500 focus:bg-white"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-semibold shadow-xs shadow-pink-500/25 cursor-pointer"
                    >
                      Add Photo to Gallery
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* SUB-TAB 2: MANAGE PHOTOS LIST */}
          {activeSubTab === 'manage' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-500">
                You have {photos.length} photos in the album. You can remove duplicates or test photos here:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="flex items-center gap-3 p-2.5 rounded-2xl border border-pink-200 bg-pink-50/70 shadow-2xs"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-pink-100 flex-shrink-0 border border-pink-200">
                      <RomanticPhotoImg
                        src={photo.url}
                        fallbackSrc={photo.fallbackUrl}
                        photoIndex={photo.photoIndex}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-900 truncate">
                        {photo.caption}
                      </p>
                      <p className="text-[10px] text-stone-500 truncate">
                        {photo.date || 'Sweet moment'} • {photo.location || 'Together'}
                      </p>
                    </div>
                    <button
                      onClick={() => onDeletePhoto(photo.id)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-pink-600 hover:bg-pink-100 cursor-pointer transition-colors"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB 3: PARTNER & NAMES SETTINGS */}
          {activeSubTab === 'partner' && (
            <form onSubmit={handleSavePartner} className="space-y-4">
              {partnerSaveSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Personalization saved successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Girlfriend's Name / Nickname *
                  </label>
                  <input
                    type="text"
                    required
                    value={girlfriendName}
                    onChange={(e) => setGirlfriendName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-pink-50/80 text-xs focus:outline-none focus:border-pink-500 focus:bg-white"
                    placeholder="e.g. Elena, Maya, Sweetheart"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Name (Client / Boyfriend) *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-pink-50/80 text-xs focus:outline-none focus:border-pink-500 focus:bg-white"
                    placeholder="e.g. Alex"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Her Birthday Date
                  </label>
                  <input
                    type="date"
                    value={birthdayDate}
                    onChange={(e) => setBirthdayDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-pink-50/80 text-xs focus:outline-none focus:border-pink-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Anniversary / Started Dating Date
                  </label>
                  <input
                    type="date"
                    value={anniversaryDate}
                    onChange={(e) => setAnniversaryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-pink-50/80 text-xs focus:outline-none focus:border-pink-500 focus:bg-white"
                  />
                  <span className="text-[10px] text-stone-400">Powering the live Days Together counter</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Hero Tagline on Homepage
                </label>
                <input
                  type="text"
                  value={heroTagline}
                  onChange={(e) => setHeroTagline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-pink-200 bg-pink-50/80 text-xs focus:outline-none focus:border-pink-500 focus:bg-white"
                  placeholder="e.g. To the girl who made my whole world brighter with just one smile."
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white text-xs font-semibold shadow-xs shadow-pink-500/25 cursor-pointer"
                >
                  Save Personalization Changes
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-pink-200 bg-pink-100/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-pink-200 hover:bg-pink-300 text-pink-900 text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
