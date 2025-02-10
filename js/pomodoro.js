class PomodoroTimer {
    constructor() {
        this.workDuration = 25;
        this.breakDuration = 5;
        this.timeLeft = this.workDuration * 60;
        this.isRunning = false;
        this.isBreak = false;
        this.pomodorosCompleted = 0;
        this.timer = null;

        this.initializeElements();
        this.initializeEventListeners();

        // Listen to the visibilitychange event
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    initializeElements() {
        this.minutesDisplay = document.getElementById('minutes');
        this.secondsDisplay = document.getElementById('seconds');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.workDurationInput = document.getElementById('work-duration');
        this.breakDurationInput = document.getElementById('break-duration');
        this.statusText = document.getElementById('status-text');
        this.cycleCount = document.getElementById('cycle-count');
        this.timerDisplay = document.querySelector('.timer-display');
    }

    initializeEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        this.workDurationInput.addEventListener('change', () => {
            if (!this.isRunning) {
                this.workDuration = parseInt(this.workDurationInput.value);
                this.reset();
            }
        });

        this.breakDurationInput.addEventListener('change', () => {
            this.breakDuration = parseInt(this.breakDurationInput.value);
        });
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.timerDisplay.classList.add('active');
            
            this.timer = setInterval(() => this.tick(), 1000);
            
            this.statusText.textContent = this.isBreak ? 'Take a break!' : 'Focus time!';
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            this.timerDisplay.classList.remove('active');
            clearInterval(this.timer);
            this.statusText.textContent = 'Timer paused';
        }
    }

    reset() {
        this.isRunning = false;
        this.isBreak = false;
        clearInterval(this.timer);
        this.timeLeft = this.workDuration * 60;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.timerDisplay.classList.remove('active');
        this.updateDisplay();
        this.statusText.textContent = 'Ready to start working!';
    }

    tick() {
        this.timeLeft--;
        
        if (this.timeLeft < 0) {
            this.timeLeft = 0;
            this.completeInterval();
        }
        
        this.updateDisplay();
    }

    completeInterval() {
        if (this.isBreak) {
            this.isBreak = false;
            this.timeLeft = this.workDuration * 60;
            this.statusText.textContent = 'Work time!';
        } else {
            this.isBreak = true;
            this.timeLeft = this.breakDuration * 60;
            this.pomodorosCompleted++;
            this.cycleCount.textContent = `Pomodoros completed: ${this.pomodorosCompleted}`;
            this.statusText.textContent = 'Break time!';
        }

        // Play notification sound
        this.playNotification();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        this.minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        this.secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    }

    playNotification() {
        const audio = new Audio('data:audio/wav;base64,//uQ...');
        audio.play();
    }

    handleVisibilityChange() {
        if (document.hidden) {
            document.title = "You have backgrounded the tab";
        } else {
            document.title = "Welcome back!"; // Reset page title.
        }
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});
