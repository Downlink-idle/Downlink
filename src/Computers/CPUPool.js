const   CPU = require('./CPU'),
        EventListener = require('../EventListener');

class CPUPool extends EventListener
{
    constructor(cpus)
    {
        super();
        /**
         * @type {Array.<CPU>}
         */
        this.cpus = [];
        /**
         * @type {number} The average speed of all cpus in the pool
         */

        this.averageSpeed = new Decimal(0);
        for(let cpu of cpus)
        {
            this.addCPU(cpu);
        }
    }

    /**
     * @param {CPU} cpu
     */
    addCPU(cpu)
    {
        this.cpus.push(cpu);
        this.averageSpeed = this.averageSpeed.plus(cpu.speed.dividedBy(this.cpus.length));
    }
}
