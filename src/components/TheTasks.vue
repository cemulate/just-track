<template>
<div id="root">
<div class="box" v-for="task in tasks">
    <nav class="level">
        <div class="level-left">
            <div class="level-item">
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
                <a class="button is-outlined" v-on:click="deleteTaskById(task.id)">
                    <font-awesome-icon icon="trash-alt"></font-awesome-icon>
                </a>
            </div>
        </div>
    </nav>
</div>
<!-- <div class="columns is-multiline">
    <div class="column is-4" v-for="task in tasks">
        <div class="card">
            <header class="card-header">
                <p class="card-header-title">{{ task.name }}</p>
                <a class="card-header-icon" v-on:click="deleteTask(task.id)">
                    <span class="icon">
                        <font-awesome-icon icon="trash-alt"></font-awesome-icon>
                    </span>
                </a>
            </header>
            <div class="card-content">
                <div class="content">
                </div>
            </div>
        </div>
    </div>
</div> -->
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

export default {
    data: () => ({
        tasks: [],
        newTaskName: '',

        alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    }),
    async created() {
        this.tasks = await db.tasks.toArray();
    },
    methods: {
        async createNewTask() {
            if (this.newTaskName.length == 0) return;
            await db.tasks.add({ name: this.newTaskName, color: '#ffffff', hotkey: 'A' });
            this.tasks = await db.tasks.toArray();
            this.newTaskName = '';
        },
        async deleteTaskById(id) {
            await db.tasks.delete(id);
            console.log(db.tasks);
            this.tasks = await db.tasks.toArray();
        },
        async setTaskColor(task, color) {
            task.color = color;
            await db.tasks.update(task.id, task);
        },
        async taskHotkeyChanged(task) {
            await db.tasks.update(task.id, task);
        },
    },
    components: {
        'color-picker': ColorPicker,
    },
}
</script>

<style>
</style>
