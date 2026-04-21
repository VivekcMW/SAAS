import SaasworldLogo from '~/components/icons/saasworld-logo.vue';

export default defineNuxtPlugin({
  name: 'components',
  setup(nuxtApp) {
    nuxtApp.vueApp.component('SaasworldLogo', SaasworldLogo);
  }
});
