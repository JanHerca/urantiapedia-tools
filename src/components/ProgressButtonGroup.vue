<template>
  <q-btn-group spread>
    <q-btn 
      :color="color"
      :class="classes"
      :disabled="processing1"
      @click="$emit('click1')">
      <div v-if="processing1" class="row items-center q-pr-sm">
        <q-spinner
          color="white"
          size="1em"
        />
      </div>
      {{ label1 }}
    </q-btn>
    <q-btn 
      :color="color"
      :class="classes"
      :disabled="processing2"
      @click="$emit('click2')">
      <div v-if="processing2" class="row items-center q-pr-sm">
        <q-spinner
          color="white"
          size="1em"
        />
      </div>
      {{ label2 }}
    </q-btn>
  </q-btn-group>
</template>

<script setup>

const props = defineProps({
  label1: { type: String },
  label2: { type: String },
  processing1: { type: Boolean, default: false },
  processing2: { type: Boolean, default: false },
  color: { type: String, default: 'primary'},
  classes: { type: String, default: 'full-width q-mb-xs-sm'}
});

defineEmits(['click1', 'click2']);
</script>

<style scoped></style>