class VideoProgressTracker {
    constructor(videoElement) {
        this.video = videoElement;
        this.watchedIntervals = [];
        this.lastWatchedTime = 0;
        this.isTracking = false;
        this.currentInterval = null;

        this.init();
    }

    async init() {
        await this.loadProgress();

        this.video.addEventListener('loadedmetadata', this.handleMetadataLoaded.bind(this));
        this.video.addEventListener('play', this.startTracking.bind(this));
        this.video.addEventListener('pause', this.stopTracking.bind(this));
        this.video.addEventListener('seeked', this.handleSeek.bind(this));
        this.video.addEventListener('ended', this.stopTracking.bind(this));
        this.video.addEventListener('timeupdate', this.updateProgress.bind(this));

        window.addEventListener('beforeunload', this.saveProgress.bind(this));
    }

    handleMetadataLoaded() {
        if (this.lastWatchedTime > 0 && this.lastWatchedTime < this.video.duration) {
            this.video.currentTime = this.lastWatchedTime;
        }
        this.updateProgressDisplay();
    }

    startTracking() {
        if (!this.isTracking) {
            this.isTracking = true;
            this.currentInterval = { start: this.video.currentTime, end: this.video.currentTime };
        }
    }

    stopTracking() {
        if (this.isTracking && this.currentInterval) {
            this.isTracking = false;
            this.currentInterval.end = this.video.currentTime;
            this.addWatchedInterval(this.currentInterval);
            this.currentInterval = null;
            this.updateProgressDisplay();
        }
    }

    handleSeek() {
        if (this.isTracking && this.currentInterval) {
            this.currentInterval.end = this.video.currentTime;
            this.addWatchedInterval(this.currentInterval);
            this.currentInterval = { start: this.video.currentTime, end: this.video.currentTime };
        }
    }

    addWatchedInterval(newInterval) {
        if (newInterval.start >= newInterval.end) return;

        let merged = false;
        for (let i = 0; i < this.watchedIntervals.length; i++) {
            const interval = this.watchedIntervals[i];
            if (newInterval.start <= interval.end && newInterval.end >= interval.start) {
                interval.start = Math.min(interval.start, newInterval.start);
                interval.end = Math.max(interval.end, newInterval.end);
                merged = true;

                for (let j = i + 1; j < this.watchedIntervals.length;) {
                    const nextInterval = this.watchedIntervals[j];
                    if (nextInterval.start <= interval.end) {
                        interval.end = Math.max(interval.end, nextInterval.end);
                        this.watchedIntervals.splice(j, 1);
                    } else {
                        j++;
                    }
                }
                break;
            }
        }
        if (!merged) {
            this.watchedIntervals.push(newInterval);
            this.watchedIntervals.sort((a, b) => a.start - b.start);
        }
    }

    calculateWatchedTime() {
        return this.watchedIntervals.reduce((total, interval) => {
            return total + (interval.end - interval.start);
        }, 0);
    }

    calculateProgress() {
        if (this.video.duration) {
            const watchedTime = this.calculateWatchedTime();
            return (watchedTime / this.video.duration) * 100;
        }
        return 0;
    }

    updateProgress() {
        if (this.isTracking && this.currentInterval) {
            this.currentInterval.end = this.video.currentTime;
        }
        this.lastWatchedTime = this.video.currentTime;
        this.updateProgressDisplay();
    }

    updateProgressDisplay() {
        const progress = this.calculateProgress();
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${progress.toFixed(2)}% watched`;
    }

    async saveProgress() {
        const data = {
            intervals: this.watchedIntervals,
            lastTime: (this.calculateProgress() >= 100) ? 0 : this.lastWatchedTime
        };

        try {
            await fetch('/api/progress/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ progress: data })
            });
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    async loadProgress() {
        try {
            const response = await fetch('/api/progress/load');
            const data = await response.json();
            const saved = data.progress;

            if (saved) {
                this.watchedIntervals = saved.intervals || [];
                this.lastWatchedTime = saved.lastTime || 0;
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const videoElement = document.getElementById('video');
    new VideoProgressTracker(videoElement);
});


// const video = document.getElementById('video');
// const progress = document.getElementById('progress');
// const watchedList = document.getElementById('watched-list');
// const skippedList = document.getElementById('skipped-list');
// const rewatchedList = document.getElementById('rewatched-list');

// let watched = [];
// let skipped = [];
// let rewatched = [];

// let lastTimestamp = 0; 
// let currentSegmentStart = 0; 
// let rewatchThreshold = 5; 

// video.addEventListener('timeupdate', () => {
//     const currentTime = video.currentTime;
//     const duration = video.duration;

   
//     const percent = (currentTime / duration) * 100;
//     progress.style.width = `${percent}%`;

    
//     if (currentTime - lastTimestamp >= 1) {
      
//         const timeSegment = {
//             start: currentSegmentStart,
//             end: currentTime
//         };

//         if (currentTime - lastTimestamp > rewatchThreshold) {
            
//             addToList(watched, timeSegment, watchedList, 'Watched');
//         } else {
            
//             addToList(skipped, timeSegment, skippedList, 'Skipped');
//         }

        
//         currentSegmentStart = currentTime;
//         lastTimestamp = currentTime;
//     }
// });

// function addToList(array, segment, listElement, label) {
    
//     if (!isRewatched(segment)) {
//         array.push(segment);
//         const li = document.createElement('li');
//         li.textContent = `${label}: ${formatTime(segment.start)} - ${formatTime(segment.end)}`;
//         listElement.appendChild(li);
//     }
// }

// function formatTime(seconds) {
//     const date = new Date(null);
//     date.setSeconds(seconds);
//     return date.toISOString().substr(11, 8);
// }

// function isRewatched(segment) {
    
//     return rewatched.some((prevSegment) => {
//         return Math.abs(prevSegment.start - segment.start) < rewatchThreshold;
//     });
// }

// // On video end, reset everything
// video.addEventListener('ended', () => {
//     watched = [];
//     skipped = [];
//     rewatched = [];
//     watchedList.innerHTML = '';
//     skippedList.innerHTML = '';
//     rewatchedList.innerHTML = '';
//     currentSegmentStart = 0;
//     lastTimestamp = 0;
// });
