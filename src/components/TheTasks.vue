<template>
<div>
<template class="" v-for="(task, index) in tasks">
    <nav class="level">
        <div class="level-left">
            <div class="level-item">
                <a class="button" v-bind:disabled="task.id == trackedTaskId" v-on:click="requestTrack(task)">
                    <font-awesome-icon v-bind:icon="['far', 'clock']"></font-awesome-icon>
                </a>
                &nbsp;&nbsp;
                <strong>{{ task.name }}</strong>
            </div>
        </div>
        <div class="level-right">
            <div class="level-item">
                <color-picker v-bind:color="task.color" v-on:pick-color="setTaskColor(task, $event)"></color-picker>
            </div>
            <div class="level-item">
                <div class="field">
                    <div class="control has-icons-left">
                        <div class="select">
                            <select v-model="task.hotkey" v-on:change="taskHotkeyChanged(task)">
                                <option v-for="letter in alphabet" v-bind:value="letter">{{ letter }}</option>
                            </select>
                        </div>
                        <div class="icon is-small is-left">
                            <font-awesome-icon icon="keyboard"></font-awesome-icon>
                        </div>
                    </div>
                </div>
            </div>
            <div class="level-item">
                <a class="button is-outlined" v-on:click="deleteTaskById(task.id)" v-bind:disabled="task.id == trackedTaskId">
                    <font-awesome-icon icon="trash-alt"></font-awesome-icon>
                </a>
            </div>
        </div>
    </nav>
    <hr v-if="index < tasks.length - 1">
</template>
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
import ColorPicker from './ColorPicker.vue';
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
        async setTaskColor(task, color) {
            task.color = color;
            await db.tasks.update(task.id, task);
            eventBus.$emit('task-updated', task);
        },
        async taskHotkeyChanged(task) {
            await db.tasks.update(task.id, task);
            eventBus.$emit('task-updated', task);
        },
        requestTrack(task) {
            eventBus.$emit('tracking-request', task);
        },
    },
    components: {
        'color-picker': ColorPicker,
    },
}
</script>

<style lang="scss" scoped>
</style>
