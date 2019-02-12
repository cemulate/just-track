<template>
<div id="root">
<a class="button is-large is-fullwidth" v-on:click="toggleTracking()">
    {{ tracking ? 'Tracking Task: ' + this.currentTask.name : 'Start Tracking' }}
</a>
<nav class="level">
    <p class="level-item has-text-centered">
        <strong class="is-size-1">Hey</strong>
    </p>
</nav>
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

        documentKeyDownHandler: null,
    }),
    methods: {
        keyDown(key) {
            let task = this.tasks.find(x => x.hotkey == key.toUpperCase());
            if (task != null) {
                if (this.currentTimeEntry != null) {
                    this.currentTimeEntry.end = Date.now();
                    if (this.currentTimeEntry.end - this.currentTimeEntry.start > 1000*60) {
                        // Only store time entries over a minute
                        db.timeEntries.add(this.currentTimeEntry);
                    }
                }
                this.currentTask = task;
                this.currentTimeEntry = { taskId: this.currentTask.id, start: Date.now() };
            }
        },
        toggleTracking() {
            if (!this.tracking) {
                this.currentTask = { id: 0, name: 'None' };
                this.currentTimeEntry = { taskId: this.currentTask.id, start: Date.now() };
                this.tracking = true;
            } else if (this.tracking && this.currentTimeEntry) {
                this.currentTimeEntry.end = Date.now();
                if (this.currentTimeEntry.end - this.currentTimeEntry.start > 1000*60) {
                    // Only store time entries over a minute
                    db.timeEntries.add(this.currentTimeEntry);
                }
                this.tracking = false;
            }
        },
    },
    async created() {
        this.documentKeyDownHandler = event => this.keyDown(event.key);
        document.addEventListener('keydown', this.documentKeyDownHandler);
    },
    destroyed() {
        document.removeEventListener('keydown', this.documentKeyDownHandler);
    },
    async mounted() {
        this.tasks = await db.tasks.toArray();
    },
}
</script>

<style>
</style>
