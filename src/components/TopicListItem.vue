<template>
  <q-item 
    clickable 
    v-ripple 
    :active="isActive" 
    :class="itemClasses"
    @click="$emit('select-topic', topic)" 
    active-class="bg-blue-1 text-primary" 
    dense>
    <q-item-section avatar>
      <q-icon 
        v-if="topic.revised" 
        color="green" 
        name="check"
      />
    </q-item-section>
    <q-item-section> {{ topic.name }}</q-item-section>
    <q-item-section side>
      <q-badge 
        v-if="errLen > 0" 
        color="red" 
        :label="errLen" 
      />
      <q-item-label 
        :class="{ 'text-primary': isActive }"
      >
      {{ topic.type }}
      </q-item-label>
    </q-item-section>

  </q-item>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  topic: {
    type: Object,
    required: true,
    default: () => ({
      name: 'Default Topic',
      type: 'Other',
      revised: false,
      errors: [],
    }),
  },
  topicEditing: {
    type: String,
    default: null,
  },
});

const errLen = computed(() => props.topic.errors ? props.topic.errors.length : 0);

const isActive = computed(() => props.topicEditing === props.topic.name);

const itemClasses = [
  'q-px-none',
];

const errorClasses = computed(() => {
  return errLen.value > 0 ? 'bg-red-1 text-red-10' : '';
});

defineEmits(['select-topic']);
</script>