<template>
  <q-banner 
    dense 
    rounded 
    class="force-wrap"
    :class="['bg-' + type, dark ? 'text-dark' : 'text-white', classes].join(' ')"
  >
    <template v-slot:avatar>
      <q-icon :name="iconName" :color="dark ? 'dark' : 'white'" />
    </template>
    {{ text }}
  </q-banner>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  text: { type: String, default: 'Label' },
  classes: { type: String, default: '' },
  // primary, secondary, accent, dark, positive, negative, warning, info
  type: { type: String, default: 'primary' },
  dark: { type: Boolean, default: false }
});

const iconName = computed(() => {
  switch (props.type) {
    case 'primary':
      return 'info';
    case 'secondary':
      return 'info';
    case 'accent':
      return 'info';
    case 'dark':
      return 'info';
    case 'positive':
      return 'check_circle';
    case 'negative':
      return 'error';
    case 'warning':
      return 'warning';
    case 'info':
      return 'info';
    default:
      return 'info';
  }
});
</script>

<style scoped>
.force-wrap {
  word-break: break-all;
  overflow-wrap: break-word;
}
</style>