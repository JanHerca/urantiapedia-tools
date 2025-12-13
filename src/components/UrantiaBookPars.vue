<template>
  <q-item clickable v-ripple class="q-py-none column items-start search-result-item">
    <div class="row q-py-xs full-width no-wrap">
      <div 
        v-for="(par, index) in pars" 
        :key="`par-${index}`" 
        :class="colClass" 
        class="q-px-xs"
        v-html="par"
      >
      </div>
    </div>
    <div class="row q-py-xs full-width no-wrap" :class="errorClass">
      <div 
        v-for="(ref, index) in refs" 
        :key="`ref-${index}`" 
        :class="colClass" 
        class="text-right q-px-xs row items-center justify-end"
      >
        <span class="q-mr-sm">{{ ref }}</span>
        <q-btn
          v-if="linkToCopy[index] !== ''"
          size="sm"
          color="secondary"
          label="Copy link"
          @click.stop="copyText(linkToCopy[index])"
          class="q-py-none q-px-xs q-ml-xs"
        />
        <q-btn
          v-if="textToCopy[index] !== ''"
          size="sm"
          color="secondary"
          label="Copy text"
          @click.stop="copyText(textToCopy[index])"
          class="q-py-none q-px-xs q-ml-xs"
        />
      </div>
    </div>
  </q-item>
</template>

<script setup>
import { computed } from 'vue';
import { useQuasar } from 'quasar';

const props = defineProps({
  pars: {
    type: Array,
    required: true,
  },
  refs: {
    type: Array,
    required: true,
  },
  linkToCopy: {
    type: Array,
    default: () => [],
  },
  textToCopy: {
    type: Array,
    default: () => [],
  },
  rowClass: {
    type: String,
    default: '',
  },
  errorClass: {
    type: String,
    default: '',
  }
});

const $q = useQuasar();

const colClass = computed(() => {
  return props.pars.length > 2 ? 'col-4' : 'col-6';
});

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    $q.notify({
      message: 'Text copied to clipboard',
      color: 'positive',
      icon: 'check',
      timeout: 1000,
    });
  } catch (err) {
    $q.notify({
      message: 'Error copying text',
      color: 'negative',
      icon: 'error',
      timeout: 1500,
    });
    console.error('Failed to copy text: ', err);
  }
};
</script>

<style lang="scss" scoped>
.search-result-item {
  min-height: unset;
}
</style>