const moment = require('moment');
const fortelEightWords = require('./main');
const {
    DailyGod,
    getDailyGod,
    getEightWordsByDatetime
} = fortelEightWords;

console.log(getDailyGod(moment.parseZone("2019-02-03T12:00:00+08:00")));