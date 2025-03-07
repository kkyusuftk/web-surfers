import { LeaderboardEntry, LeaderboardResponse, ScoreSubmission } from './types';

export default class LeaderboardService {
    private static instance: LeaderboardService;
    private cachedLeaderboard: LeaderboardEntry[] = [];
    private lastFetchTime: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    private readonly HIGH_SCORE_KEY = 'webSurfer_highScore';
    
    // Replace these with your actual Google Sheets URLs
    private readonly LEADERBOARD_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTFx1-0DNmZE9hVqzFr2EXy11NZAz8_tQpQ2OsfqKQZ5Fz0SIrVV5Gk1T3HUKpOes6QRx6sKi1YVE-_/pub?output=csv';
    private readonly SUBMIT_URL = 'https://script.google.com/macros/s/AKfycbzyN7ICdpYXoaVNAGDfJp9TB5Ha3YylFwZLh8OWgjk5p37CZ77HiDA0Qbxgtul7IKko/exec';

    private constructor() {
        // Load cached leaderboard from localStorage
        const cached = localStorage.getItem('cachedLeaderboard');
        if (cached) {
            this.cachedLeaderboard = JSON.parse(cached);
        } else {
            this.getLeaderboard();
        }
    }

    static getInstance(): LeaderboardService {
        if (!this.instance) {
            this.instance = new LeaderboardService();
        }
        return this.instance;
    }

    async getLeaderboard(forceRefresh = false): Promise<LeaderboardEntry[]> {
        // Return cached data if available and not expired
        if (!forceRefresh && 
            this.cachedLeaderboard.length > 0 && 
            Date.now() - this.lastFetchTime < this.CACHE_DURATION) {
            return this.cachedLeaderboard;
        }

        try {
            const response = await fetch(this.LEADERBOARD_URL);
            const csvData: LeaderboardResponse = await response.text(); // Get as text instead of JSON
            
            // Transform CSV data to LeaderboardEntry[]
            const entries = this.transformSheetData(csvData);
            
            // Update cache
            this.cachedLeaderboard = entries;
            this.lastFetchTime = Date.now();
            localStorage.setItem('cachedLeaderboard', JSON.stringify(entries));
            
            return entries;
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
            // Return cached data if fetch fails
            return this.cachedLeaderboard;
        }
    }

    private getStoredHighScore(playerId: string): number {
        const stored = localStorage.getItem(`${this.HIGH_SCORE_KEY}_${playerId}`);
        return stored ? parseInt(stored) : 0;
    }

    private updateStoredHighScore(playerId: string, score: number) {
        localStorage.setItem(`${this.HIGH_SCORE_KEY}_${playerId}`, score.toString());
    }

    isNewHighScore(playerId: string, score: number): boolean {
        return score > this.getStoredHighScore(playerId);
    }

    getHighScore(playerId: string): number {
        return this.getStoredHighScore(playerId);
    }

    async submitScore(submission: ScoreSubmission): Promise<boolean> {
        try {
            // Only submit if it's a new high score
            if (!this.isNewHighScore(submission.playerId, submission.score)) {
                console.log('Score not submitted - not a new high score');
                return false;
            }

            await fetch(this.SUBMIT_URL, {
                method: 'POST',
                mode: 'no-cors', // Required for Google Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...submission,
                    timestamp: Date.now(),
                }),
            });

            // Update local high score
            this.updateStoredHighScore(submission.playerId, submission.score);

            // Force refresh the leaderboard after submission
            await this.getLeaderboard(true);
            return true;
        } catch (error) {
            console.error('Failed to submit score:', error);
            return false;
        }
    }

    private transformSheetData(csvData: LeaderboardResponse): LeaderboardEntry[] {
        // Split CSV into rows
        const rows = csvData.split('\n')
            .map(row => row.split(','))
            .filter(row => row.length >= 5); // Ensure row has all required fields

        // Skip header row
        const dataRows = rows.slice(1);

        // Transform rows to LeaderboardEntry objects
        const entries = dataRows.map(row => ({
            timestamp: parseInt(row[0].trim()) || Date.now(),
            playerId: row[1].trim() || '',
            username: row[2].trim() || 'Anonymous',
            score: parseInt(row[3].trim()) || 0,
            coins: parseInt(row[4].trim()) || 0,
        }));

        // Sort by score descending
        return entries.sort((a, b) => b.score - a.score);
    }

    getCachedLeaderboard(): LeaderboardEntry[] {
        return this.cachedLeaderboard;
    }
} 