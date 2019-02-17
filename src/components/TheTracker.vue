<template>
<div id="main-area" class="box" v-on:click="toggleTracking" v-bind:style="{ 'background-color': currentTask.color }">
    <div class="columns is-centered">
        <div class="column is-narrow">
            <span v-bind:class="{ 'soft': !tracking }">
                {{ tracking ? currentTask.name : 'START' }}
            </span>
            <span class="soft" v-if="tracking">
                {{ elapsedTime | timePeriod }}
            </span>
        </div>
    </div>
</div>
</template>

<script>
import db from '../lib/idb.js';

export default {
    data: () => ({
        tracking: false,
        currentTask: { id: 0, name: 'None' },
        currentTimeEntry: null,
        myCurrentTimestamp: null,

        timeUpdateInterval: null,
        documentKeyDownHandler: null,
    }),
    props: {
        keyCommand: String,
        currentTimestamp: Number,
    },
    methods: {
        toggleTracking() {
            if (!this.tracking) {
                this.currentTask = { id: 0, name: 'None' };
                this.myCurrentTimestamp = Date.now();
                this.currentTimeEntry = { taskId: this.currentTask.id, start: Date.now() };
                this.tracking = true;
            } else if (this.tracking && this.currentTimeEntry) {
                this.currentTimeEntry.end = Date.now();
                if (this.currentTimeEntry.end - this.currentTimeEntry.start > 1000*60) {
                    // Only store time entries over a minute
                    db.timeEntries.add(this.currentTimeEntry);
                }
                this.tracking = false;
                this.currentTask = { id: 0, name: 'None' };
                this.currentTimeEntry = null;
            }
        },
    },
    computed: {
        elapsedTime() {
            return this.myCurrentTimestamp - this.currentTimeEntry.start;
        },
    },
    watch: {
        async keyCommand(key) {
            let task = await (key == ' ' ? { id: 0, name: 'None' } : db.tasks.where('hotkey').equals(key.toUpperCase()).first());
            if (this.tracking && task != null && task.id != this.currentTask.id) {
                if (this.currentTimeEntry != null) {
                    this.currentTimeEntry.end = Date.now();
                    if (this.currentTimeEntry.end - this.currentTimeEntry.start > 1000*60) {
                        // Only store time entries over a minute
                        db.timeEntries.add(this.currentTimeEntry);
                    }
                }
                this.currentTask = task;
                this.myCurrentTimestamp = Date.now();
                this.currentTimeEntry = { taskId: this.currentTask.id, start: Date.now() };
            }
        },
        currentTimestamp(timestamp) {
            this.myCurrentTimestamp = timestamp;
        },
    },
}
</script>

<style lang="scss">
#main-area {
    margin-top: 20px;
    span {
        font-size: 6vw;
        font-weight: bold;
        &.soft {
            opacity: 0.5;
        }
        &:first-child {
            margin-right: 10px;
        }
    }
}
</style>
