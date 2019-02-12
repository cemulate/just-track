import './styles/theme.scss';
import Vue from 'vue';
import App from './components/App.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faExternalLinkAlt, faTasks, faPlus, faTrashAlt, faKeyboard } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';
library.add(faExternalLinkAlt, faTasks, faPlus, faTrashAlt, faKeyboard, faClock);

Vue.component('font-awesome-icon', FontAwesomeIcon);

if (navigator.serviceWorker != null) {
    window.addEventListener('load', () => navigator.serviceWorker.register('service-worker.js'));
}

const body = document.getElementsByTagName('body')[0];
body.setAttribute('id', 'app');
new Vue({
    el: '#app',
    render: h => h(App),
});
