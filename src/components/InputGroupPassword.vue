<template>
  <div class="row no-wrap-sm items-center">
    <div class="flex items-center q-px-sm-md">
      {{ label }} :
    </div>

    <q-input 
      :modelValue="thePassword" 
      filled 
      dense
      :type="isPwd ? 'password' : 'text'"
      :class="classes"
      @update:modelValue="onTextchanged">
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

const onTextchanged = (val) => {
  thePassword.value = val;
};

</script>

<style scoped></style>
