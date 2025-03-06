// Simple sound manager without React hooks
class SoundManager {
  private jumpSound: HTMLAudioElement | null = null;
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (this.initialized) return;
    
    try {
      // Create audio elements
      this.jumpSound = new Audio('/sounds/jump.mp3');
      
      // Configure audio elements
      if (this.jumpSound) {
        this.jumpSound.volume = 0.5;
        // Preload the sound
        this.jumpSound.load();
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing sounds:', error);
    }
  }

  public playJumpSound(): void {
    if (!this.jumpSound) return;
    
    try {
      // Clone the audio to allow overlapping sounds
      const sound = this.jumpSound.cloneNode() as HTMLAudioElement;
      sound.volume = 0.5;
      sound.play().catch(error => {
        // Handle any autoplay restrictions
        console.log('Error playing jump sound:', error);
      });
    } catch (error) {
      console.error('Error playing jump sound:', error);
    }
  }
}

// Create a singleton instance
const soundManager = new SoundManager();

// Export the sound manager
export const getSounds = () => soundManager; 