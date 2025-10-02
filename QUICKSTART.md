# Egyptian Code GAA - Quick Start Guide

## 🚀 Getting Started (3 Ways)

### Option 1: Simple Drop-In Component (Easiest)

Just import and use the component - that's it!

```tsx
import { EgyptianCodeGAA } from '@gaa/core';

function App() {
  return <EgyptianCodeGAA theme="dark" showControls={true} />;
}
```

**That's literally all you need!** The component includes:
- Welcome screen with journey overview
- All 13 chapters with auto-progression
- Playback controls (play/pause/stop/skip)
- Volume control
- Chapter navigation
- Info panels
- Sacred geometry visuals
- Audio engine

### Option 2: With Custom Logic

Use the hook for more control:

```tsx
import { useEgyptianCode, EgyptianVisuals } from '@gaa/core';

function MyJourney() {
  const egyptianCode = useEgyptianCode();

  return (
    <div>
      {/* Your custom UI */}
      <button onClick={() => egyptianCode.start()}>
        Begin Journey
      </button>

      {egyptianCode.state.isPlaying && (
        <div>
          <h2>{egyptianCode.state.currentChapter?.chapter}</h2>
          <p>{egyptianCode.state.currentChapter?.description}</p>

          <progress
            value={egyptianCode.state.progress}
            max={1}
          />

          <button onClick={() => egyptianCode.pause()}>Pause</button>
          <button onClick={() => egyptianCode.stop()}>Stop</button>
        </div>
      )}

      {/* Optional: Add visuals */}
      {egyptianCode.state.currentChapter && (
        <EgyptianVisuals
          chapter={egyptianCode.state.currentChapter}
          progress={egyptianCode.state.progress}
          isPlaying={egyptianCode.state.isPlaying}
          intensity={egyptianCode.state.intensity}
        />
      )}
    </div>
  );
}
```

### Option 3: Low-Level Audio Control

Direct audio engine access for advanced use:

```tsx
import {
  EgyptianAudioEngine,
  EGYPTIAN_CODE_CHAPTERS
} from '@gaa/core';

async function playSpecificChapter() {
  // Initialize engine
  const engine = new EgyptianAudioEngine();
  await engine.initialize();

  // Play chapter 7 (Crown of Osiris)
  const chapter = EGYPTIAN_CODE_CHAPTERS[6]; // 0-indexed
  await engine.playChapter(chapter, 0.7); // 70% intensity

  // Get spectrum data for visualizations
  const spectrum = engine.getSpectrumData();
  console.log('Audio energy:', spectrum);

  // Stop when done
  setTimeout(() => {
    engine.stop();
    engine.destroy();
  }, chapter.duration * 1000);
}
```

## 🎮 Controls

### Mouse/Touch
- **Play/Pause Button**: Start or pause the journey
- **Stop Button**: End and reset to beginning
- **Skip Forward Button**: Jump to next chapter
- **Volume Slider**: Adjust intensity (0-100%)
- **Chapter List Button**: View and jump to any chapter
- **Info Button**: See current audio/visual parameters

### Keyboard Shortcuts
- **Space**: Play/Pause
- **Escape**: Stop
- **→ (Right Arrow)**: Next chapter
- **↑ (Up Arrow)**: Increase intensity
- **↓ (Down Arrow)**: Decrease intensity
- **C**: Toggle chapter list
- **I**: Toggle info panel

## 📊 Available Data

The `useEgyptianCode()` hook provides:

```tsx
const {
  state: {
    currentChapter,      // Current chapter object
    chapterIndex,        // 0-12
    isPlaying,           // true/false
    isPaused,            // true/false
    progress,            // 0-1 (chapter progress)
    elapsedTime,         // seconds since start
    totalDuration,       // 2220 seconds (37 min)
    intensity,           // 0-1 (volume)
  },
  chapters,              // All 13 chapters array
  start,                 // Begin journey
  stop,                  // Stop and reset
  pause,                 // Pause current
  resume,                // Resume from pause
  skipToChapter,         // Jump to index
  setIntensity,          // Set volume
  getSpectrumData,       // Audio analysis
} = useEgyptianCode();
```

