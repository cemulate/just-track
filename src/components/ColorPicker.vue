<template>
<div id="root">
<template v-if="expanded">
    <a class="button"
       v-for="c in colorChoices"
       v-bind:style="{ 'background-color': c, 'border': color == c ? '1px solid black' : '' }"
       v-on:click="chooseColor(c)">
        &nbsp;&nbsp;&nbsp;
    </a>
</template>
&nbsp;
<a class="button" v-bind:style="{ 'background-color': color }" v-on:click="expanded = !expanded">&nbsp;&nbsp;&nbsp;</a>
</div>
</template>

<script>
// const colorChoices = new Array(5).fill().map((_, i) => `hsl(${ i * 60 }, 100%, 50%)`);
const colorChoices = [
    '#FF4136',
    '#39CCCC',
    '#9BC53D',
    '#FFE066',
    '#45CB85',
    '#CBD2D0',
    '#F2ED6F',
];

export default {
    data: () => ({
        expanded: false,
        colorChoices,
    }),
    props: {
        color: String,
    },
    methods: {
        chooseColor(color) {
            this.expanded = false;
            this.$emit('pick-color', color);
        }
    },
}
</script>

<style>
</style>
