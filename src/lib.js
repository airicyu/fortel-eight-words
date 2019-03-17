'use strict';

const moment = require('moment');
const fortelCodex = require('fortel-codex');
const fortelSolarTerm = require('fortel-solar-term');

const { MoonSun, Element, Stem, Branch, HourBranch, Zodiac, Relationship } = fortelCodex;
const { TermDatetime, TermYearMonth } = fortelSolarTerm;

class DailyGod {

    /**
     * Creates an instance of DailyGod.
     * @param {number} index 
     * @param {string} displayName 
     * 
     * @memberOf DailyGod
     */
    constructor(index, displayName) {
        this.index = index;
        this.displayName = displayName;
    }

    getIndex() {
        return this.index;
    }

    getDisplayName() {
        return this.displayName;
    }


    /**
     * get by index or name
     * 
     * @static
     * @param {number|string} key 
     * @returns {DailyGod}
     * 
     * @memberOf DailyGod
     */
    static get(key) {
        if (typeof key === 'string') {
            let instanceIndex = DailyGod.items.map(_ => _.displayName).indexOf(key);
            return DailyGod.items[instanceIndex];
        } else {
            let items = DailyGod.items;
            return items[((key % items.length) + items.length) % items.length]
        }
    }


    /**
     * shift i DailyGod
     * 
     * @param {number} i 
     * @returns {DailyGod}
     * 
     * @memberOf DailyGod
     */
    shift(i) {
        return DailyGod.get(this.index + i);
    }

}
DailyGod.items = [
    new DailyGod(0, '建'),
    new DailyGod(1, '除'),
    new DailyGod(2, '滿'),
    new DailyGod(3, '平'),
    new DailyGod(4, '定'),
    new DailyGod(5, '執'),
    new DailyGod(6, '破'),
    new DailyGod(7, '危'),
    new DailyGod(8, '成'),
    new DailyGod(9, '收'),
    new DailyGod(10, '開'),
    new DailyGod(11, '閉')
];

Object.freeze(DailyGod);
Object.freeze(DailyGod.items);
for (let dailyGod of DailyGod.items) {
    Object.freeze(DailyGod);
}

function getDailyGod(dateTime) {
    let eightWords = getEightWordsByDatetime(dateTime)['array2d.groupByPillar'];
    let monthBranch = eightWords[2][1];
    let dayBranch = eightWords[1][1];

    return DailyGod.get(Branch.get(dayBranch).getIndex() - Branch.get(monthBranch).getIndex());
}

function getEightWordsByDatetime(datetime) {
    datetime = moment(datetime).utcOffset("+08:00");
    let year = datetime.get('year');
    let month = datetime.get('month') + 1;
    let day = datetime.get('date');
    let hour = datetime.get('hour');
    let minute = datetime.get('minute');
    let second = datetime.get('second');
    let hourBranchIndex = Math.floor((hour * 3600 + minute * 60 + second + 3600) / 7200);

    let { termYear, termMonth } = new TermDatetime(datetime).getYearTermMonth();

    let yearStem = Stem.get([termYear - 4] % 10);
    let yearBranch = Branch.get([termYear - 4] % 12);

    let monthStem = Stem.get(((yearStem.index + 1) % 5) * 2).shift(termMonth - 1);
    let monthBranch = Branch.get(termMonth + 1);

    let dayStem;
    let dayBranch;

    {
        let y = year;
        let m = month;
        let d = day;
        if (m <= 2) {
            y -= 1;
            m += 12;
        }
        let c = (y - y % 100) / 100;
        y = y % 100;
        let g = 4 * c + Math.floor(c / 4) + 5 * y + Math.floor(y / 4) + Math.floor(3 * (m + 1) / 5) + d - 4;
        let z = 8 * c + Math.floor(c / 4) + 5 * y + Math.floor(y / 4) + Math.floor(3 * (m + 1) / 5) + d + 6 + (m % 2 == 0 ? 6 : 0);

        dayStem = Stem.get(g);
        dayBranch = Branch.get(z);
    }


    let hourStem = Stem.get(dayStem.index * 2 + hourBranchIndex);
    let hourBranch = Branch.get(hourBranchIndex);

    hourStem = hourStem.displayName;
    dayStem = dayStem.displayName;
    monthStem = monthStem.displayName;
    yearStem = yearStem.displayName;
    hourBranch = hourBranch.displayName;
    dayBranch = dayBranch.displayName;
    monthBranch = monthBranch.displayName;
    yearBranch = yearBranch.displayName;

    let eightWords = {
        'array2d.groupByStemBranch': [
            [hourStem, dayStem, monthStem, yearStem],
            [hourBranch, dayBranch, monthBranch, yearBranch],
        ],
        'array2d.groupByPillar': [
            [hourStem, hourBranch],
            [dayStem, dayBranch],
            [monthStem, monthBranch],
            [yearStem, yearBranch]
        ],
        'map': {
            hourStem,
            dayStem,
            monthStem,
            yearStem,
            hourBranch,
            dayBranch,
            monthBranch,
            yearBranch,
        }
    }

    return eightWords;
}

module.exports = {
    DailyGod,
    getDailyGod,
    getEightWordsByDatetime
};