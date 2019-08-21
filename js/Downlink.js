module.exports= ($)=> {
    let Downlink = {
        Challenges: {
            Password: require('./Challenges/Password'),
            Encryption:require('./Challenges/Encryption')
        }
    };
};
