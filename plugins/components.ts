import MoonmartLogo from '~/components/icons/MoonmartLogo.vue';

export default defineNuxtPlugin({
  name: 'components',
  setup(nuxtApp) {
    nuxtApp.vueApp.component('MoonmartLogo', MoonmartLogo);
  }
});
