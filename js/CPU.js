var Downlink = Downlink?Downlink:{};

(($)=> {
    let Task = Downlink.Task;

    class CPU
    {
        constructor(name, speed)
        {
            this.name = name?name:"Processor";
            this.speed = speed?speed:150;
            this.tasks = [];
            this.load = 0;
        }

        addTask(task)
        {
            if (!(task instanceof Task))
            {
                throw new Error('Tried to add a non task object to a processor');
            }
            if(this.tasks.indexOf(task)>=0)
            {
                throw new Error('This task is already on the CPU');
            }

            // the amount of cycles the cpu is going to devote to each task is 1/nth of the total cycles
            // where n is the total of tasks that will be run including this task
            // I'm going to fudge with that a bit to make sure no rogue amounts start appearing and dissappearing

            let idealCyclesToAssign = Math.max(task.minimumRequiredCycles, Math.floor(this.speed / (this.tasks.length + 1))),
                cyclesToAssign = idealCyclesToAssign;

            if(this.tasks.length > 0)
            {
                let cyclesToTryToTakeAwayFromEachProcess = Math.ceil(idealCyclesToAssign / this.tasks.length),
                    cyclesFreedUp = 0;

                for(let task of this.tasks)
                {
                    cyclesFreedUp += task.freeCycles(cyclesToTryToTakeAwayFromEachProcess);
                }
                cyclesToAssign = cyclesFreedUp;
            }
            task.setCyclesPerTick(cyclesToAssign);

            this.tasks.push(task);
            $(task).on('complete', ()=>{
                this.completeTask(task);
            });
            return this;
        }

        completeTask(task)
        {
            let freedCycles = task.cyclesPerTick;
            this.tasks.removeElement(task);
            console.log(`Freeing ${freedCycles} cycles`);
            if(this.tasks.length >= 1)
            {
                let freedCyclesPerTick = Math.floor(freedCycles/this.tasks.length);
                let i = 0;
                while(i < this.tasks.length && freedCycles > 0)
                {
                    let task = this.tasks[i];
                    freedCycles -= freedCyclesPerTick;
                    task.addCycles(freedCyclesPerTick);
                    i++;
                }
            }
            $(this).trigger('taskComplete', [task]);
        }

        tick()
        {
            for(let task of this.tasks)
            {
                task.tick();
            }

            if(this.ticking)
            {
                this.timer = window.setTimeout(()=>{this.tick();}, 50);
            }
        }

        start()
        {
            this.ticking = true;
            this.tick();
        }

        stop()
        {
            this.ticking = false;
            window.clearTimeout(this.timer);
        }

    }

    Downlink.CPU = CPU;
})(window.jQuery);
