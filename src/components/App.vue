<template>
<body v-on:keydown="keyDown">
<the-navbar></the-navbar>
<div class="container">
    <the-tracker v-bind:current-timestamp="currentTimestamp" v-bind:key-command="trackerKeyCommand"></the-tracker>
    <div class="columns">
        <div class="column is-2">
            <aside class="menu">
                <ul class="menu-list">
                    <li><a v-bind:class="{ 'is-active': mode == 'tasks' }" v-on:click="mode = 'tasks'">
                        <font-awesome-icon icon="tasks"></font-awesome-icon>&nbsp; Tasks
                    </a></li>
                    <li><a v-bind:class="{ 'is-active': mode == 'history' }" v-on:click="mode = 'history'">
                        <font-awesome-icon icon="history"></font-awesome-icon>&nbsp; History
                    </a></li>
                </ul>
            </aside>
        </div>
        <div class="column is-10">
            <the-tasks v-if="mode == 'tasks'"></the-tasks>
            <the-history v-if="mode == 'history'"></the-history>
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
            if (event.target.tagName == 'BODY') this.trackerKeyCommand = event.key;
        }
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
    },
};
</script>

<style lang="scss">
</style>
