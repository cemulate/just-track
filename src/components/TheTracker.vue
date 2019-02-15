<template>
<div id="main-area" class="box" v-on:click="toggleTracking" v-bind:style="{ 'background-color': currentTask.color }">
    <div class="columns is-vcentered is-centered">
        <div class="column is-narrow">
            <div class="columns is-centered">
                <div class="column is-narrow">
                    <span v-bind:class="{ 'soft': !tracking }">
                        {{ tracking ? this.currentTask.name : 'START' }}
                    </span>
                </div>
            </div>
            <div class="columns is-centered" v-if="tracking">
                <div class="column is-narrow">
                    <span class="soft">
                        {{ elapsedTime | elapsedTime(true) }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import db from '../lib/idb.js';

export default {
    data: () => ({
        tasks: [],
        tracking: false,
        currentTask: { id: 0, name: 'None' },
        currentTimeEntry: null,
        currentTimestamp: null,

        timeUpdateInterval: null,
        documentKeyDownHandler: null,
    }),
    methods: {
        keyDown(key) {
            let task = key == ' ' ? { id: 0, name: 'None' } : this.tasks.find(x => x.hotkey == key.toUpperCase());
            if (task != null && task.id != this.currentTask.id) {
                if (this.currentTimeEntry != null) {
                    this.currentTimeEntry.end = Date.now();
                    if (this.currentTimeEntry.end - this.currentTimeEntry.start > 1000*60) {
                        // Only store time entries over a minute
                        db.timeEntries.add(this.currentTimeEntry);
                    }
                }
                this.currentTask = task;
                this.currentTimestamp = Date.now();
                this.currentTimeEntry = { taskId: this.currentTask.id, start: Date.now() };
            }
        },
        toggleTracking() {
            if (!this.tracking) {
                this.currentTask = { id: 0, name: 'None' };
                this.currentTimestamp = Date.now();
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
            return this.currentTimestamp - this.currentTimeEntry.start;
        },
    },
    async created() {
        this.documentKeyDownHandler = event => this.keyDown(event.key);
        document.addEventListener('keydown', this.documentKeyDownHandler);
        this.timeUpdateInterval = window.setInterval(() => this.currentTimestamp = Date.now(), 1000 * 60);
    },
    destroyed() {
        document.removeEventListener('keydown', this.documentKeyDownHandler);
        if (this.timeUpdateInterval != null) window.clearInterval(this.timeUpdateInterval);
    },
    async mounted() {
        this.tasks = await db.tasks.toArray();
    },
}
</script>

<style lang="scss">
@import 'bulma/sass/utilities/mixins.sass';
#root {
    #main-area {
        div.columns {
            height: 100%;
            span {
                font-size: 6vw;
                font-weight: bold;
                &.soft {
                    opacity: 0.5;
                }
            }
        }
        @include from($tablet) {
            height: calc(100vh - 148px);
        }
    }
}
</style>
