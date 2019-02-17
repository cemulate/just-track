<template>
<div class="columns is-gapless">
    <div class="column is-3">
        <div class="time-entry metric" v-for="hour in metricHours">
            {{ hour }}
        </div>
    </div>
    <div class="column is-4">
        <div class="time-entry" v-for="entry in timeEntries" v-bind:style="{ 'height': calculateEntryHeight(entry), 'background-color': entry.task.color }">
            <p><strong v-bind:style="{ 'color': entry.taskId == 0 ? 'white' : 'inherit' }">{{ entry.task.name }}</strong></p>
        </div>
    </div>
    <div class="column is-5">
        <nav class="level" v-for="total in totals">
            <div class="level-left">
                <div class="level-item">
                    <span class="is-size-3 has-left-margin">{{ total.task.name }}</span>
                </div>
            </div>
            <div class="level-right">
                <div class="level-item">
                    <span class="is-size-3 has-right-margin">{{ total.time | timePeriod }}</span>
                </div>
                <div class="level-item">
                    <span class="is-size-3">{{ total.fraction | percent }}</span>
                </div>
            </div>
        </nav>
    </div>
</div>
</template>

<script>
import db from '../lib/idb.js';
import { startOfToday, endOfToday, startOfHour, endOfHour, addHours, getHours, getMinutes, getTime } from 'date-fns';
import { groupBy, minBy, maxBy, sumBy } from 'lodash-es';

export default {
    data: () => ({
        timeEntries: [],
    }),
    async created() {
        let [ start, end ] = [ startOfToday(), endOfToday() ].map(getTime);
        let timeEntries = await db.timeEntries.where('start').between(start, end).toArray();
        await Promise.all(timeEntries.map(async (entry) => {
            entry.task = entry.taskId == 0 ? { id: 0, name: 'None', color: 'black' } : await db.tasks.where('id').equals(entry.taskId).first();
        }));
        this.timeEntries = timeEntries;
        // let task = await db.tasks.where('id').equals(57).first();
        // let nullTask = { id: 0, name: 'None', color: 'gray' };
        // this.timeEntries = [
        //     { taskId: 0, start: start + 1000*60*60*8 + 1000*60*30, end: start + 1000*60*60*11 + 1000*60*0, task: nullTask },
        //     { taskId: 57, start: start + 1000*60*60*11 + 1000*60*0, end: start + 1000*60*60*14 + 1000*60*15, task },
        //     { taskId: 0, start: start + 1000*60*60*14 + 1000*60*15, end: start + 1000*60*60*15 + 1000*60*0, task: nullTask },
        //     { taskId: 57, start: start + 1000*60*60*15 + 1000*60*0, end: start + 1000*60*60*16 + 1000*60*0, task },
        // ];
    },
    methods: {
        calculateEntryHeight(entry) {
            let minutes = (entry.end - entry.start) / 1000 / 60;
            let pixels = 100 / 60 * minutes;
            return `${ pixels }px`;
        },
    },
    computed: {
        metricHours() {
            if (this.timeEntries == null | this.timeEntries.length == 0) return [];
            let earliest = minBy(this.timeEntries, entry => entry.start).start;
            let latest = maxBy(this.timeEntries, entry => entry.end).end;
            let startHour = getHours(startOfHour(new Date(earliest)));
            let endHour = getHours(startOfHour(addHours(new Date(latest), 1)));
            return Array(endHour - startHour).fill().map((_, i) => {
                let hour = startHour + i;
                let n = hour % 12;
                if (n == 0) n = 12;
                let ampm = (hour / 12 >= 1) ? 'PM' : 'AM';
                return `${ n }:00 ${ ampm }`;
            });
        },
        offsetToFirstEntry() {
            let earliest = this.timeEntries.reduce((min, cur) => (min == null || cur.start <= min) ? cur.start : min, null);
            let minutes = getMinutes(earliest);
            let pixels = 100 / 60 * minutes;
            return `${ pixels }px`;
        },
        totals() {
            let totalTime = sumBy(this.timeEntries, entry => entry.end - entry.start);
            let byTask = groupBy(this.timeEntries, entry => entry.taskId);
            return Object.entries(byTask).map(([ taskId, entries ]) => {
                let time = sumBy(entries, entry => entry.end - entry.start);
                let fraction = time / totalTime;
                return { task: entries[0].task, time, fraction };
            });
        }
    },
}
</script>

<style lang="scss" scoped>
div.time-entry {
    width: 100%;
    border-bottom: 1px solid white;
    &.metric {
        height: 100px;
        border-bottom: 1px dashed gray;
        font-family: monospace;
        font-style: italic;
    }
}
.has-left-margin {
    margin-left: 20px;
}
.has-right-margin {
    margin-right: 20px;
}
</style>
