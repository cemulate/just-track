<template>
<div id="main-area" class="box" v-on:click="toggleTracking" v-bind:style="{ 'background': tracking ? currentTask.color : 'inherit' }">
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
import { NONE_TASK } from '../lib/constants';
import { eventBus } from '../lib/event-bus';

export default {
    data: () => ({
        tracking: false,
        currentTask: NONE_TASK,
        currentTimeEntry: null,
        myCurrentTimestamp: null,

        timeUpdateInterval: null,
        documentKeyDownHandler: null,
    }),
    props: {
        keyCommand: String,
        currentTimestamp: Number,
    },
    async mounted() {
        eventBus.$on('tracking-request', task => {
            this.endTracking();
            this.startTracking(task);
        });
        eventBus.$on('task-updated', task => {
            if (task.id == this.currentTask.id) this.currentTask = task;
        });
        let resumableEntry = localStorage.getItem('currentTimeEntry');
        if (resumableEntry != null) {
            this.currentTimeEntry = JSON.parse(resumableEntry);
            this.currentTask = await (this.currentTimeEntry.taskId == 0 ? NONE_TASK : db.tasks.where('id').equals(this.currentTimeEntry.taskId).first());
            this.myCurrentTimestamp = Date.now() + 100;
            this.tracking = true;
        }
    },
    methods: {
        toggleTracking() {
            if (!this.tracking) {
                this.startTracking(NONE_TASK);
            } else if (this.tracking && this.currentTimeEntry) {
                this.endTracking();
            }
        },
        startTracking(task) {
            this.currentTask = task;
            this.myCurrentTimestamp = Date.now() + 100;
            this.currentTimeEntry = { taskId: this.currentTask.id, start: Date.now() };
            this.tracking = true;
        },
        endTracking() {
            if (this.currentTimeEntry == null) return;
            this.currentTimeEntry.end = Date.now();
            if (this.currentTimeEntry.end - this.currentTimeEntry.start > 1000*60) {
                // Only store time entries over a minute
                db.timeEntries.add(this.currentTimeEntry);
            }
            this.tracking = false;
            this.currentTask = NONE_TASK;
            this.currentTimeEntry = null;
        },
    },
    computed: {
        elapsedTime() {
            return this.myCurrentTimestamp - this.currentTimeEntry.start;
        },
    },
    watch: {
        async keyCommand(key) {
            let task = await (key == ' ' ? NONE_TASK : db.tasks.where('hotkey').equals(key.toUpperCase()).first());
            if (this.tracking && task != null && task.id != this.currentTask.id) {
                this.endTracking();
                this.startTracking(task);
            }
        },
        currentTimestamp(timestamp) {
            this.myCurrentTimestamp = timestamp;
        },
        currentTimeEntry(newEntry) {
            if (newEntry == null) localStorage.removeItem('currentTimeEntry');
            if (newEntry != null) localStorage.setItem('currentTimeEntry', JSON.stringify(newEntry));
            eventBus.$emit('tracking-changed', newEntry);
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
