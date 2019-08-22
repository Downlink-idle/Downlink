class Event
{
    constructor(name)
    {
        this.name = name;
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
}

class EventListener
{
    constructor()
    {
        this.events = {};
    }

    on(eventName, callback)
    {
        eventName = eventName.toLowerCase();
        if(!this.events[eventName])
        {
            this.events[eventName].push(new Event(eventName));
        }
        this.events[eventName].addListener(callback);
        return this;
    }

    off(eventName)
    {
        this.events[eventName] = null;
        return this;
    }

    addListener(eventName, callback)
    {
        return this.on(eventName, callback);
    }

    removeListener(eventName, callback)
    {
        if(this.events[eventName])
        {
            this.events[eventName].removeListener(callback);
        }
    }

    get events()
    {
        return Object.keys(this.events);
    }
}
