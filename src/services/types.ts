export interface LeaderboardEntry {
    timestamp: number;
    playerId: string;
    username: string;
    score: number;
    coins: number;
}

export interface ScoreSubmission {
    playerId: string;
    username: string;
    score: number;
    coins: number;
}

// Updated to handle CSV response
export type LeaderboardResponse = string; // Raw CSV data 