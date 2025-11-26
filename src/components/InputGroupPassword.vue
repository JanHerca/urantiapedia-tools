<template>
  <div class="row no-wrap items-center">
    <div class="flex items-center q-px-sm text-no-wrap q-mr-sm">
      {{ label }}
    </div>

    <q-input 
      v-model="thePassword" 
      filled 
      dense
      :type="isPwd ? 'password' : 'text'"
      class="col"
      :class="classes"
    >
      <template v-slot:append>
        <q-icon 
          :name="isPwd ? 'visibility_off' : 'visibility'" 
          class="cursor-pointer" 
          @click="isPwd = !isPwd" />
      </template>
    </q-input>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isPwd = ref(true);

const thePassword = defineModel({
  type: String,
  required: true
});

const props = defineProps({
  label: { type: String, default: 'Label' },
  classes: { type: String, default: '' }
});

</script>

<style scoped></style>
