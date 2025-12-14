<template>
  <q-item 
    clickable 
    v-ripple 
    :active="isActive" 
    class="column topic-line q-px-none q-py-xs"
    @click="$emit('select-topic-line', topicLine)" 
    :active-class="darkTheme ? 'bg-blue-1 text-grey-10' : 'bg-blue-1 text-grey-10'" 
    dense>

    <div class="row q-col-gutter-sm">
      <div 
        v-for="(line, idx) in topicLine.lines" 
        :key="idx" class="col-4">
        <div class="text-body2">{{ line.text }}</div>

        <template v-if="line.openAI">
          <div 
            v-if="line.openAI.value" 
            class="bg-blue-1 text-blue-10 q-pa-xs q-mt-xs rounded-borders text-caption">
            <span v-html="`<em>${line.openAI.value}</em>`"></span>
          </div>
          <div 
            v-else-if="line.openAI.error"
            class="bg-red-1 text-red-10 q-pa-xs q-mt-xs rounded-borders text-caption">
            <span v-html="`<em>${line.openAI.error}</em>`"></span>
          </div>
        </template>
      </div>
    </div>

    <div 
      v-if="topicLine.errors && topicLine.errors.length" 
      class="row q-col-gutter-sm q-mt-sm">
      <div 
        v-for="(topicLineError, errorIndex) in topicLine.errors" 
        :key="errorIndex" class="col-4">
        <div v-for="(desc, descIndex) in topicLineError" :key="descIndex">
          <div class="bg-red-1 text-red-10 q-pa-xs q-mb-sm rounded-borders text-caption">
            {{ desc }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="topicLine.refs" class="row q-mt-xs">
      <div class="col-12 text-right text-caption text-grey-6">
        {{ topicLine.refs }}
      </div>
    </div>
  </q-item>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  topicLine: {
    type: Object,
    default: () => {},
  },
  topicLineEditing: {
    type: Number,
    default: null,
  },
  darkTheme: {
    type: Boolean,
    default: false
  }
});

const isActive = computed(() => props.topicLineEditing === props.topicLine.fileline);

defineEmits(['select-topic-line']);
</script>

<style scoped>
.topic-line {
  border-left: 5px solid transparent;
  transition: border-left 0.2s;
}
.topic-line.bg-blue-1 {
  border-left-color: var(--q-color-primary);
}
</style>