var Downlink = Downlink?Downlink:{};

(()=>{
    let alphabetGrid = [],
        randomizedAlphabet = [];

    class Alphabet
    {
        static build()
        {
            let searchSpace = '';
            for(let i = 0; i < 10; i++)
            {
                searchSpace += ''+i;
            }

            for(let i = 0; i < 26; i++)
            {
                // add the letters a through z in upper and lower case by their character code
                searchSpace += String.fromCharCode(i + 65);
                searchSpace += String.fromCharCode(i + 97);
            }
            alphabetGrid = searchSpace.split('');
            this.shuffle();
        }

        static shuffle()
        {
            randomizedAlphabet = alphabetGrid.slice().shuffle();
        }

        static getRandomLetter()
        {
            if(!randomizedAlphabet.length)
            {
                this.shuffle();
            }
            return randomizedAlphabet.pop();
        }
    };

    Alphabet.build();
    Downlink.Alphabet = Alphabet;
})();