## 🎼 The 13 Chapters

| # | Chapter | Duration | Key Frequency | Geometry |
|---|---------|----------|---------------|----------|
| 1 | Seal of Remembrance | 2 min | 256+432 Hz | Circles |
| 2 | Breath of Thoth | 3 min | 136.1 Hz | Spiral |
| 3 | Solar Heart | 2.5 min | 528 Hz | Sunburst |
| 4 | Soundless Word | 1.5 min | 64+963 Hz | Void |
| 5 | Temple of Light | 3 min | 256-512 Hz | Pyramid |
| 6 | Mirror of Isis | 2.5 min | 888+432 Hz | Vesica |
| 7 | Crown of Osiris | 3.3 min | 128-768 Hz | Crown |
| 8 | Ladder of Thoth | 2.5 min | Steps | Ladder |
| 9 | Scales of Ma'at | 2 min | 432 vs 444 | Scales |
| 10 | Throne of Horus | 3 min | 720+40 Hz | Eye |
| 11 | Solar Body of Ra | 3.3 min | Harmonic | Sphere |
| 12 | Solar Boat | 3 min | 333 Hz | Boat |
| 13 | Mirror Return | 4 min | 999 Hz | Circle |

**Total: 37 minutes**

## 🎨 Customization Options

```tsx
<EgyptianCodeGAA
  theme="dark"           // "dark" or "light"
  showControls={true}    // Show/hide UI controls
  autoStart={false}      // Auto-begin on mount
/>
```

## 💾 Progress Tracking (Optional)

Track user progress in Supabase:

```tsx
import { supabase } from './lib/supabase';

// When chapter completes
async function logProgress(userId, chapterId, chapterIndex) {
  await supabase.from('egyptian_code_progress').insert({
    user_id: userId,
    chapter_id: chapterId,
    chapter_index: chapterIndex,
    completed_at: new Date().toISOString(),
  });
}

// Get user's completion status
async function getProgress(userId) {
  const { data } = await supabase
    .from('egyptian_code_progress')
    .select('chapter_index')
    .eq('user_id', userId)
    .not('completed_at', 'is', null);

  const completed = new Set(data?.map(d => d.chapter_index));
  return {
    completed: Array.from(completed),
    remaining: 13 - completed.size,
    percentage: (completed.size / 13) * 100,
  };
}
```

## 🔧 Troubleshooting

### No Audio?
```tsx
// Make sure audio context is resumed (browser autoplay policy)
const egyptianCode = useEgyptianCode();

// User interaction required before audio
<button onClick={() => egyptianCode.start()}>
  Start Journey
</button>
```

### Visuals Not Showing?
- Check that WebGL is supported: `chrome://gpu`
- Try disabling hardware acceleration if issues persist

### Can't Skip Chapters?
```tsx
// Skip to chapter 7 (Crown of Osiris)
egyptianCode.skipToChapter(6); // 0-indexed
```

### Want to Start at Specific Chapter?
```tsx
useEffect(() => {
  // Start at chapter 5 (Temple of Light)
  egyptianCode.skipToChapter(4);
}, []);
```

## 🌟 Best Practices

### For Meditation/Wellness Apps
```tsx
function MeditationSession() {
  const [showEgyptian, setShowEgyptian] = useState(false);

  return (
    <div>
      <h1>Choose Your Journey</h1>
      <button onClick={() => setShowEgyptian(true)}>
        Egyptian Code Initiation (37 min)
      </button>

      {showEgyptian && (
        <EgyptianCodeGAA
          theme="dark"
          autoStart={true} // Start immediately
        />
      )}
    </div>
  );
}
```

### For Group Sessions
```tsx
import { EgyptianCodeGAA, usePrecisionSync } from '@gaa/core';

function CollectiveJourney() {
  const precisionSync = usePrecisionSync({
    userId: 'user-123',
    circleId: 'meditation-group-1'
  });

  // Initialize clock sync first
  useEffect(() => {
    precisionSync.initializeClockSync();
  }, []);

  return (
    <div>
      <h2>Collective Egyptian Journey</h2>
      <p>Synced with {precisionSync.state.participantCount} others</p>

      <EgyptianCodeGAA theme="dark" />
    </div>
  );
}
```

