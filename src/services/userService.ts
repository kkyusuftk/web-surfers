interface UserProfile {
    id: string;
    username: string;
}

export class UserService {
    private static instance: UserService;
    private currentUser: UserProfile | null = null;
    private readonly STORAGE_KEY = 'webSurfer_userProfile';
    private readonly GUEST_PREF_KEY = 'webSurfer_playAsGuest';

    private constructor() {
        this.loadUserProfile();
    }

    static getInstance(): UserService {
        if (!this.instance) {
            this.instance = new UserService();
        }
        return this.instance;
    }

    private loadUserProfile() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            this.currentUser = JSON.parse(stored);
        }
    }

    private saveUserProfile(profile: UserProfile) {
        this.currentUser = profile;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
    }

    getUserProfile(): UserProfile | null {
        return this.currentUser;
    }

    hasUserProfile(): boolean {
        return this.currentUser !== null;
    }

    createUserProfile(username: string): UserProfile {
        const profile: UserProfile = {
            id: crypto.randomUUID(),
            username
        };
        this.saveUserProfile(profile);
        // Clear guest preference when creating a profile
        this.clearGuestPreference();
        return profile;
    }

    updateUsername(username: string): UserProfile {
        if (!this.currentUser) {
            return this.createUserProfile(username);
        }
        const updated = { ...this.currentUser, username };
        this.saveUserProfile(updated);
        return updated;
    }

    setPlayAsGuest() {
        localStorage.setItem(this.GUEST_PREF_KEY, 'true');
    }

    clearGuestPreference() {
        localStorage.removeItem(this.GUEST_PREF_KEY);
    }

    hasGuestPreference(): boolean {
        return localStorage.getItem(this.GUEST_PREF_KEY) === 'true';
    }

    isFirstTimeUser(): boolean {
        return !this.hasUserProfile() && !this.hasGuestPreference();
    }
} 