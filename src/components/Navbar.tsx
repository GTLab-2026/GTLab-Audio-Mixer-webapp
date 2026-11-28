import React, { useState, useEffect } from 'react';
import { Sliders, Disc, Activity, Volume2, Cloud, Sparkles, Music, ShieldAlert, Settings, Info, Cpu, HardDrive, SlidersHorizontal, X, Check, Radio } from 'lucide-react';

interface Props {
  activeTab: 'nowplaying' | 'mixer' | 'atmos' | 'mastermix';
  setActiveTab: (tab: 'nowplaying' | 'mixer' | 'atmos' | 'mastermix') => void;
  onOpenDriveModal: () => void;
  playlistCount: number;
}

export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab, onOpenDriveModal, playlistCount }) => {
  const [settingsMenuOpen, setSettingsMenuOpen] = useState<boolean>(false);
  const [activeConfigTab, setActiveConfigTab] = useState<string>('player');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const getViewTitle = () => {
    switch (activeTab) {
      case 'nowplaying': return 'NOW PLAYING VIEW';
      case 'mixer': return 'MIX VIEW';
      case 'atmos': return 'DOLBY ATMOS VIEW';
      case 'mastermix': return 'MASTER MIX & CONFIG';
      default: return 'WORKSPACE';
    }
  };

  // Real-time Master Gain Meter levels for L and R channels
  const [meterLevels, setMeterLevels] = useState<{ l: number; r: number; lPeak: boolean; rPeak: boolean }>({
    l: 65,
    r: 70,
    lPeak: false,
    rPeak: true,
  });

  interface DiagnosticLog {
    timestamp: string;
    channel: 'L' | 'C' | 'R';
    peakDb: number;
    details: string;
  }

  const [diagnosticLogs, setDiagnosticLogs] = useState<DiagnosticLog[]>([
    { timestamp: '05:00:12', channel: 'L', peakDb: 0.4, details: 'Transient clip on sub-bass limiter threshold' },
    { timestamp: '05:02:45', channel: 'R', peakDb: 0.8, details: 'Master bus summing peak over -0.1dBFS' },
    { timestamp: '05:08:19', channel: 'C', peakDb: 0.2, details: 'Center dialogue transient headroom breach' }
  ]);

  // Dynamic Sample Rate & Bit Rate state
  const [currentSampleRate, setCurrentSampleRate] = useState<string>('48.0 kHz');
  const [currentBitRate, setCurrentBitRate] = useState<string>('320 kbps (32-bit Float)');

  useEffect(() => {
    const interval = setInterval(() => {
      const lVal = Math.floor(Math.random() * 35) + 50;
      const rVal = Math.floor(Math.random() * 35) + 52;
      setMeterLevels({
        l: lVal,
        r: rVal,
        lPeak: lVal > 80,
        rPeak: rVal > 82,
      });

      if (lVal > 81 || rVal > 81) {
        const now = new Date().toTimeString().split(' ')[0];
        const channel: 'L' | 'R' | 'C' = lVal > rVal ? 'L' : 'R';
        const peak = Number((((Math.max(lVal, rVal) - 80) / 10) * 0.8).toFixed(2));
        setDiagnosticLogs(prev => [
          {
            timestamp: now,
            channel,
            peakDb: peak,
            details: `LCR Master peak hit exceeded -0.1dBFS ceiling`
          },
          ...prev.slice(0, 49)
        ]);
      }
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const configTabs = [
    { id: 'player', label: 'Player Configuration', icon: Music },
    { id: 'dsp', label: 'Visual DSP Configuration', icon: Activity },
    { id: 'encoder', label: 'Encoder Configuration', icon: Cpu },
    { id: 'recorder', label: 'Recorder Configuration', icon: Radio },
    { id: 'export', label: 'Export Configuration', icon: Cloud },
    { id: 'system', label: 'System Settings', icon: Settings },
    { id: 'about', label: 'About App', icon: Info },
  ];

  return (
    <>
      {/* Header matching reference HTML designs precisely */}
      <header className="bg-[#111722] border-b border-[#1e293b] sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-lg">
        {/* Left: MENU button */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSettingsMenuOpen(true)}
            className="bg-[#1e293b] border border-[#334155] text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer hover:border-cyan-400 transition shadow-md"
            title="Open Settings & Import Menu"
          >
            <span className="text-cyan-400">≡</span> MENU
          </button>
        </div>

        {/* Center: Active View Title */}
        <div className="text-center font-display font-bold text-sm sm:text-base tracking-wider text-cyan-300">
          {getViewTitle()}
        </div>

        {/* Right: LIBRARY button, Profile icon, Battery icon */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <button 
            onClick={onOpenDriveModal}
            className="bg-[#1e293b] border border-[#334155] text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:border-cyan-400 transition hidden sm:inline-block"
          >
            LIBRARY
          </button>
          <span className="text-base text-slate-300 cursor-pointer" title="User Profile">👤</span>
          <span className="bg-[#166534] text-emerald-400 px-2 py-0.5 rounded text-[11px] font-mono border border-emerald-800" title="Battery Level">🔋</span>
        </div>
      </header>

      {/* Settings / Import Hidden Menu (Triggered by clicking the Guardians Tech Lab Logo) */}
      {settingsMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[540px] text-slate-100">
            
            {/* Left Sidebar Navigation (Icon + Name) */}
            <div className="w-full md:w-72 bg-slate-950 p-4 border-r border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 pb-4 mb-3 border-b border-slate-800">
                  <img src="/public/assets/aistudio/Untitled_design_9cc69ca3.png" alt="Logo" className="w-8 h-8 rounded-xl object-cover border border-cyan-500/40" />
                  <div>
                    <h3 className="h2-title text-white">Settings & Import</h3>
                    <p className="plain-text text-[9px] text-cyan-400">GTLab Control Suite</p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 font-mono text-xs">
                  {configTabs.map(tab => {
                    const IconComp = tab.icon;
                    const isActive = activeConfigTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveConfigTab(tab.id)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left cursor-pointer ${
                          isActive 
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-md' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
                        }`}
                      >
                        <IconComp className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[9px] font-mono text-slate-500 text-center">
                Guardians Tech Lab • v4.9 Pro
              </div>
            </div>

            {/* Right Main Panel Content */}
            <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto bg-slate-900">
              
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <h3 className="h1-title text-white uppercase tracking-wider">
                    {configTabs.find(t => t.id === activeConfigTab)?.label}
                  </h3>
                  <button 
                    onClick={() => setSettingsMenuOpen(false)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Tab specific content */}
                <div className="font-mono text-xs space-y-4">
                  {activeConfigTab === 'player' && (
                    <div className="space-y-3">
                      <p className="text-slate-300">Configure playback buffering, crossfade transitions, and audio hardware rendering pipelines.</p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400">Crossfade Duration</span>
                        <span className="text-cyan-300 font-bold">3.5 sec</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400">ReplayGain Normalization</span>
                        <span className="text-emerald-400 font-bold">Track Mode (-18 LUFS)</span>
                      </div>
                    </div>
                  )}

                  {activeConfigTab === 'dsp' && (
                    <div className="space-y-3">
                      <p className="text-slate-300">Manage real-time visualizer frame rates, FFT window sizes, and Lissajous vectorscope settings.</p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400">FFT Window Size</span>
                        <span className="text-cyan-300 font-bold">4096 Points</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400">Visual Refresh Rate</span>
                        <span className="text-emerald-400 font-bold">60 FPS Ultra</span>
                      </div>
                    </div>
                  )}

                  {activeConfigTab === 'encoder' && (
                    <div className="space-y-3">
                      <p className="text-slate-300">Set encoder bitrates, neural stem separation model weights, and container formats.</p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400">Active AI Model</span>
                        <span className="text-pink-400 font-bold">Demucs v4 Neural 11-Stem</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400">Target Bitrate</span>
                        <span className="text-cyan-300 font-bold">320 kbps CBR</span>
                      </div>
                    </div>
                  )}

                  {activeConfigTab === 'recorder' && (
                    <div className="space-y-3">
                      <p className="text-slate-300">Configure direct-to-disk multitrack recording and master summing cache locations.</p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400">Recording Format</span>
                        <span className="text-cyan-300 font-bold">WAV 32-bit Float</span>
                      </div>
                    </div>
                  )}

                  {activeConfigTab === 'export' && (
                    <div className="space-y-3">
                      <p className="text-slate-300">Set default stems export packaging, metadata tagging, and cloud upload directories.</p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400">Export Package</span>
                        <span className="text-cyan-300 font-bold">Multitrack ZIP + JSON Report</span>
                      </div>
                    </div>
                  )}

                  {activeConfigTab === 'system' && (
                    <div className="space-y-3">
                      <p className="text-slate-300">Manage hardware acceleration, audio thread priority, and heap memory allocation.</p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400">Audio Thread Priority</span>
                        <span className="text-emerald-400 font-bold">Real-time High</span>
                      </div>

                      {/* Diagnostic Log Viewer for LCR Master Peaks > -0.1dB */}
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">Diagnostic Log (LCR Master Peaks &gt; -0.1dB)</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setDiagnosticLogs([])}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded-lg transition cursor-pointer"
                            >
                              Clear Logs
                            </button>
                            <button 
                              onClick={() => {
                                const logText = diagnosticLogs.map(l => `[${l.timestamp}] CHANNEL ${l.channel} PEAK: +${l.peakDb} dBFS - ${l.details}`).join('\n');
                                const blob = new Blob([logText], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'gtlab_lcr_diagnostics.log';
                                a.click();
                              }}
                              className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] border border-cyan-500/40 rounded-lg transition cursor-pointer"
                            >
                              Download .log
                            </button>
                          </div>
                        </div>

                        <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 h-36 overflow-y-auto font-mono text-[11px] space-y-1.5">
                          {diagnosticLogs.length === 0 ? (
                            <div className="text-slate-500 italic text-center py-10">No peak hits over -0.1dB recorded yet. Monitoring active...</div>
                          ) : (
                            diagnosticLogs.map((log, idx) => (
                              <div key={idx} className="flex items-center justify-between text-slate-300 border-b border-slate-900 pb-1">
                                <span className="text-slate-500">[{log.timestamp}]</span>
                                <span className="text-cyan-400 font-bold">CH {log.channel}</span>
                                <span className="text-red-400 font-semibold">+{log.peakDb} dBFS</span>
                                <span className="text-slate-400 text-[10px]">{log.details}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeConfigTab === 'about' && (
                    <div className="space-y-3 font-roboto">
                      <h4 className="h2-title text-white">GTLab Hypertech Music Mixer & Player</h4>
                      <p className="plain-text text-slate-300 leading-relaxed">
                        Developed by <strong>Guardians Tech Lab</strong>. Professional AI audio workstation engineered for high-fidelity stem separation, 8-band parametric EQ, and mastering suite operations.
                      </p>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
                        Version 4.9 Neural Pro • Build 2026.11
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Right: "Save Current Settings & Configuration...?" with Yes and No buttons */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                <span className="text-amber-300 font-bold">Save Current Settings & Configuration...?</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setSettingsMenuOpen(false); showToast('Settings & configuration saved successfully.'); }}
                    className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl hover:brightness-110 shadow-lg cursor-pointer"
                  >
                    Yes
                  </button>
                  <button 
                    onClick={() => setSettingsMenuOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700 cursor-pointer"
                  >
                    No
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <aside className="fixed bottom-20 right-6 px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-400 text-cyan-300 font-mono text-xs shadow-glow-cyan flex items-center gap-2.5 z-50 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </aside>
      )}
    </>
  );
};
