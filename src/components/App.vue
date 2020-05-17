<template>
<body v-on:keydown="keyDown">
<the-navbar></the-navbar>
<div class="container is-fluid">
    <the-instructions></the-instructions>
    <the-tracker v-bind:current-timestamp="currentTimestamp" v-bind:key-command="trackerKeyCommand"></the-tracker>
    <div class="columns is-desktop">
        <div class="column is-5-widescreen is-5-desktop is-12-tablet">
            <the-tasks></the-tasks>
        </div>
        <div class="column is-7-widescreen is-7-desktop is-12-tablet">
            <the-history></the-history>
        </div>
    </div>
</div>
</body>
</template>

<script>
import db from '../lib/idb.js';

import TheNavbar from './TheNavbar.vue';
import TheTasks from './TheTasks.vue';
import TheTracker from './TheTracker.vue';
import TheHistory from './TheHistory.vue';
import TheInstructions from './TheInstructions.vue';

export default {
    data: () => ({
        mode: 'tasks',

        trackerKeyCommand: null,
        currentTimestamp: null,
        keyDownHandler: null,
        timeUpdateInterval: null,
    }),
    methods: {
        keyDown(event) {
            if (event.target.tagName == 'BODY') {
                if (event.key == ' ') event.preventDefault();
                this.trackerKeyCommand = event.key;
            }
        },
    },
    async created() {
        this.timeUpdateInterval = window.setInterval(() => this.currentTimestamp = Date.now(), 1000 * 60);
    },
    destroyed() {
        if (this.timeUpdateInterval != null) window.clearInterval(this.timeUpdateInterval);
    },
    components: {
        'the-navbar': TheNavbar,
        'the-tasks': TheTasks,
        'the-tracker': TheTracker,
        'the-history': TheHistory,
        'the-instructions': TheInstructions,
    },
};
</script>

<style lang="scss">
</style>
