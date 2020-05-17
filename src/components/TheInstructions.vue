<template>
<div>
<article id="instructions" class="message is-info" v-if="show">
    <div class="message-header">
        <p>Instructions</p>
        <button class="delete" v-on:click="dismiss"></button>
    </div>
    <div class="message-body">
        <div class="content">
            <p>
                To begin recording time, click the tracker (<strong>START</strong>).
            </p>
            <ul>
                <li>When recording, the tracker will implicitly default to the <strong>None</strong> task.</li>
                <li>To switch to another task, add one in the task list and press the <strong>clock button</strong>, or its assigned <strong>hotkey</strong>.</li>
                <li>To return to tracking the <strong>None</strong> task, press the <strong>spacebar</strong>. This task is meant to be used for breaks, lunch, or otherwise tracked but unfocused time.</li>
                <li>To stop tracking entirely, click the tracker again.</li>
            </ul>
            <p>
                A time entry in the history is created when switching off the tracked task.
                No time entries shorter than a minute are recorded.
            </p>
        </div>
    </div>
</article>
</div>
</template>

<script>
export default {
    data: () => ({
        show: false,
    }),
    created() {
        let val = window.localStorage.getItem('instructions-dismissed');
        this.show = (val == null || val == '0');
    },
    methods: {
        dismiss() {
            window.localStorage.setItem('instructions-dismissed', '1');
            this.show = false;
        },
    }
};
</script>

<style lang="scss">
#instructions {
    margin-top: 15px;
}
</style>