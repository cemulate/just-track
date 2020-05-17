<template>
<div>
<transition-group name="simple-list" tag="div">
<div class="columns is-multiline is-vcentered" v-for="(task, index) in tasks" v-bind:key="task.id">
    <div class="column is-narrow-widescreen is-full-desktop has-text-vcentered">
        <a class="button" v-bind:disabled="task.id == trackedTaskId" v-on:click="requestTrack(task)">
            <font-awesome-icon v-bind:icon="['far', 'clock']"></font-awesome-icon>
        </a>
        &nbsp;
        <strong>{{ task.name }}</strong>
    </div>
    <div class="column is-hidden-touch is-hidden-desktop-only"></div>
    <div class="column is-narrow-widescreen is-full-desktop">
        <div class="field has-addons">
            <div class="control">
                <input type="color" class="input" v-model="task.color" v-on:change="taskChanged(task)">
            </div>
            <div class="control has-icons-left is-expanded">
                <div class="select is-fullwidth">
                    <select v-model="task.hotkey" v-on:change="taskChanged(task)">
                        <option v-for="letter in alphabet" v-bind:value="letter">{{ letter }}</option>
                    </select>
                </div>
                <div class="icon is-small is-left">
                    <font-awesome-icon icon="keyboard"></font-awesome-icon>
                </div>
            </div>
            <div class="control">
                <button class="button is-outlined" v-on:click="deleteTaskById(task.id)" v-bind:disabled="task.id == trackedTaskId">
                    <font-awesome-icon icon="trash-alt"></font-awesome-icon>
                </button>
            </div>
        </div>
    </div>
</div>
</transition-group>
<hr>
<div class="field has-addons" style="width: 100%"> <!-- Hack? -->
    <div class="control has-icons-left is-expanded">
        <span class="icon is-left"><font-awesome-icon icon="plus"></font-awesome-icon></span>
        <input type="text" class="input" placeholder="New task name" maxlength="80" v-model="newTaskName" v-on:keyup.enter="createNewTask">
    </div>
    <div class="control">
        <a tabindex="0" class="button is-link" v-on:click="createNewTask" v-on:keyup.enter="createNewTask">Add</a>
    </div>
</div>
</div>
</template>

<script>
import db from '../lib/idb.js';
import { eventBus } from '../lib/event-bus';

export default {
    data: () => ({
        tasks: [],
        newTaskName: '',
        trackedTaskId: null,

        alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    }),
    async mounted() {
        this.fetchTasks();
        eventBus.$on('tracking-changed', newTimeEntry => {
            if (newTimeEntry != null) this.trackedTaskId = newTimeEntry.taskId;
            if (newTimeEntry == null) this.trackedTaskId = null;
        });
    },
    methods: {
        async fetchTasks() {
            this.tasks = await db.tasks.where('deleted').equals(0).toArray();
        },
        async createNewTask() {
            if (this.newTaskName.length == 0) return;
            await db.tasks.add({ name: this.newTaskName, color: '#ffffff', hotkey: 'A', deleted: 0 });
            this.fetchTasks();
            this.newTaskName = '';
        },
        async deleteTaskById(id) {
            await db.tasks.update(id, { deleted: true });
            this.fetchTasks();
        },
        async taskChanged(task) {
            await db.tasks.update(task.id, task);
            eventBus.$emit('task-updated', task);
        },
        requestTrack(task) {
            eventBus.$emit('tracking-request', task);
        },
    },
}
</script>

<style lang="scss">
.simple-list-enter-active, .simple-list-leave-active {
    transition: opacity 0.25s ease;
}
.simple-list-enter, .simple-list-leave-to {
    opacity: 0;
}
</style>
