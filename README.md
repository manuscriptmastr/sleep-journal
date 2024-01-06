# Sleep Journal

A Node.js sleep journal and sleep efficiency calculator, most helpful for [Sleep Restriction Therapy](https://stanfordhealthcare.org/medical-treatments/c/cognitive-behavioral-therapy-insomnia/procedures/sleep-restriction.html).

## Installation

1. Clone this repo
2. Install packages via `nvm use && npm install`

## Create a journal entry

1. Add a new file to the `entries` folder. It must follow these guidelines for reporting to work:
   - Folder structure: `entries/{MMMM}/{MMMM, D, YYYY}.md`
   - File format: Use `template.md` as a guide

## View report

Run `npm run start` to see the last seven days, your weekly sleep efficiency (time asleep vs. time in bed), and a recommendation.
