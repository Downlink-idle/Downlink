// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }

    Array.prototype.randomElement = function()
    {
        let index = Math.floor(Math.random() * this.length);
        return this[index];
    };

    Array.prototype.removeElement = function(element)
    {
        let i = this.indexOf(element);
        this.splice(i, 1);
        return this;
    };

    Array.prototype.shuffle = function()
    {
        let i = this.length, temp, r;

        while(0 !== i)
        {
            r = Math.floor(Math.random() * i);
            i --;

            temp = this[i];
            this[i] = this[r];
            this[r] = temp;
        }
        return this;
    };

}());

// Place any jQuery/helper plugins in here.
