"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimingTask = exports.Timing = exports.TimeEx = exports.Time = void 0;
class Time {
    constructor(hours, minutes, seconds) {
        this.hours = hours;
        this.minutes = minutes;
        this.seconds = seconds;
    }
    equals(other) {
        return (this.hours === other.hours &&
            this.minutes === other.minutes &&
            this.seconds === other.seconds);
    }
}
exports.Time = Time;
class TimeEx extends Time {
    constructor(date) {
        super(date.getHours(), date.getMinutes(), date.getSeconds());
    }
}
exports.TimeEx = TimeEx;
class Timing {
    constructor() {
        this.tasks = [];
        setInterval(() => {
            let now = new TimeEx(new Date(Date.now()));
            for (let i = 0; i < this.tasks.length; i++) {
                let task = this.tasks[i];
                if (task.time.equals(now)) {
                    this.tasks.splice(i, 1);
                    task.func();
                }
            }
        }, 100);
    }
    addTiming(...timingTask) {
        this.tasks.push(...timingTask);
    }
    clearTimings() {
        this.tasks = [];
    }
}
exports.Timing = Timing;
class TimingTask {
    constructor(time, func) {
        this.time = time;
        this.func = () => {
            try {
                func();
            }
            catch (e) {
                console.error("Error while run task", e);
            }
        };
    }
}
exports.TimingTask = TimingTask;
