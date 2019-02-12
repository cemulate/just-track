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
const colorChoices = [
    '#1FBC9C',
    '#1CA085',
    '#2ECC70',
    '#27AF60',
    '#3398DB',
    '#2980B9',
    '#A463BF',
    '#8E43AD',
    '#3D556E',
    '#222F3D',
    '#F2C511',
    '#F39C19',
    '#E84B3C',
    '#C0382B',
    '#DDE6E8',
    '#BDC3C8',
];

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