### For Educational Apps
```tsx
function LearningMode() {
  const egyptianCode = useEgyptianCode();

  return (
    <div>
      {egyptianCode.state.currentChapter && (
        <div className="education-panel">
          <h2>{egyptianCode.state.currentChapter.chapter}</h2>

          <div className="learn-section">
            <h3>Frequency Info</h3>
            <p>Base: {egyptianCode.state.currentChapter.audio.base} Hz</p>
            <p>Purpose: Heart chakra activation</p>
          </div>

          <div className="learn-section">
            <h3>Geometry Meaning</h3>
            <p>{egyptianCode.state.currentChapter.visual.description}</p>
          </div>

          <div className="learn-section">
            <h3>Breath Pattern</h3>
            <p>{egyptianCode.state.currentChapter.breath.pattern}</p>
          </div>
        </div>
      )}

      <EgyptianCodeGAA theme="light" />
    </div>
  );
}
```

## 📱 Mobile Considerations

Works great on mobile! Just ensure:

```tsx
// Add viewport meta tag in index.html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

// Fullscreen mode for immersive experience
function MobileJourney() {
  const goFullscreen = () => {
    document.documentElement.requestFullscreen();
  };

  return (
    <button onClick={goFullscreen}>
      Enter Fullscreen Journey
    </button>
  );
}
```

## 🎯 Common Use Cases

### Wellness Center Kiosk
```tsx
<EgyptianCodeGAA
  theme="dark"
  showControls={true}
  autoStart={false}
/>
// That's it! Full kiosk-ready experience.
```

### Personal Meditation App
```tsx
function MyMeditationApp() {
  const [selectedJourney, setSelectedJourney] = useState(null);

  return (
    <div>
      <nav>
        <button onClick={() => setSelectedJourney('egyptian')}>
          Egyptian Initiation
        </button>
        <button onClick={() => setSelectedJourney('quick')}>
          Quick Session
        </button>
      </nav>

      {selectedJourney === 'egyptian' && (
        <EgyptianCodeGAA theme="dark" />
      )}
    </div>
  );
}
```

### Breathwork Class
```tsx
function BreathworkSession() {
  const egyptianCode = useEgyptianCode();

  return (
    <div>
      <h1>Guided Breathwork</h1>

      {egyptianCode.state.currentChapter && (
        <div className="breath-guide">
          <h2>Current Pattern</h2>
          <p>{egyptianCode.state.currentChapter.breath.pattern}</p>
          <p>Pace: {egyptianCode.state.currentChapter.breath.bpm} breaths/min</p>
        </div>
      )}

      <EgyptianCodeGAA theme="dark" />
    </div>
  );
}
```

## 📚 Next Steps

1. **Try It Out**: Start with the simple drop-in component
2. **Explore Chapters**: Use the chapter list to preview different activations
3. **Customize**: Adjust theme, controls, and intensity to your preference
4. **Track Progress**: Add database tracking for user journeys
5. **Go Collective**: Integrate Precision Sync for group sessions

## 🆘 Need Help?

Check these files:
- `EGYPTIAN_CODE_GUIDE.md` - Full technical documentation
- `EGYPTIAN_CODE_SUMMARY.md` - Implementation details
- `PRECISION_SYNC_GUIDE.md` - For collective sync features

## ⚠️ Important Notes

- **Headphone Recommended**: Binaural effects require stereo
- **Quiet Environment**: Best experienced without distractions
- **Browser Autoplay**: User interaction required before audio starts
- **WebGL Required**: Modern browser with GPU acceleration
- **Wellness Tool**: Not a medical device, for wellness purposes only

---

**Ready to begin your journey?**

```tsx
import { EgyptianCodeGAA } from '@gaa/core';

<EgyptianCodeGAA theme="dark" showControls={true} />
```

**That's it! Press play and let the ancient wisdom guide you.** 🔮✨
