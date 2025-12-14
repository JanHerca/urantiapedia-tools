<template>
  <q-list dense separator>
    <q-item v-if="hasTopicErrors" tag="div">
      <q-item-section>
        <div class="row q-col-gutter-sm">
          <div v-for="(errorGroup, index) in topicErrors" :key="index" class="col-4">
            <div v-for="(desc, idx) in errorGroup" :key="idx">
              <div class="bg-red-1 text-red-10 q-pa-xs q-mb-sm rounded-borders text-caption">
                {{ desc }}
              </div>
            </div>
          </div>
        </div>
      </q-item-section>
    </q-item>

    <TopicLine
      v-for="(topicLine, lineIndex) in topicLines" 
      :key="lineIndex" 
      :topicLine="topicLine" 
      :topicLineEditing="topicLineEditing"
      :darkTheme="darkTheme"
      @select-topic-line="$emit('select-topic-line', topicLine)"
    />

    <q-item v-if="hasOpenAICopies" dense class="q-py-sm q-px-none" tag="div">
      <q-item-section>
        <div class="row q-col-gutter-sm justify-end">
          <div 
            v-for="(text, index) in topicOpenAI" 
            :key="index" 
            class="col-4 text-right">
            <q-btn 
              v-if="text" 
              color="secondary" 
              size="sm" 
              class="q-px-sm" 
              type="button"
              @click="$emit('copy-openai', text)">
              Copy text
            </q-btn>
          </div>
        </div>
      </q-item-section>
    </q-item>

  </q-list>
</template>

<script setup>
import { computed } from 'vue';
import TopicLine from 'src/components/TopicLine.vue';

const props = defineProps({
  topicErrors: {
    type: Array,
    default: () => [],
  },
  topicLines: {
    type: Array,
    default: () => [],
  },
  topicOpenAI: {
    type: Array,
    default: () => [null, null, null],
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

const hasTopicErrors = computed(() => props.topicErrors && props.topicErrors.length > 0);

const hasOpenAICopies = computed(() => props.topicOpenAI.some(text => text !== null));

defineEmits(['copy-openai', 'select-topic-line']);
</script>

<style scoped>

</style>