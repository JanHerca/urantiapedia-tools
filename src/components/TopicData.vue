<template>
  <q-card class="q-pa-sm">
    <div class="col column no-wrap q-mr-md" style="width: 260px;">
      <div class="row q-gutter-sm q-mb-sm">
        <RoundButton 
          icon="add_circle" 
          title="Add topic" 
          @click="$emit('add-topic')" />
        <RoundButton 
          icon="remove_circle" 
          title="Remove topic" 
          color="negative" 
          @click="$emit('remove-topic')" />
        <RoundButton 
          icon="drive_file_rename_outline" 
          title="Rename topic" 
          @click="$emit('rename-topic')"/>
        <RoundButton 
          icon="save" 
          title="Save changes" 
          @click="$emit('save-changes')"/>
      </div>
      <q-input 
        dense outlined 
        v-model="proxyTopicName" 
        label="Name" 
        class="q-mb-sm" />
      <q-input 
        dense outlined 
        v-model="proxyTopicUrl" 
        label="URL" 
        class="q-mb-sm">
        <template v-slot:append>
          <q-btn dense flat icon="link" type="a" :href="topicUrl" target="_blank" />
        </template>
      </q-input>
      <InputEdit 
        label="Aliases" 
        v-model="proxyTopicAliases" 
        @click="$emit('edit-aliases')" />
      <InputEdit 
        label="Refs" 
        v-model="proxyTopicRefs" 
        @click="$emit('edit-refs')" />
      <InputEdit 
        label="See Also" 
        v-model="proxyTopicSeeAlso" 
        @click="$emit('edit-see-also')" />
      <InputEdit 
        label="Links" 
        v-model="proxyTopicLinks" 
        @click="$emit('edit-links')" />
      <InputSelect 
        dense label="Category" 
        :options="topicFilters" 
        v-model="proxyTopicCategory" />
      <InputCheck 
        v-model="proxyTopicRevised" 
        label="Revised" />
    </div>
  </q-card>
</template>

<script setup>
import { computed } from 'vue';
import RoundButton from 'src/components/RoundButton.vue';
import InputEdit from 'src/components/InputEdit.vue';
import InputSelect from 'src/components/InputSelect.vue';
import InputCheck from 'src/components/InputCheck.vue';

//Props
const props = defineProps({
  topicName: { type: String, default: '' },
  topicUrl: { type: String, default: '' },
  topicAliases: { type: [String, Array], default: () => [] },
  topicRefs: { type: [String, Array], default: () => [] },
  topicSeeAlso: { type: [String, Array], default: () => [] },
  topicLinks: { type: [String, Array], default: () => [] },
  topicCategory: { type: [String, Object], default: null },
  topicRevised: { type: Boolean, default: false },
  topicFilters: { type: Array, default: () => [] },
});

//Emits
const emit = defineEmits([
  'update:topicName',
  'update:topicUrl',
  'update:topicAliases',
  'update:topicRefs',
  'update:topicSeeAlso',
  'update:topicLinks',
  'update:topicCategory',
  'update:topicRevised',
  'add-topic',
  'remove-topic',
  'rename-topic',
  'save-changes',
  'edit-aliases',
  'edit-refs',
  'edit-see-also',
  'edit-links'
]);

//Computeds
const proxyTopicName = computed({
  get: () => props.topicName,
  set: (val) => emit('update:topicName', val)
});

const proxyTopicUrl = computed({
  get: () => props.topicUrl,
  set: (val) => emit('update:topicUrl', val)
});

const proxyTopicAliases = computed({
  get: () => props.topicAliases,
  set: (val) => emit('update:topicAliases', val)
});

const proxyTopicRefs = computed({
  get: () => props.topicRefs,
  set: (val) => emit('update:topicRefs', val)
});

const proxyTopicSeeAlso = computed({
  get: () => props.topicSeeAlso,
  set: (val) => emit('update:topicSeeAlso', val)
});

const proxyTopicLinks = computed({
  get: () => props.topicLinks,
  set: (val) => emit('update:topicLinks', val)
});

const proxyTopicCategory = computed({
  get: () => props.topicCategory,
  set: (val) => emit('update:topicCategory', val)
});

const proxyTopicRevised = computed({
  get: () => props.topicRevised,
  set: (val) => emit('update:topicRevised', val)
});
</script>