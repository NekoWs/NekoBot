export class Time {
    hours : number
    minutes : number
    seconds: number
    constructor(hours: number, minutes: number, seconds: number) {
        this.hours = hours
        this.minutes = minutes
        this.seconds = seconds
    }
    equals(other: Time): boolean {
        return (
            this.hours === other.hours &&
            this.minutes === other.minutes &&
            this.seconds === other.seconds
        )
    }
}
export class TimeEx extends Time {
    constructor(date: Date) {
        super(date.getHours(), date.getMinutes(), date.getSeconds())
    }
}

export class Timing {
    tasks: TimingTask[] = []
    constructor() {
        setInterval(() => {
            let now = new TimeEx(new Date(Date.now()))
            for (let i = 0; i < this.tasks.length; i++) {
                let task = this.tasks[i]
                if (task.time.equals(now)) {
                    this.tasks.splice(i, 1)
                    task.func()
                }
            }
        }, 100)
    }
    addTiming(...timingTask: TimingTask[]) {
        this.tasks.push(...timingTask)
    }
    clearTimings() {
        this.tasks = []
    }
}

export class TimingTask {
    time: Time
    func: (() => void)
    constructor(time: Time, func: (() => void)) {
        this.time = time
        this.func = () => {
            try {
                func()
            } catch (e) {
                console.error("Error while run task", e)
            }
        }
    }
}