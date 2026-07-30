import React, { useState } from 'react';
import { X, Check, Loader2, Camera, Upload, Link as LinkIcon } from 'lucide-react';
import { AvatarImage } from '../common/AvatarImage';

interface AddInfluencerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => Promise<void>;
}

export const AddInfluencerModal: React.FC<AddInfluencerModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarMode, setAvatarMode] = useState<'url' | 'file'>('url');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [interval, setInterval] = useState(24);
  const [priority, setPriority] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const cleanInputUsername = (input: string): string => {
    if (!input) return '';
    const cleanStr = input.trim();
    const noQuery = cleanStr.split('?')[0].split('#')[0].replace(/\/+$/, '');
    const parts = noQuery.split('/');
    return parts[parts.length - 1].replace('@', '').trim();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = cleanInputUsername(username);

    if (!cleaned) {
      setError('Please enter a valid Instagram username or profile URL.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onAdd({
        username: cleaned,
        display_name: displayName.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
        category: category.trim(),
        tags: tags.trim() || undefined,
        update_interval_hours: Number(interval),
        priority: Number(priority),
      });
      setUsername('');
      setDisplayName('');
      setAvatarUrl('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to validate or add influencer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-pink-500" />
            <h3 className="text-sm font-semibold text-white">Track New Influencer</h3>
          </div>
          <button onClick={onClose} className="text-[#8b949e] hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Profile Picture Upload Section */}
          <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#8b949e]">Profile Picture (Optional)</label>
              <div className="flex items-center gap-1 bg-[#161b22] p-0.5 rounded border border-[#30363d]">
                <button
                  type="button"
                  onClick={() => setAvatarMode('url')}
                  className={`px-2 py-0.5 text-[11px] rounded font-medium transition-colors cursor-pointer ${
                    avatarMode === 'url' ? 'bg-[#1f6feb] text-white' : 'text-[#8b949e]'
                  }`}
                >
                  <LinkIcon className="w-3 h-3 inline mr-1" /> Paste URL
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarMode('file')}
                  className={`px-2 py-0.5 text-[11px] rounded font-medium transition-colors cursor-pointer ${
                    avatarMode === 'file' ? 'bg-[#1f6feb] text-white' : 'text-[#8b949e]'
                  }`}
                >
                  <Upload className="w-3 h-3 inline mr-1" /> Upload File
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <AvatarImage
                src={avatarUrl}
                username={username || 'preview'}
                className="w-12 h-12 rounded-full border border-[#30363d] bg-[#161b22] object-cover shrink-0"
              />

              <div className="flex-1">
                {avatarMode === 'url' ? (
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="saas-input w-full text-xs"
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="block w-full text-xs text-[#8b949e] file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-[#21262d] file:text-white hover:file:bg-[#30363d] cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8b949e] mb-1">
              Instagram Username or Profile URL *
            </label>
            <input
              type="text"
              placeholder="e.g. @leomessi or instagram.com/leomessi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="saas-input w-full"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1">Display Name (Optional)</label>
              <input
                type="text"
                placeholder="Leo Messi"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="saas-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="saas-input w-full bg-[#0d1117]"
              >
                <option value="General">General</option>
                <option value="Tech & Media">Tech & Media</option>
                <option value="Sports">Sports</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Fashion & Beauty">Fashion & Beauty</option>
                <option value="Fitness">Fitness</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1">Update Interval (Hours)</label>
              <input
                type="number"
                min="1"
                max="168"
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                className="saas-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="saas-input w-full bg-[#0d1117]"
              >
                <option value={1}>Normal Priority</option>
                <option value={2}>High Priority</option>
                <option value={3}>Urgent Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8b949e] mb-1">Tags (Comma Separated)</label>
            <input
              type="text"
              placeholder="e.g. Creator, Tech, Ambassador"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="saas-input w-full"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-[#30363d]">
            <button type="button" onClick={onClose} className="saas-button-secondary font-medium cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="saas-button-primary cursor-pointer">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {loading ? 'Validating & Adding...' : 'Save & Track Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
