<template>
<div>
<div class="columns is-mobile is-multiline is-centered is-vcentered">
    <div class="column is-narrow-tablet is-full-mobile">
        <div class="control is-expanded">
            <div class="select is-fullwidth">
                <select v-model="startHour" v-on:change="fetchTimeEntries">
                    <option v-for="choice in startHourChoices" v-bind:value="choice" v-bind:key="choice">{{ choice | displayHourOrdinal }}</option>
                </select>
            </div>
        </div>
    </div>
    <div class="column is-hidden-mobile"></div>
    <div class="column is-narrow has-text-vcentered">
        <a class="button" v-on:click="moveBaseTimeBack"><font-awesome-icon icon="arrow-left"></font-awesome-icon></a>
        <strong class="day-display">&nbsp; {{ baseTime | displayDay }} &nbsp;</strong>
        <a class="button" v-on:click="moveBaseTimeForward"><font-awesome-icon icon="arrow-right"></font-awesome-icon></a>
    </div>
    <div class="column is-hidden-mobile"></div>
    <div class="column is-narrow-tablet is-full-mobile">
        <div class="control is-expanded">
            <div class="select is-fullwidth">
                <select v-model="endHour" v-on:change="fetchTimeEntries">
                    <option v-for="choice in endHourChoices" v-bind:value="choice" v-bind:key="choice">{{ choice | displayHourOrdinal }}</option>
                </select>
            </div>
        </div>
    </div>
</div>
<div class="columns is-multiline">
    <div class="column is-12 has-text-centered" v-if="timeEntries.length == 0">
        <em class="is-size-4 has-text-grey-light">NO HISTORY IN THIS TIME PERIOD</em>
    </div>
    <div class="column is-6-widescreen is-full">
        <div class="time-entry-holder" v-bind:style="{ 'height': totalHeight }">
            <div class="time-entry" v-for="entry in timeEntries" v-bind:key="entry.id" v-bind:style="{ 'height': entryHeight(entry), 'top': offsetToEntry(entry), 'background': entry.task.color }"></div>
            <div class="time-entry metric" v-for="(hour, index) in metricHours" v-bind:key="index" v-bind:style="metricDimensionsAtIndex(index)" v-bind:class="{ 'bottom-divider': index < metricHours.length - 1, 'top-divider': index == 0 }">
                <span class="time-entry-label">{{ hour | displayHour }}</span>
            </div>
        </div>
    </div>
    <div class="column is-6-widescreen is-full">
        <template v-for="total in totals">
            <div class="columns is-mobile" style="margin-bottom: 0" v-bind:key="`text-${ total.task.id }`">
                <div class="column is-8">
                    <span class="is-size-3">{{ total.task.name }}</span>
                </div>
                <div class="column is-4">
                    <span class="is-size-3 has-right-margin">{{ total.time | timePeriod }}</span>
                </div>
            </div>
            <div class="progress-bar" v-bind:style="{ 'background': backgroundGradient(total) }" v-bind:key="`bar-${ total.task.id }`"></div>
        </template>
        <hr v-if="timeEntries.length > 0">
        <div class="columns is-mobile" v-if="timeEntries.length > 0">
            <div class="column is-8">
                <span class="is-size-3">Total</span>
            </div>
            <div class="column is-4">
                <span class="is-size-3 has-right-margin">{{ grandTotal | timePeriod }}</span>
            </div>
        </div>
    </div>
</div>
</div>
</template>

<script>
import db from '../lib/idb.js';
import { startOfDay, startOfToday, startOfHour, endOfHour, addHours, add, subHours, getHours, getTime, isToday, isYesterday, isTomorrow, format } from 'date-fns';
import { groupBy, minBy, maxBy, sumBy } from 'lodash-es';
import { NONE_TASK } from '../lib/constants';
import { eventBus } from '../lib/event-bus';

