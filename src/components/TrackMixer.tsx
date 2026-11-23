import React, { useState } from 'react';
import { Track, AudioStem, ParametricEqBand, FxChannel, LimiterSettings } from '../types';
import { Sliders, Wand2, ShieldAlert, Volume2, Mic, Disc, Radio, Guitar, Piano, Wind, Music, Sparkles, RefreshCw, Activity, Gauge } from 'lucide-react';
import { ParametricEqModal } from './ParametricEqModal';
import { FxChainModal } from './FxChainModal';
import { LimiterModal } from './LimiterModal';
import { analyzeTrackWithGemini } from '../services/geminiService';
import { SpectrumVisualizer } from './SpectrumVisualizer';

interface Props {
  track: Track;
  onUpdateTrack: (updatedTrack: Track) => void;
}

export const TrackMixer: React.FC<Props> = ({ track, onUpdateTrack }) => {
  const [selectedStemForEq, setSelectedStemForEq] = useState<AudioStem | null>(null);
  const [selectedStemForGain, setSelectedStemForGain] = useState<AudioStem | null>(null);
  const [selectedStemForFx, setSelectedStemForFx] = useState<AudioStem | null>(null);
  const [selectedStemForCompGate, setSelectedStemForCompGate] = useState<AudioStem | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(track.aiInsights || null);

  const handleGainChange = (stemId: string, gain: number) => {
    const updatedStems = track.stems.map(s => s.id === stemId ? { ...s, gain } : s);
    onUpdateTrack({ ...track, stems: updatedStems });
  };

  const handlePanChange = (stemId: string, pan: number) => {
    const updatedStems = track.stems.map(s => s.id === stemId ? { ...s, pan } : s);
    onUpdateTrack({ ...track, stems: updatedStems });
  };

  const handleMuteToggle = (stemId: string) => {
    const updatedStems = track.stems.map(s => s.id === stemId ? { ...s, muted: !s.muted } : s);
    onUpdateTrack({ ...track, stems: updatedStems });
  };

  const handleSoloToggle = (stemId: string) => {
    const updatedStems = track.stems.map(s => s.id === stemId ? { ...s, solo: !s.solo } : s);
    onUpdateTrack({ ...track, stems: updatedStems });
  };

  const handleUpdateEq = (stemId: string, bands: ParametricEqBand[]) => {
    const updatedStems = track.stems.map(s => s.id === stemId ? { ...s, eqBands: bands } : s);
    onUpdateTrack({ ...track, stems: updatedStems });
    if (selectedStemForEq) {
      setSelectedStemForEq({ ...selectedStemForEq, eqBands: bands });
    }
  };

  const handleUpdateFx = (stemId: string, fx1: FxChannel, fx2: FxChannel) => {
    const updatedStems = track.stems.map(s => s.id === stemId ? { ...s, fxChannel1: fx1, fxChannel2: fx2 } : s);
    onUpdateTrack({ ...track, stems: updatedStems });
    if (selectedStemForFx) {
      setSelectedStemForFx({ ...selectedStemForFx, fxChannel1: fx1, fxChannel2: fx2 });
    }
  };

  const handleUpdateLimiter = (stemId: string, limiter: LimiterSettings) => {
    const updatedStems = track.stems.map(s => s.id === stemId ? { ...s, limiter } : s);
    onUpdateTrack({ ...track, stems: updatedStems });
    if (selectedStemForCompGate) {
      setSelectedStemForCompGate({ ...selectedStemForCompGate, limiter });
    }
  };

  const handleRunAiMastering = async () => {
    setIsAnalyzing(true);
    const result = await analyzeTrackWithGemini(track);
    setIsAnalyzing(false);
    setAiMessage(result.aiInsights);

    const updatedStems = track.stems.map(stem => {
      const match = result.suggestedStemGains.find(s => s.stemName.toLowerCase() === stem.name.toLowerCase());
      if (match) {
        return { ...stem, gain: match.suggestedGain };
      }
      return stem;
    });

    onUpdateTrack({
      ...track,
      aiAnalyzed: true,
      aiGenre: result.genre,
      aiMood: result.mood,
      aiBpm: result.bpm,
      aiKey: result.key,
      aiInsights: result.aiInsights,
      stems: updatedStems
    });
  };

  const getStemIcon = (type: string) => {
    switch (type) {
      case 'vocal_noises': return <Mic className="w-5 h-5" />;
      case 'drums': return <Disc className="w-5 h-5" />;
      case 'bass': return <Radio className="w-5 h-5" />;
      case 'guitar': 
      case 'acoustic_guitar':
      case 'electric_guitar': return <Guitar className="w-5 h-5" />;
      case 'keyboard':
      case 'synthesizer': return <Piano className="w-5 h-5" />;
      case 'flute':
      case 'wind': return <Wind className="w-5 h-5" />;
      default: return <Music className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-28 animate-fadeIn">
      
      {/* Real-time Spectrum Visualizer */}
      <SpectrumVisualizer isPlaying={true} />

      {/* Top Banner & AI Inspector */}
      <div className="glass-panel cyber-border-gradient rounded-2xl p-6 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img src={track.coverUrl} alt={track.title} className="w-16 h-16 rounded-2xl object-cover shadow-lg border border-slate-700" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 bg-cyan-500/20 text-[#00f2fe] border border-cyan-500/30 text-xs font-semibold rounded-full flex items-center gap-1 font-mono">
                <Sparkles className="w-3.5 h-3.5" /> Mix Pad Multi-Track Console
              </span>
              <span className="text-xs font-mono text-slate-400">{track.aiBpm || 128} BPM • {track.aiKey || 'A Minor'}</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-extrabold text-white font-display">{track.title}</h2>
            <p className="text-xs text-slate-400">{track.artist} • <span className="text-[#00f2fe]">{track.aiGenre || 'AI Multi-Track Studio'}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunAiMastering}
            disabled={isAnalyzing}
            className="px-5 py-3 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-glow-cyan transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing Stems with Gemini AI...' : 'Run AI Stem Auto-Master'}
          </button>
        </div>
      </div>

      {aiMessage && (
        <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-4 text-xs text-cyan-200 flex items-start gap-3 backdrop-blur-md">
          <Sparkles className="w-5 h-5 text-[#00f2fe] shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block mb-0.5 font-display">Gemini AI Studio Mixing Critique:</strong>
            {aiMessage}
          </div>
        </div>
      )}

      {/* 11 Track Stem Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {track.stems.map((stem) => {
          const isMuted = stem.muted;
          const isSolo = stem.solo;

          return (
            <div 
              key={stem.id}
              className={`glass-panel rounded-2xl p-5 shadow-xl transition-all space-y-4 ${
                isMuted ? 'opacity-50 border-rose-500/30' : isSolo ? 'border-amber-500/80 shadow-[0_0_20px_rgba(251,191,36,0.15)]' : 'border-white/10 hover:border-cyan-500/40'
              }`}
            >
              {/* Stem Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: stem.color }}>
                    {getStemIcon(stem.type)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-display">{stem.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{stem.label}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleMuteToggle(stem.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isMuted ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
                    }`}
                  >
                    M
                  </button>
                  <button
                    onClick={() => handleSoloToggle(stem.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isSolo ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
                    }`}
                  >
                    S
                  </button>
                </div>
              </div>

              {/* Gain & Volume Control Box */}
              <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Gain Volume</span>
                  <span className="text-[#00f2fe] font-bold">{stem.gain > 0 ? `+${stem.gain}` : stem.gain} dB</span>
                </div>
                <input
                  type="range"
                  min="-24"
                  max="12"
                  step="0.5"
                  value={stem.gain}
                  onChange={(e) => handleGainChange(stem.id, Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />

                {/* Animated VU Meter */}
                <div className="flex items-center gap-1 pt-1">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 via-[#00f2fe] to-pink-500 transition-all duration-150"
                      style={{ width: isMuted ? '0%' : `${Math.max(12, Math.min(100, (stem.gain + 24) * 2.7))}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">VU</span>
                </div>
              </div>

              {/* 4 Required Action Buttons: 32-band EQ + PEQ, Gain Control, Comp/Gate, FX */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* 1. 32-band EQ + PEQ */}
                <button
                  onClick={() => setSelectedStemForEq(stem)}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-slate-900/90 hover:bg-cyan-500/15 border border-white/10 hover:border-[#00f2fe]/40 text-slate-300 hover:text-[#00f2fe] text-xs font-mono font-semibold rounded-xl transition-all shadow-sm cursor-pointer group"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#00f2fe] group-hover:scale-110 transition-transform" /> 
                  <span>EQ / PEQ</span>
                </button>

                {/* 2. Gain Control */}
                <button
                  onClick={() => setSelectedStemForGain(stem)}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-slate-900/90 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 text-xs font-mono font-semibold rounded-xl transition-all shadow-sm cursor-pointer group"
                >
                  <Gauge className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" /> 
                  <span>Gain Ctrl</span>
                </button>

                {/* 3. Comp/Gate */}
                <button
                  onClick={() => setSelectedStemForCompGate(stem)}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-slate-900/90 hover:bg-purple-500/15 border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-purple-300 text-xs font-mono font-semibold rounded-xl transition-all shadow-sm cursor-pointer group"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" /> 
                  <span>Comp/Gate</span>
                </button>

                {/* 4. FX (Multi Channel) */}
                <button
                  onClick={() => setSelectedStemForFx(stem)}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-slate-900/90 hover:bg-pink-500/15 border border-white/10 hover:border-pink-500/40 text-slate-300 hover:text-pink-300 text-xs font-mono font-semibold rounded-xl transition-all shadow-sm cursor-pointer group"
                >
                  <Wand2 className="w-3.5 h-3.5 text-pink-400 group-hover:scale-110 transition-transform" /> 
                  <span>FX Multi</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modals for Customizing Parameters */}
      {selectedStemForEq && (
        <ParametricEqModal
          stem={selectedStemForEq}
          isOpen={!!selectedStemForEq}
          onClose={() => setSelectedStemForEq(null)}
          onUpdate={(bands) => handleUpdateEq(selectedStemForEq.id, bands)}
        />
      )}

      {selectedStemForGain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: selectedStemForGain.color }}>
                  <Gauge className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display">Gain & Pan Control</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedStemForGain.name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStemForGain(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Gain Boost / Cut</span>
                  <span className="text-[#00f2fe] font-bold">{selectedStemForGain.gain} dB</span>
                </div>
                <input
                  type="range" min="-24" max="12" step="0.5"
                  value={selectedStemForGain.gain}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    handleGainChange(selectedStemForGain.id, val);
                    setSelectedStemForGain({ ...selectedStemForGain, gain: val });
                  }}
                  className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2"
                />
              </div>

              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Stereo Panning</span>
                  <span className="text-pink-400 font-bold">{selectedStemForGain.pan}</span>
                </div>
                <input
                  type="range" min="-100" max="100" step="1"
                  value={selectedStemForGain.pan}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    handlePanChange(selectedStemForGain.id, val);
                    setSelectedStemForGain({ ...selectedStemForGain, pan: val });
                  }}
                  className="w-full accent-pink-500 bg-slate-800 rounded-lg h-2"
                />
                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                  <span>Left (100)</span>
                  <span>Center (0)</span>
                  <span>Right (100)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedStemForGain(null)}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-glow-cyan cursor-pointer"
            >
              Apply & Close
            </button>
          </div>
        </div>
      )}

      {selectedStemForFx && (
        <FxChainModal
          stem={selectedStemForFx}
          isOpen={!!selectedStemForFx}
          onClose={() => setSelectedStemForFx(null)}
          onUpdate={(fx1, fx2) => handleUpdateFx(selectedStemForFx.id, fx1, fx2)}
        />
      )}

      {selectedStemForCompGate && (
        <LimiterModal
          stem={selectedStemForCompGate}
          isOpen={!!selectedStemForCompGate}
          onClose={() => setSelectedStemForCompGate(null)}
          onUpdate={(limiter) => handleUpdateLimiter(selectedStemForCompGate.id, limiter)}
        />
      )}

    </div>
  );
};
