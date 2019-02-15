<template>
<div id="root">
<template v-if="expanded">
    <a class="button"
       v-for="c in colorChoices"
       v-bind:style="{ 'background-color': c }"
       v-bind:disabled="c == color"
       v-on:click="$emit('pick-color', c)">
        &nbsp;&nbsp;&nbsp;
    </a>
</template>
&nbsp;
<a class="button" v-bind:style="{ 'background-color': color }" v-on:click="expanded = !expanded">&nbsp;&nbsp;&nbsp;</a>
</div>
</template>

<script>
const colorChoices = new Array(10).fill().map((_, i) => `hsl(${ i * 36 }, 40%, 50%)`);

export default {
    data: () => ({
        expanded: false,
        colorChoices,
    }),
    props: {
        color: String,
    },
}
</script>

<style>
</style>
