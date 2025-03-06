import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";

export const useTouchControls = () => {
    const {
        isPlaying,
        isPaused,
        gameOver,
        startGame,
        pauseGame,
        resumeGame,
        moveLeft,
        moveRight,
        setJumping,
        setRolling,
        isRolling,
        isJumping,
    } = useGameStore();

    useEffect(() => {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;

        const handleTouchStart = (e: TouchEvent) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
        };

        const handleTouchEnd = (e: TouchEvent) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndTime = Date.now();

            // Calculate swipe distance and direction
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const deltaTime = touchEndTime - touchStartTime;

            // Minimum swipe distance and maximum swipe time
            const minSwipeDistance = 50;
            const maxSwipeTime = 300;

            // Only process swipe if it's quick enough
            if (deltaTime <= maxSwipeTime) {
                // Determine if the swipe is more horizontal or vertical
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal swipe
                    if (Math.abs(deltaX) >= minSwipeDistance) {
                        if (deltaX > 0) {
                            // Swipe right
                            moveRight();
                        } else {
                            // Swipe left
                            moveLeft();
                        }
                    }
                } else {
                    // Vertical swipe
                    if (Math.abs(deltaY) >= minSwipeDistance) {
                        if (deltaY > 0) {
                            // Swipe down - roll
                            if (!isJumping) {
                                setRolling(true);
                                // Auto reset rolling after a short duration
                                setTimeout(() => setRolling(false), 800);
                            }
                        } else {
                            // Swipe up - jump
                            if (!isRolling && !isJumping) {
                                setJumping(true);
                                // Auto reset jumping after a short duration
                                setTimeout(() => setJumping(false), 600);
                            }
                        }
                    }
                }
            }
        };

        // Add touch event listeners
        window.addEventListener("touchstart", handleTouchStart);
        window.addEventListener("touchend", handleTouchEnd);

        return () => {
            // Clean up event listeners
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, [
        isPlaying,
        isPaused,
        gameOver,
        startGame,
        pauseGame,
        resumeGame,
        moveLeft,
        moveRight,
        setJumping,
        setRolling,
        isRolling,
        isJumping,
    ]);
}; 