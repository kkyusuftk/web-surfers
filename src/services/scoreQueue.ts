import { ScoreSubmission } from './types';

interface QueuedScore extends ScoreSubmission {
    timestamp: number;
    attempts: number;
}

export class ScoreQueue {
    private static instance: ScoreQueue;
    private queue: QueuedScore[] = [];
    private isProcessing = false;
    private readonly MAX_ATTEMPTS = 3;
    private readonly PROCESS_INTERVAL = 60000; // 1 minute

    private constructor() {
        this.loadFromStorage();
        
        // Process queue periodically
        setInterval(() => this.processQueue(), this.PROCESS_INTERVAL);
        
        // Save queue before page unload
        window.addEventListener('beforeunload', () => this.saveToStorage());
    }

    static getInstance(): ScoreQueue {
        if (!this.instance) {
            this.instance = new ScoreQueue();
        }
        return this.instance;
    }

    addScore(submission: ScoreSubmission) {
        const queuedScore: QueuedScore = {
            ...submission,
            timestamp: Date.now(),
            attempts: 0
        };

        this.queue.push(queuedScore);
        // get the items in the queue as well as local storage.
        // compare all and only push to local storage if the current score is higher than the one in local storage.
        const storedScores = JSON.parse(localStorage.getItem('cachedLeaderboard') || '[]');  
        const currentScores = this.queue.map(score => score.score);
        const maxScore = Math.max(...currentScores);
        if (storedScores.length === 0 || (maxScore > storedScores[0].score)) {
            this.saveToStorage();
        } else {
            this.queue.pop();
        }
        
        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    private async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;
        
        this.isProcessing = true;

        while (this.queue.length > 0) {
            const current = this.queue[0];
            
            try {
                const success = await this.submitScore(current);
                if (success) {
                    this.queue.shift(); // Remove processed score
                    this.saveToStorage();
                } else {
                    current.attempts++;
                    if (current.attempts >= this.MAX_ATTEMPTS) {
                        this.queue.shift(); // Remove failed score after max attempts
                        this.saveToStorage();
                    }
                }
            } catch (error) {
                console.error('Error processing score:', error);
                break;
            }
        }

        this.isProcessing = false;
    }

    private async submitScore(score: QueuedScore): Promise<boolean> {
        // Import dynamically to avoid circular dependency
        const { default: LeaderboardService } = await import('./leaderboardService');
        return await LeaderboardService.getInstance().submitScore(score);
    }

    private saveToStorage() {
        localStorage.setItem('scoreQueue', JSON.stringify(this.queue));
    }

    private loadFromStorage() {
        const stored = localStorage.getItem('scoreQueue');
        if (stored) {
            this.queue = JSON.parse(stored);
        }
    }

    getQueueLength(): number {
        return this.queue.length;
    }
} 