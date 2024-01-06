import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import duration from 'dayjs/plugin/duration.js';
import { readFile } from 'fs/promises';
import { mean, round } from 'mathjs';
import { resolve } from 'path';
import { ENTRIES_DIR } from './constants.js';

dayjs.extend(customParseFormat);
dayjs.extend(duration);

const getSleepEfficiency = (timeInBed, timeAsleep) =>
  round(timeAsleep.asMinutes() / timeInBed.asMinutes(), 2);

const lastSevenDays = Array.from({ length: 7 })
  .map((_, i) =>
    dayjs()
      .subtract(i + 1, 'day')
      .format('MMMM D, YYYY'),
  )
  .reverse();

const files = await Promise.all(
  lastSevenDays.map((dateString) => {
    const date = dayjs(dateString);
    const filename = `${date.format('MMMM D, YYYY')}`;
    return readFile(
      resolve(
        ENTRIES_DIR,
        date.format('YYYY'),
        date.format('MMMM'),
        `${filename}.md`,
      ),
      'utf-8',
    );
  }),
);

const entries = files.map((file) => {
  const date = dayjs(file.match(/# (.*)\n/)[1], 'MMMM D, YYYY');

  const bedTime = dayjs(file.match(/Bedtime: (.*)\n/)[1], 'h:mm A');
  const wakeTime = dayjs(file.match(/Waketime: (.*)\n/)[1], 'h:mm A');

  const timeInBedRaw = file.match(/Time in bed: (.*)\n/)[1];
  const timeInBedHours = +timeInBedRaw.match(/(\d+)h/)[1];
  const timeInBedMinutes = +timeInBedRaw.match(/(\d+)m/)[1];
  const timeInBed = dayjs.duration({
    hours: timeInBedHours,
    minutes: timeInBedMinutes,
  });

  const timeAsleepRaw = file.match(/Time asleep: (.*)\n/)[1];
  const timeAsleepHours = +timeAsleepRaw.match(/(\d+)h/)[1];
  const timeAsleepMinutes = +timeAsleepRaw.match(/(\d+)m/)[1];
  const timeAsleep = dayjs.duration({
    hours: timeAsleepHours,
    minutes: timeAsleepMinutes,
  });
  const sleepEfficiency = round(getSleepEfficiency(timeInBed, timeAsleep), 2);

  return {
    date,
    bedTime,
    wakeTime,
    timeInBed,
    timeAsleep,
    sleepEfficiency,
  };
});

const formattedEntries = entries.map(
  ({ date, bedTime, wakeTime, timeInBed, timeAsleep, sleepEfficiency }) => ({
    date: date.format('MMMM D, YYYY'),
    bedTime: bedTime.format('h:mm A'),
    wakeTime: wakeTime.format('h:mm A'),
    timeInBed: timeInBed.format('H[h] m[m]'),
    timeAsleep: timeAsleep.format('H[h] m[m]'),
    sleepEfficiency: `${sleepEfficiency * 100}%`,
  }),
);

const getMeanSleepEfficiency = (entries) =>
  round(mean(entries.map(({ sleepEfficiency }) => sleepEfficiency)), 2);

const getRecommendation = (entries) => {
  const recommendations = {
    'Your sleep efficiency this week was low. Consider removing 15–30 minutes from your sleep window.':
      (entries) => getMeanSleepEfficiency(entries) < 0.8,
    'Your sleep efficiency this week was average. Stick with your current sleep window.':
      (entries) =>
        getMeanSleepEfficiency(entries) >= 0.8 &&
        getMeanSleepEfficiency(entries) < 0.85,
    'Your sleep efficiency this week was high. Consider adding 15–30 minutes to your sleep window.':
      (entries) => getMeanSleepEfficiency(entries) >= 0.85,
    'No recommendations for now.': (entries) => true,
  };

  return Object.entries(recommendations).find(([recommendation, condition]) =>
    condition(entries),
  )[0];
};

console.log(`
${formattedEntries
  .map(
    ({ date, bedTime, wakeTime, timeInBed, timeAsleep, sleepEfficiency }) =>
      `${date}
- Bedtime: ${bedTime}
- Waketime: ${wakeTime}
- Time in bed: ${timeInBed}
- Time asleep: ${timeAsleep}
- Sleep efficiency: ${sleepEfficiency}`,
  )
  .join('\n\n')}

Weekly Sleep Efficiency: ${
  getMeanSleepEfficiency(entries) * 100
}% — ${getRecommendation(entries)}
`);
