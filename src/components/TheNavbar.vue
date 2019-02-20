<template>
<nav class="navbar is-primary">
    <div class="navbar-brand">
        <a class="navbar-item"><strong>Just Track</strong></a>
        <a role="button" class="navbar-burger" v-on:click="displayNavbarMenu = !displayNavbarMenu">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
    </div>
    <div class="navbar-menu" v-bind:class="{ 'is-active': displayNavbarMenu }">
        <div class="navbar-start">
        </div>
        <div class="navbar-end">
            <a class="navbar-item" target="_blank" href="https://github.com/cemulate/just-track">
                <font-awesome-icon icon="external-link-alt"></font-awesome-icon>
                &nbsp; View on Github
            </a>
        </div>
    </div>
</nav>
</template>

<script>
export default {
    data: () => ({
        displayNavbarMenu: false,
    }),
}
</script>

<style>

</style>
