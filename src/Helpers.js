module.exports = {
    shuffleArray:function(array)
    {
        for (let i = array.length - 1; i > 0; i--)
        {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },
    popRandomArrayElement:function(array)
    {
        this.shuffleArray(array);
        return array.pop();
    },
    getRandomArrayElement:function(array)
    {
        return array[Math.floor(Math.random() * array.length)];
    },
    removeArrayElement(array, element)
    {
        let index = array.indexOf(element);
        if(index >= 0)
        {
            array.splice(index, 1);
        }
        return array;
    },
    getRandomIntegerBetween(min, max)
    {

    }

};
