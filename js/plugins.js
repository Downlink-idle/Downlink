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

// Place any jQuery/helper plugins in here.
