import { Audio } from 'expo-av';
import { useSettingsStore } from '../store';

// Sound objects - loaded once and reused
let hintSound: Audio.Sound | null = null;
let winSound: Audio.Sound | null = null;
let soundsLoaded = false;

// Sound file references
const SOUND_FILES = {
  hint: require('../assets/sounds/hint.mp3'),
  win: require('../assets/sounds/win.mp3'),
};

/**
 * Load sounds at app startup
 */
export async function loadSounds(): Promise<void> {
  if (soundsLoaded) return;

  try {
    // Configure audio mode
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true, // Play even when phone is on silent
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    // Load hint sound (owl hoo)
    const { sound: hint } = await Audio.Sound.createAsync(
      SOUND_FILES.hint,
      { volume: 0.5 }
    );
    hintSound = hint;

    // Load win sound (celebratory hoo-hoo)
    const { sound: win } = await Audio.Sound.createAsync(
      SOUND_FILES.win,
      { volume: 0.6 }
    );
    winSound = win;

    soundsLoaded = true;
    console.log('Sounds loaded successfully');
  } catch (error) {
    console.log('Could not load sounds:', error);
    // Sounds are optional - app works without them
  }
}

/**
 * Unload sounds when app closes
 */
export async function unloadSounds(): Promise<void> {
  if (hintSound) {
    await hintSound.unloadAsync();
    hintSound = null;
  }
  if (winSound) {
    await winSound.unloadAsync();
    winSound = null;
  }
  soundsLoaded = false;
}

/**
 * Check if sounds are enabled via settings
 */
function areSoundsEnabled(): boolean {
  return useSettingsStore.getState().soundEnabled;
}

/**
 * Play the hint sound (wise owl)
 */
export async function playHintSound(): Promise<void> {
  if (!areSoundsEnabled() || !hintSound) {
    console.log('Hint sound skipped - enabled:', areSoundsEnabled(), 'loaded:', !!hintSound);
    return;
  }

  try {
    // Reset to beginning and play
    await hintSound.setPositionAsync(0);
    await hintSound.playAsync();
  } catch (error) {
    console.log('Could not play hint sound:', error);
  }
}

/**
 * Play the win sound (celebration)
 */
export async function playWinSound(): Promise<void> {
  if (!areSoundsEnabled() || !winSound) {
    console.log('Win sound skipped - enabled:', areSoundsEnabled(), 'loaded:', !!winSound);
    return;
  }

  try {
    // Reset to beginning and play
    await winSound.setPositionAsync(0);
    await winSound.playAsync();
  } catch (error) {
    console.log('Could not play win sound:', error);
  }
}
