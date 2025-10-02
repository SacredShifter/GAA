import React, { useState } from 'react';
import { Play, Pause, Square, SkipForward, Volume2, Eye, BookOpen } from 'lucide-react';
import { EgyptianVisuals } from './EgyptianVisuals';
import { useEgyptianCode } from '../hooks/useEgyptianCode';
import { EGYPTIAN_CODE_CHAPTERS } from '../utils/egyptianCodeFrequencies';

export interface EgyptianCodeGAAProps {
  theme?: 'dark' | 'light';
  showControls?: boolean;
  autoStart?: boolean;
}

export const EgyptianCodeGAA: React.FC<EgyptianCodeGAAProps> = ({
  theme = 'dark',
  showControls = true,
  autoStart = false,
}) => {
  const egyptianCode = useEgyptianCode();
  const [showChapterList, setShowChapterList] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const bgClass = theme === 'dark' ? 'bg-slate-900/95' : 'bg-white/95';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const secondaryTextClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const borderClass = theme === 'dark' ? 'border-amber-500/30' : 'border-amber-500/50';

  React.useEffect(() => {
    if (autoStart) {
      egyptianCode.start();
    }
  }, [autoStart]);

  const handlePlayPause = () => {
    if (egyptianCode.state.isPlaying) {
      egyptianCode.pause();
    } else if (egyptianCode.state.isPaused) {
      egyptianCode.resume();
    } else {
      egyptianCode.start();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{ backgroundColor: theme === 'dark' ? '#0a0a0f' : '#ffffff' }}
    >
      {egyptianCode.state.currentChapter && (
        <EgyptianVisuals
          chapter={egyptianCode.state.currentChapter}
          progress={egyptianCode.state.progress}
          isPlaying={egyptianCode.state.isPlaying}
          intensity={egyptianCode.state.intensity}
        />
      )}

      {!egyptianCode.state.isPlaying && !egyptianCode.state.isPaused && (
        <div className="fixed inset-0 flex items-center justify-center z-10 bg-black/50 backdrop-blur-sm">
          <div className={`${bgClass} backdrop-blur-lg rounded-2xl border ${borderClass} shadow-2xl p-12 max-w-2xl mx-4 text-center`}>
            <Eye className="w-16 h-16 mx-auto mb-6 text-amber-400" />
            <h1 className={`text-4xl font-bold ${textClass} mb-4`}>
              Egyptian Code of Initiation
            </h1>
            <p className={`text-lg ${secondaryTextClass} mb-8`}>
              A journey through 13 sacred activations
            </p>
            <div className={`${secondaryTextClass} text-sm mb-8 text-left max-w-md mx-auto space-y-2`}>
              <p>• Duration: {formatTime(egyptianCode.state.totalDuration)}</p>
              <p>• 13 activation chapters</p>
              <p>• Geometric audio alignment</p>
              <p>• Breath-synchronized frequencies</p>
              <p>• Sacred geometry visuals</p>
            </div>
            <button
              onClick={() => egyptianCode.start()}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors text-lg flex items-center gap-3 mx-auto"
            >
              <Play className="w-6 h-6" />
              Begin Journey
            </button>
          </div>
        </div>
      )}

      {showControls && (egyptianCode.state.isPlaying || egyptianCode.state.isPaused) && (
        <>
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 ${bgClass} backdrop-blur-lg rounded-xl border ${borderClass} shadow-2xl px-6 py-4 z-50`}>
            <div className="text-center">
              {egyptianCode.state.currentChapter && (
                <>
                  <div className={`text-sm ${secondaryTextClass} mb-1`}>
                    Chapter {egyptianCode.state.chapterIndex + 1} of {EGYPTIAN_CODE_CHAPTERS.length}
                  </div>
                  <div className={`text-xl font-bold ${textClass} mb-2`}>
                    {egyptianCode.state.currentChapter.chapter}
                  </div>
                  <div className={`text-xs ${secondaryTextClass} italic mb-3`}>
                    {egyptianCode.state.currentChapter.description}
                  </div>
                  <div className="w-64 h-2 bg-black/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
                      style={{ width: `${egyptianCode.state.progress * 100}%` }}
                    />
                  </div>
                  <div className={`text-xs ${secondaryTextClass} mt-1`}>
                    {formatTime(egyptianCode.state.elapsedTime)} / {formatTime(egyptianCode.state.totalDuration)}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 ${bgClass} backdrop-blur-lg rounded-xl border ${borderClass} shadow-2xl p-4 z-50`}>
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayPause}
                className="p-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                title={egyptianCode.state.isPlaying ? 'Pause' : 'Play'}
              >
                {egyptianCode.state.isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={() => egyptianCode.stop()}
                className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                title="Stop"
              >
                <Square className="w-6 h-6" />
              </button>

              <button
                onClick={() => {
                  const nextIndex = egyptianCode.state.chapterIndex + 1;
                  if (nextIndex < EGYPTIAN_CODE_CHAPTERS.length) {
                    egyptianCode.skipToChapter(nextIndex);
                  }
                }}
                className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                title="Next Chapter"
              >
                <SkipForward className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-2 px-4">
                <Volume2 className={`w-5 h-5 ${secondaryTextClass}`} />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={egyptianCode.state.intensity}
                  onChange={(e) => egyptianCode.setIntensity(Number(e.target.value))}
                  className="w-32"
                  title="Intensity"
                />
                <span className={`text-sm ${secondaryTextClass} w-12`}>
                  {Math.round(egyptianCode.state.intensity * 100)}%
                </span>
              </div>

              <button
                onClick={() => setShowChapterList(!showChapterList)}
                className={`p-3 ${showChapterList ? 'bg-amber-500' : 'bg-slate-700'} hover:bg-amber-600 text-white rounded-lg transition-colors`}
                title="Chapters"
              >
                <BookOpen className="w-6 h-6" />
              </button>

              <button
                onClick={() => setShowInfo(!showInfo)}
                className={`p-3 ${showInfo ? 'bg-amber-500' : 'bg-slate-700'} hover:bg-amber-600 text-white rounded-lg transition-colors`}
                title="Info"
              >
                <Eye className="w-6 h-6" />
              </button>
            </div>
          </div>

          {showChapterList && (
            <div className={`fixed right-6 top-1/2 -translate-y-1/2 ${bgClass} backdrop-blur-lg rounded-xl border ${borderClass} shadow-2xl p-4 z-50 max-w-sm max-h-[80vh] overflow-y-auto`}>
              <h3 className={`text-lg font-bold ${textClass} mb-4`}>Chapters</h3>
              <div className="space-y-2">
                {EGYPTIAN_CODE_CHAPTERS.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => {
                      egyptianCode.skipToChapter(index);
                      setShowChapterList(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      index === egyptianCode.state.chapterIndex
                        ? 'bg-amber-500 text-white'
                        : `hover:bg-white/10 ${textClass}`
                    }`}
                  >
                    <div className="font-semibold text-sm">{index + 1}. {chapter.chapter}</div>
                    <div className={`text-xs ${index === egyptianCode.state.chapterIndex ? 'text-white/80' : secondaryTextClass}`}>
                      {chapter.description}
                    </div>
                    <div className={`text-xs ${index === egyptianCode.state.chapterIndex ? 'text-white/60' : secondaryTextClass} mt-1`}>
                      {formatTime(chapter.duration)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showInfo && egyptianCode.state.currentChapter && (
            <div className={`fixed left-6 top-1/2 -translate-y-1/2 ${bgClass} backdrop-blur-lg rounded-xl border ${borderClass} shadow-2xl p-6 z-50 max-w-md`}>
              <h3 className={`text-lg font-bold ${textClass} mb-3`}>Current Activation</h3>
              <div className="space-y-3">
                <div>
                  <div className={`text-sm font-semibold ${secondaryTextClass} mb-1`}>Audio Configuration</div>
                  <div className={`text-xs ${textClass} bg-black/20 p-2 rounded`}>
                    {egyptianCode.state.currentChapter.audio.base && (
                      <div>Base: {egyptianCode.state.currentChapter.audio.base} Hz</div>
                    )}
                    {egyptianCode.state.currentChapter.audio.overlay && (
                      <div>Overlay: {egyptianCode.state.currentChapter.audio.overlay} Hz</div>
                    )}
                    {egyptianCode.state.currentChapter.audio.stack && (
                      <div>Stack: {egyptianCode.state.currentChapter.audio.stack.join(', ')} Hz</div>
                    )}
                    {egyptianCode.state.currentChapter.audio.chant && (
                      <div>Chant: {egyptianCode.state.currentChapter.audio.chant}</div>
                    )}
                  </div>
                </div>

                <div>
                  <div className={`text-sm font-semibold ${secondaryTextClass} mb-1`}>Geometry</div>
                  <div className={`text-xs ${textClass} bg-black/20 p-2 rounded`}>
                    {egyptianCode.state.currentChapter.visual.geometry}
                  </div>
                </div>

                <div>
                  <div className={`text-sm font-semibold ${secondaryTextClass} mb-1`}>Breath Pattern</div>
                  <div className={`text-xs ${textClass} bg-black/20 p-2 rounded`}>
                    {egyptianCode.state.currentChapter.breath.pattern}
                    {egyptianCode.state.currentChapter.breath.bpm && (
                      <span> ({egyptianCode.state.currentChapter.breath.bpm} BPM)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
