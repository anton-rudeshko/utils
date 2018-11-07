#!/usr/bin/env node

import * as R from 'ramda';
import * as moment from 'moment';

const momentFmt: R.CurriedFunction2<string, moment.Moment, string> = R.invoker(1, 'format');
const fmtDayOfMonth = momentFmt('DD');
const fmtDate = momentFmt('YYYY-MM-DD');

const getFirstDay = (xs: moment.Moment[]) => fmtDayOfMonth(xs[0]);
const getLastDay = (xs: moment.Moment[]) => fmtDayOfMonth(xs[xs.length - 1]);
const getWeekRange = R.converge(R.unapply(R.join('-')), [getFirstDay, getLastDay]);

const listItem = R.concat('* ');
const indent2 = R.concat('  ');

const joinLine = R.join('\n');
const formatDay = (d: moment.Moment) => `${fmtDayOfMonth(d)} !(${fmtDate(d)})`;
const formatWeekDay = R.compose(indent2, formatDay);
const formatWeekDays = R.compose(R.join('\n'), R.map(formatWeekDay));
const formatWeek = (days: moment.Moment[]) => `${getWeekRange(days)}\n${formatWeekDays(days)}`;

const main = ({ from, count }: yargs.Arguments) => {
    const dates = R.range(0, count).map((i) => moment(from).add(i, 'd'));
    const datesByWeek = R.groupBy((d) => d.isoWeek().toString(), dates);
    const stringsByWeek = joinLine(Object.values(datesByWeek).map(formatWeek));

    console.log(stringsByWeek);
};

import * as yargs from 'yargs';

yargs.strict();
yargs.detectLocale(false);

yargs.command('$0', 'Generate diary structure with dates for Dynalist', {
    count: {
        alias: 'c',
        type: 'number',
        default: 28
    },
    from: {
        alias: 'f',
        type: 'string',
        default: fmtDate(moment().startOf('week'))
    }
}, main);

yargs.parse();
