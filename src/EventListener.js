class Event
{
    constructor(owner, name, once)
    {
        this.owner = owner;
        this.name = name;
        this.once = once;
        this.triggered = false;
        this.callbacks = [];
    }

    addListener(callback)
    {
        this.callbacks.push(callback);
        return this;
    }

    removeListener(callback)
    {
        let index = this.callbacks.indexOf(callback);
        if(index >= 0)
        {
            this.callbacks.splice(index, 1);
        }
        return this;
    }

    trigger(args)
    {
        if(!this.once || (this.once && !this.triggered))
        {
            this.callbacks.forEach(function (callback) {
                callback(...args);
            });
        }
        this.triggered = true;
    }
}

class EventListener
{
    constructor()
    {
        /**
         * @type {{Event}}
         */
        this.events = {};
    }

    static set staticEvents(events)
    {
        this._events = events;
    }

    static get staticEvents()
    {
        if(!this.hasOwnProperty('_events'))
        {
            this._events = {};
        }
        return this._events;
    }

    once(eventName, callback)
    {
        let e = eventName.toLowerCase();
        if(!this.events[e])
        {
            this.events[e] = new Event(this, e, true);
        }
        this.events[e].triggered = false;
        this.events[e].addListener(callback);
        return this;
    }

    static once(eventName, callback)
    {
        let e = eventName.toLowerCase();
        if(!this.staticEvents[e])
        {
            this.staticEvents[e] = new Event(this, e, true);
        }
        this.staticEvents[e].triggered = false;
        this.staticEvents[e].addListener(callback);
        return this;
    }

    on(eventName, callback)
    {
        let e = eventName.toLowerCase();
        if(!this.events[e])
        {
            this.events[e] = new Event(this, e);
        }
        this.events[e].addListener(callback);
        return this;
    }

    static on(eventName, callback)
    {
        let e = eventName.toLowerCase();
        if(!this.staticEvents[e])
        {
            this.staticEvents[e] = new Event(this, e);
        }
        this.staticEvents[e].addListener(callback);
        return this;
    }

    off(eventName)
    {
        if(eventName)
        {
            let e = eventName.toLowerCase();
            delete(this.events[e]);
        }
        else
        {
            this.events = {};
        }
        return this;
    }

    static off(eventName)
    {
        if(eventName)
        {
            let e = eventName.toLowerCase();
            delete(this.staticEvents[e]);
        }
        else
        {
            this.staticEvents = {};
        }
    }

    addListener(eventName, callback)
    {
        let e = eventName.toLowerCase();
        return this.on(e, callback);
    }


    trigger(eventName, ...args)
    {
        let e = eventName.toLowerCase();
        if(this.events[e])
        {
            try
            {
                let evt = this.events[e];
                evt.trigger(args);
            }
            catch(e)
            {
                console.log(e);
            }
        }
    }

    static trigger(eventName, ...args)
    {
        let e = eventName.toLowerCase();
        if(this.staticEvents[e])
        {
            try
            {
                let evt = this.staticEvents[e];
                evt.trigger(args);
            }
            catch(e)
            {
                console.log(e);
            }
        }
    }

    static removeListener(eventName, callback)
    {
        let e = eventName.toLowerCase();
        if(this.staticEvents[e])
        {
            this.staticEvents[e].removeListener(callback);
        }
    }

    removeListener(eventName, callback)
    {
        let e = eventName.toLowerCase();
        if(this.events[e])
        {
            this.events[e].removeListener(callback);
        }
    }
}

module.exports = EventListener;
