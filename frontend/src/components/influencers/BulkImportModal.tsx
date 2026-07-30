import React, { useState } from 'react';
import { X, Upload, Check, Loader2 } from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (identifiers: string[], category?: string) => Promise<any>;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('Bulk Import');
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState('');

  if (!isOpen) return null;

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) return;

    setLoading(true);
    setResultMsg('');
    try {
      const res = await onImport(lines, category);
      setResultMsg(`Successfully imported ${res.imported_count} influencer profiles!`);
      setTimeout(() => {
        onClose();
        setText('');
        setResultMsg('');
      }, 1500);
    } catch (err: any) {
      setResultMsg('Error executing bulk import.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Bulk Import Influencers</h3>
          </div>
          <button onClick={onClose} className="text-[#8b949e] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleImport} className="p-5 space-y-4">
          {resultMsg && (
            <div className="p-3 rounded bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300">
              {resultMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#8b949e] mb-1">
              Enter Usernames or Instagram URLs (One per line)
            </label>
            <textarea
              rows={6}
              placeholder="mkbhd&#10;@cristiano&#10;https://instagram.com/mrbeast"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="saas-input w-full font-mono text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8b949e] mb-1">Assign Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="saas-input w-full text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-[#30363d]">
            <button type="button" onClick={onClose} className="saas-button-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="saas-button-primary">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Import Profiles
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