export default {
    data: () => ({
        timeEntries: [],

        baseTime: startOfHour(Date.now()),
        startHour: 8,
        endHour: 28,
        pixelsPerMinute: 150 / 60,

        // Enable for development to show demo data in the history view
        showDemoData: false,
    }),
    mounted() {
        eventBus.$on('tracking-changed', () => this.fetchTimeEntries());
        eventBus.$on('task-updated', task => {
            this.timeEntries.forEach(entry => {
                if (entry.task.id == task.id) entry.task = task;
            });
        });
        this.showDemoData ? this.makeDemoTimeEntries() : this.fetchTimeEntries();
    },
    methods: {
        async fetchTimeEntries() {
            let [ start, end ] = this.timeWindow;
            let timeEntries = await db.timeEntries.where('start').between(start, end).toArray();
            await Promise.all(timeEntries.map(async (entry) => {
                entry.task = entry.taskId == 0 ? NONE_TASK : await db.tasks.where('id').equals(entry.taskId).first();
            }));
            this.timeEntries = timeEntries;
        },
        makeDemoTimeEntries() {
            let midnight = startOfToday();
            let mkTime = (hours, minutes) => add(midnight, { hours, minutes });
            let fakeEntry = (start, end, task) => ({ taskId: task.id, start, end, task });
            let fakeTasks = {
                task1: { id: 1, name: 'Test1', color: '#276fbf' },
                task2: { id: 2, name: 'Test2', color: '#f03a47' },
                task3: { id: 3, name: 'Test3', color: '#f6f4f3' },
            }
            this.timeEntries = [
                fakeEntry(mkTime(8, 20), mkTime(8, 40), NONE_TASK),
                fakeEntry(mkTime(8, 40), mkTime(9, 15), fakeTasks.task1),
                fakeEntry(mkTime(9, 15), mkTime(9, 25), NONE_TASK),
                fakeEntry(mkTime(9, 25), mkTime(10, 5), fakeTasks.task2),
                fakeEntry(mkTime(10, 5), mkTime(10, 30), fakeTasks.task1),
                fakeEntry(mkTime(10, 30), mkTime(11, 10), fakeTasks.task3),
                fakeEntry(mkTime(11, 10), mkTime(12, 10), NONE_TASK),
            ];
        },
        entryHeight(entry) {
            let minutes = (entry.end - entry.start) / 1000 / 60;
            let pixels = this.pixelsPerMinute * minutes;
            return `${ pixels }px`;
        },
        offsetToEntry(entry) {
            let start = this.earliestTime;
            let minutes = (entry.start - start) / 1000 / 60;
            let pixels = this.pixelsPerMinute * minutes;
            return `${ pixels }px`;
        },
        metricDimensionsAtIndex(index) {
            let height = this.pixelsPerMinute * 60;
            return { top: `${ height * index }px`, height: `${ height }px` };
        },
        backgroundGradient(total) {
            let color = total.task.id == 0 ? 'black' : total.task.color;
            return `linear-gradient(to right, ${ color } ${ total.percent }%, lightgray ${ total.percent }% ${ 100 - total.percent }%)`;
        },
        moveBaseTimeBack() {
            this.baseTime = subHours(this.baseTime, 24);
            this.fetchTimeEntries();
        },
        moveBaseTimeForward() {
            this.baseTime = addHours(this.baseTime, 24);
            this.fetchTimeEntries();
        },
    },
    computed: {
        metricHours() {
            let [ start, end ] = [ this.earliestTime, this.latestTime ];
            if (start == null || end == null) return [];
            return Array.from((function* () {
                let t = start;
                while (t < end) {
                    yield t;
                    t += 1000 * 60 * 60;
                }
            })());
        },
        startHourChoices() {
            return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
        },
        endHourChoices() {
            return [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
        },
        timeWindow() {
            return [ this.startHour, this.endHour ].map(x => addHours(startOfDay(this.baseTime), x)).map(getTime);
        },
        earliestTime() {
            let earliest = minBy(this.timeEntries, entry => entry.start);
            if (earliest != null) return getTime(startOfHour(earliest.start));
            return null;
        },
        latestTime() {
            let latest = maxBy(this.timeEntries, entry => entry.end);
            if (latest != null) return getTime(endOfHour(latest.end));
            return null;
        },
        totalHeight() {
            let [ start, end ] = [ this.earliestTime, this.latestTime ];
            if (start == null || end == null) return '0px';
            let diff = end - start;
            let minutes = diff / 1000 / 60;
            let pixels = this.pixelsPerMinute * minutes + 10;
            return `${ pixels }px`;
        },
        totals() {
            let totalTime = sumBy(this.timeEntries, entry => entry.end - entry.start);
            let byTask = groupBy(this.timeEntries, entry => entry.taskId);
            return Object.entries(byTask).map(([ taskId, entries ]) => {
                let time = sumBy(entries, entry => entry.end - entry.start);
                let percent = Math.round(time / totalTime * 100);
                return { task: entries[0].task, time, percent };
            });
        },
        grandTotal() {
            return sumBy(this.timeEntries, entry => entry.end - entry.start);
        },
    },
    filters: {
        displayHour(time) {
            let hour = getHours(time);
            let ampm = hour >= 12 ? 'PM' : 'AM';
            let h = hour % 12;
            if (h == 0) h = 12;
            return `${ h } ${ampm}`;
        },
        displayHourOrdinal(hour) {
            let ampm = (hour >= 12 && hour < 24) ? 'PM' : 'AM';
            let h = hour % 12;
            if (h == 0) h = 12;
            return `${ hour >= 24 ? '+' : '' } ${ h } ${ ampm }`;
        },
        displayDay(time) {
            return isYesterday(time) ? 'Yesterday' :
                isToday(time) ? 'Today' :
                isTomorrow(time) ? 'Tomorrow' :
                format(time, 'MM/dd');
        },
    },
}
</script>

<style lang="scss" scoped>
div.time-entry-holder {
    position: relative;
    div.time-entry {
        width: 100%;
        left: 0;
        position: absolute;
        // overflow-y: hidden;
        box-shadow: 0 -3px 15px rgba(0,0,0,0.3);
        &.metric {
            box-shadow: none;
        }
        &.top-divider {
            border-top: 1px dashed gray;
        }
        &.bottom-divider {
            border-bottom: 1px dashed gray;
        }
    }
}
div.progress-bar {
    width: 100%;
    height: 20px;
    border-radius: 10px;
    margin-bottom: 20px;
}
.day-display {
    min-width: 80px;
    text-align: center;
}
span.time-entry-label {
    left: 0;
    top: 0;
    padding: 5px 7px 5px 5px;
    background: lightgray;
    border-bottom: 1px solid gray;
    border-right: 1px solid gray;
    border-top: 2px solid gray;
    border-bottom-right-radius: 8px;
    font-size: 0.8rem;
    font-weight: bold;
}
</style>
