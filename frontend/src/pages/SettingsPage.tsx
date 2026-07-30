import React, { useState, useEffect } from 'react';
import { SettingsService, GoogleSyncService, SchedulerService } from '../services/api';
import { 
  Globe, 
  Database, 
  Sliders, 
  Check, 
  Loader2, 
  RefreshCw, 
  Play, 
  Pause, 
  Zap, 
  Key, 
  Info, 
  Upload, 
  FileCode,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Clock
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [savingFetchConfig, setSavingFetchConfig] = useState(false);
  const [savingGoogle, setSavingGoogle] = useState(false);
  const [fetchingAll, setFetchingAll] = useState(false);
  const [msg, setMsg] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testingGoogle, setTestingGoogle] = useState(false);

  // Fetching Settings Form
  const [intervalMinutes, setIntervalMinutes] = useState(5);
  const [batchSize, setBatchSize] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // Google Form & Guide Accordion
  const [sheetsId, setSheetsId] = useState('');
  const [credsJson, setCredsJson] = useState('');
  const [autoSync, setAutoSync] = useState(false);
  const [syncIntervalMin, setSyncIntervalMin] = useState(60);
  const [credsMode, setCredsMode] = useState<'upload' | 'paste'>('upload');
  const [showGuide, setShowGuide] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [settingsData, schedStatus] = await Promise.all([
        SettingsService.getSettings(),
        SchedulerService.getStatus()
      ]);

      if (schedStatus) {
        setIntervalMinutes(schedStatus.interval_minutes || 5);
        setBatchSize(schedStatus.batch_size || 1);
        setIsPaused(schedStatus.is_paused || false);
      }

      if (settingsData.google) {
        setSheetsId(settingsData.google.sheets_id || '');
        setCredsJson(settingsData.google.credentials_json || '');
        setAutoSync(settingsData.google.auto_sync || false);
        setSyncIntervalMin(settingsData.google.sync_interval_min || 60);
        if (settingsData.google.credentials_json) {
          setCredsMode('paste');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const extractClientEmail = (jsonStr: string): string => {
    if (!jsonStr) return '';
    try {
      const parsed = JSON.parse(jsonStr);
      return parsed.client_email || '';
    } catch {
      return '';
    }
  };

  const clientEmail = extractClientEmail(credsJson);

  const handleCopyEmail = () => {
    if (clientEmail) {
      navigator.clipboard.writeText(clientEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const text = reader.result as string;
        setCredsJson(text);
        setMsg(`Loaded key file '${file.name}'! Click 'Save Google Settings' below.`);
        setTimeout(() => setMsg(''), 4000);
      };
      reader.readAsText(file);
    }
  };

  const handleSaveFetchConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFetchConfig(true);
    try {
      await apiUpdateFetchConfig(intervalMinutes, batchSize, isPaused);
      setMsg('Fetching settings saved successfully!');
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setSavingFetchConfig(false);
    }
  };

  const handleTogglePause = async () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    await apiUpdateFetchConfig(intervalMinutes, batchSize, nextPaused);
    setMsg(nextPaused ? 'Automatic fetching paused.' : 'Automatic fetching resumed.');
    setTimeout(() => setMsg(''), 3000);
  };

  const apiUpdateFetchConfig = async (interval: number, batch: number, paused: boolean) => {
    const res = await fetch('http://localhost:8000/api/v1/scheduler/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interval_minutes: interval,
        batch_size: batch,
        is_paused: paused
      })
    });
    return res.json();
  };

  const handleFetchAllNow = async () => {
    setFetchingAll(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/scheduler/fetch-all', { method: 'POST' });
      const data = await res.json();
      setMsg(`Manual fetch-all triggered: ${data.message || 'Complete!'}`);
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setMsg('Error executing fetch-all.');
    } finally {
      setFetchingAll(false);
    }
  };

  const handleSaveGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGoogle(true);
    try {
      await SettingsService.updateGoogle({
        sheets_id: sheetsId,
        credentials_json: credsJson,
        auto_sync: autoSync,
        sync_interval_min: syncIntervalMin
      });
      setMsg('Google Sheets settings & sync timer saved successfully!');
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setSavingGoogle(false);
    }
  };

  const handleTestGoogle = async () => {
    setTestingGoogle(true);
    setTestResult(null);
    try {
      const res = await GoogleSyncService.testConnection(sheetsId, credsJson);
      setTestResult(res);
    } finally {
      setTestingGoogle(false);
    }
  };

  const handleVacuum = async () => {
    try {
      await SettingsService.vacuumDb();
      setMsg('Database vacuum & optimization completed successfully.');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-[#8b949e]">Loading configuration settings...</div>;
  }

  return (
    <div className="space-y-6">
      {msg && (
        <div className="p-3 rounded bg-emerald-950/50 border border-emerald-800 text-xs text-emerald-300">
          {msg}
        </div>
      )}

      {/* Primary Fetching Settings Panel */}
      <div className="saas-card">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#30363d]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Fetching Schedule & Controls</h3>
              <p className="text-xs text-[#8b949e]">Configure interval timing, batch concurrency, and pause state.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={isPaused ? "badge-paused" : "badge-active"}>
              {isPaused ? "Fetching Paused" : "Fetching Active"}
            </span>

            <button
              onClick={handleTogglePause}
              className={`saas-button-secondary text-xs py-1.5 ${
                isPaused ? 'border-[#238636] text-[#3fb950]' : 'border-[#d29922] text-[#d29922]'
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5" /> Resume Fetching
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause Fetching
                </>
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveFetchConfig} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1">
                Fetch Interval Time Span
              </label>
              <select
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                className="saas-input w-full bg-[#0d1117]"
              >
                <option value={1}>Every 1 minute (Fast testing)</option>
                <option value={5}>Every 5 minutes (Recommended)</option>
                <option value={10}>Every 10 minutes</option>
                <option value={15}>Every 15 minutes</option>
                <option value={30}>Every 30 minutes</option>
                <option value={60}>Every 1 hour</option>
              </select>
              <p className="text-[11px] text-[#8b949e] mt-1">Time delay between automatic background batch fetches.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1">
                Influencers Per Interval (Batch Size)
              </label>
              <select
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="saas-input w-full bg-[#0d1117]"
              >
                <option value={1}>1 influencer per interval</option>
                <option value={2}>2 influencers per interval</option>
                <option value={5}>5 influencers per interval</option>
                <option value={10}>10 influencers per interval</option>
              </select>
              <p className="text-[11px] text-[#8b949e] mt-1">Number of queued profiles to fetch sequentially each interval.</p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-[#30363d]">
            <button type="submit" disabled={savingFetchConfig} className="saas-button-primary text-xs cursor-pointer">
              {savingFetchConfig ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save Fetching Settings
            </button>

            <button
              type="button"
              onClick={handleFetchAllNow}
              disabled={fetchingAll}
              className="saas-button-secondary text-xs text-[#58a6ff] cursor-pointer"
            >
              {fetchingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              Fetch All Profiles Now
            </button>
          </div>
        </form>
      </div>

      {/* Google Integration Settings */}
      <div className="saas-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Google Sheets Synchronization & Timer</h3>
              <p className="text-xs text-[#8b949e]">Auto-sync tracked profiles into your Google Sheet on your custom schedule.</p>
            </div>
          </div>
        </div>

        {/* Collapsible Accordion Guide */}
        <div className="border border-[#30363d] rounded-lg overflow-hidden bg-[#0d1117]">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="w-full p-3 flex items-center justify-between text-xs font-semibold text-white hover:bg-[#161b22] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#58a6ff]" />
              <span>Step-by-Step Google Sheets Setup Guide</span>
            </div>
            {showGuide ? <ChevronUp className="w-4 h-4 text-[#8b949e]" /> : <ChevronDown className="w-4 h-4 text-[#8b949e]" />}
          </button>

          {showGuide && (
            <div className="p-4 border-t border-[#30363d] text-xs text-[#c9d1d9] space-y-3 bg-[#0d1117] animate-fadeIn">
              <div className="space-y-2 text-[11px] leading-relaxed">
                <p>Follow these 4 simple steps to connect your live Google Spreadsheet:</p>

                <div className="p-2.5 bg-[#161b22] rounded border border-[#30363d] space-y-1">
                  <div className="font-semibold text-emerald-400">Step 1: Create & Copy Spreadsheet ID</div>
                  <p className="text-[#8b949e]">
                    Open <a href="https://sheets.google.com" target="_blank" rel="noreferrer" className="text-[#58a6ff] hover:underline inline-flex items-center gap-0.5">Google Sheets <ExternalLink className="w-2.5 h-2.5" /></a> and create a blank sheet. Copy the Sheet ID or full link from your browser address bar.
                  </p>
                </div>

                <div className="p-2.5 bg-[#161b22] rounded border border-[#30363d] space-y-1">
                  <div className="font-semibold text-emerald-400">Step 2: Create Free Google Service Account</div>
                  <ol className="list-decimal list-inside space-y-0.5 text-[#8b949e]">
                    <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-[#58a6ff] hover:underline inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink className="w-2.5 h-2.5" /></a> and create a project.</li>
                    <li>Search for <b>Google Sheets API</b> and click <b>Enable</b>.</li>
                    <li>Go to <b>Credentials &rarr; Create Credentials &rarr; Service Account</b>.</li>
                    <li>Under your new Service Account, open <b>Keys &rarr; Add Key &rarr; Create new key (JSON)</b>.</li>
                  </ol>
                </div>

                <div className="p-2.5 bg-[#161b22] rounded border border-[#30363d] space-y-1">
                  <div className="font-semibold text-emerald-400">Step 3: Upload or Paste JSON Key Below</div>
                  <p className="text-[#8b949e]">
                    Upload your downloaded <code className="text-amber-300">.json</code> file or paste its text. The app will automatically extract your Service Account email address!
                  </p>
                </div>

                <div className="p-2.5 bg-[#161b22] rounded border border-[#30363d] space-y-1">
                  <div className="font-semibold text-emerald-400">Step 4: Share Google Sheet with Extracted Email</div>
                  <p className="text-[#8b949e]">
                    Open your Google Sheet, click top-right <b>Share</b>, paste the extracted Service Account email below, grant <b>Editor</b> access, and save!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveGoogle} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1">
                Google Spreadsheet ID or Full Link *
              </label>
              <input
                type="text"
                placeholder="e.g. 1ckCKGWjXv_gT6en-kwlLC35t73eIUNQXfEuDdtKWFKQ"
                value={sheetsId}
                onChange={(e) => setSheetsId(e.target.value)}
                className="saas-input w-full font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8b949e] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" /> Automated Google Sync Schedule Timer
              </label>
              <select
                value={syncIntervalMin}
                onChange={(e) => setSyncIntervalMin(Number(e.target.value))}
                className="saas-input w-full bg-[#0d1117]"
              >
                <option value={5}>Every 5 minutes</option>
                <option value={10}>Every 10 minutes</option>
                <option value={15}>Every 15 minutes</option>
                <option value={30}>Every 30 minutes</option>
                <option value={60}>Every 1 hour (Default)</option>
                <option value={180}>Every 3 hours</option>
                <option value={360}>Every 6 hours</option>
                <option value={720}>Every 12 hours</option>
                <option value={1440}>Every 24 hours (Daily)</option>
              </select>
              <p className="text-[11px] text-[#8b949e] mt-1">
                Background timer for auto-pushing data to your Google Sheet.
              </p>
            </div>
          </div>

          {/* Credentials Mode Tabs & Input */}
          <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#8b949e] flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-amber-400" /> Service Account Key Credentials
              </label>

              <div className="flex items-center gap-1 bg-[#161b22] p-0.5 rounded border border-[#30363d]">
                <button
                  type="button"
                  onClick={() => setCredsMode('upload')}
                  className={`px-2 py-0.5 text-[11px] rounded font-medium transition-colors cursor-pointer ${
                    credsMode === 'upload' ? 'bg-[#1f6feb] text-white' : 'text-[#8b949e]'
                  }`}
                >
                  <Upload className="w-3 h-3 inline mr-1" /> Upload JSON File
                </button>
                <button
                  type="button"
                  onClick={() => setCredsMode('paste')}
                  className={`px-2 py-0.5 text-[11px] rounded font-medium transition-colors cursor-pointer ${
                    credsMode === 'paste' ? 'bg-[#1f6feb] text-white' : 'text-[#8b949e]'
                  }`}
                >
                  <FileCode className="w-3 h-3 inline mr-1" /> Paste JSON Text
                </button>
              </div>
            </div>

            {credsMode === 'upload' ? (
              <div className="space-y-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleJsonFileUpload}
                  className="block w-full text-xs text-[#8b949e] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-[#21262d] file:text-white hover:file:bg-[#30363d] cursor-pointer"
                />
                {credsJson && (
                  <div className="text-[11px] text-emerald-400 font-mono truncate">
                    ✓ Key loaded (Length: {credsJson.length} chars)
                  </div>
                )}
              </div>
            ) : (
              <textarea
                rows={4}
                placeholder='Paste full Service Account JSON content here: {"type": "service_account", "project_id": "...", "client_email": "...", ...}'
                value={credsJson}
                onChange={(e) => setCredsJson(e.target.value)}
                className="saas-input w-full font-mono text-xs"
              />
            )}

            {/* Auto-Extracted Client Email Box */}
            {clientEmail && (
              <div className="p-2.5 bg-[#161b22] border border-emerald-900/60 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 animate-fadeIn">
                <div>
                  <div className="text-[11px] font-semibold text-emerald-400">
                    📧 Extracted Service Account Email (Use to Share Sheet):
                  </div>
                  <code className="text-xs text-white font-mono select-all break-all">
                    {clientEmail}
                  </code>
                </div>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="saas-button-secondary text-xs py-1 text-emerald-300 border-emerald-800 hover:bg-emerald-950/40 shrink-0 cursor-pointer flex items-center gap-1"
                >
                  {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedEmail ? 'Copied!' : 'Copy Email'}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoSync"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="rounded bg-[#0d1117] border-[#30363d] cursor-pointer"
            />
            <label htmlFor="autoSync" className="text-xs text-white font-medium cursor-pointer">
              Enable Automatic Google Sheets Sync (Background Timer)
            </label>
          </div>

          {testResult && (
            <div className={`p-3 rounded text-xs ${testResult.success ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800' : 'bg-rose-950/50 text-rose-300 border border-rose-800'}`}>
              {testResult.message}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-[#30363d]">
            <button type="submit" disabled={savingGoogle} className="saas-button-primary text-xs cursor-pointer">
              {savingGoogle ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save Google Settings
            </button>
            <button
              type="button"
              onClick={handleTestGoogle}
              disabled={testingGoogle}
              className="saas-button-secondary text-xs cursor-pointer"
            >
              {testingGoogle ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Test Sheet Connection
            </button>
          </div>
        </form>
      </div>

      {/* Database Maintenance */}
      <div className="saas-card">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-white">SQLite Database Operations</h3>
        </div>
        <p className="text-xs text-[#8b949e] mb-4">
          Perform SQLite vacuuming to optimize storage and rebuild database indices.
        </p>
        <button onClick={handleVacuum} className="saas-button-secondary text-xs cursor-pointer">
          Vacuum & Optimize Database
        </button>
      </div>
    </div>
  );
};
