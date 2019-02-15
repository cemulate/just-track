<template>
<body id="root">
<the-navbar></the-navbar>
<section class="section">
    <div class="columns">
        <div class="column is-3">
            <aside class="menu">
                <ul class="menu-list">
                    <li><a v-bind:class="{ 'is-active': mode == 'track' }" v-on:click="mode = 'track'">
                        <font-awesome-icon v-bind:icon="['far', 'clock']"></font-awesome-icon>&nbsp; Track
                    </a></li>
                    <li><a v-bind:class="{ 'is-active': mode == 'tasks' }" v-on:click="mode = 'tasks'">
                        <font-awesome-icon icon="tasks"></font-awesome-icon>&nbsp; Tasks
                    </a></li>
                    <li><a v-bind:class="{ 'is-active': mode == 'history' }" v-on:click="mode = 'history'">
                        <font-awesome-icon icon="history"></font-awesome-icon>&nbsp; History
                    </a></li>
                </ul>
            </aside>
        </div>
        <div class="column is-9">
            <the-tracker v-if="mode == 'track'"></the-tracker>
            <the-tasks v-if="mode == 'tasks'"></the-tasks>
            <the-history v-if="mode == 'history'"></the-history>
        </div>
    </div>
</section>
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
        mode: 'track',
    }),
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
