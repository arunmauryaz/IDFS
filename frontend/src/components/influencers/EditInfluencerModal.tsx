import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, Upload, Link as LinkIcon } from 'lucide-react';
import type { Influencer } from '../../types';
import { AvatarImage } from '../common/AvatarImage';

interface EditInfluencerModalProps {
  influencer: Influencer | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: Partial<Influencer>) => Promise<void>;
}

export const EditInfluencerModal: React.FC<EditInfluencerModalProps> = ({
  influencer,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarMode, setAvatarMode] = useState<'url' | 'file'>('url');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [interval, setInterval] = useState(24);
  const [priority, setPriority] = useState(1);
  const [status, setStatus] = useState<'active' | 'paused' | 'error' | 'disabled'>('active');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (influencer) {
      setDisplayName(influencer.display_name || '');
      setAvatarUrl(influencer.avatar_url || '');
      setCategory(influencer.category || 'General');
      setTags(influencer.tags || '');
      setInterval(influencer.update_interval_hours || 24);
      setPriority(influencer.priority || 1);
      setStatus(influencer.status || 'active');
    }
  }, [influencer]);

  if (!isOpen || !influencer) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(influencer.id, {
        display_name: displayName,
        avatar_url: avatarUrl,
        category,
        tags,
        update_interval_hours: interval,
        priority,
        status
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Edit Influencer @{influencer.username}</h3>
          <button onClick={onClose} className="text-[#8b949e] hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Profile Picture Upload Section */}
          <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#8b949e]">Profile Picture</label>
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
                username={influencer.username}
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
            <label className="block text-xs font-semibold text-[#8b949e] mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="saas-input w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="saas-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1">Tracking Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="saas-input w-full bg-[#0d1117]"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="disabled">Disabled</option>
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
                <option value={1}>Normal</option>
                <option value={2}>High</option>
                <option value={3}>Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8b949e] mb-1">Tags</label>
            <input
              type="text"
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
