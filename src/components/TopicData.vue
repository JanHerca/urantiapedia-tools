<template>
  <div class="col-auto column no-wrap q-mr-md" style="width: 260px;">
    <div class="row q-gutter-sm q-mb-sm">
      <RoundButton icon="add_circle" title="Add topic" />
      <RoundButton icon="remove_circle" title="Remove topic" color="negative" />
      <RoundButton icon="drive_file_rename_outline" title="Rename topic" />
      <RoundButton icon="save" title="Save changes" />
    </div>
    <q-input dense outlined v-model="topicName" label="Name" class="q-mb-sm" />
    <q-input dense outlined v-model="topicUrl" label="URL" class="q-mb-sm">
      <template v-slot:append>
        <q-btn dense flat icon="link" type="a" :href="topicUrl" target="_blank" />
      </template>
    </q-input>
    <InputEdit label="Aliases" v-model="topicAliases" @click="editAlias" />
    <InputEdit label="Refs" v-model="topicRefs" @click="editRefs" />
    <InputEdit label="See Also" v-model="topicSeeAlso" @click="editSeeAlso" />
    <InputEdit label="Links" v-model="topicLinks" @click="editLinks" />
    <InputSelect dense label="Category" :options="topicFilters" v-model="topicCategory" />
    <InputCheck v-model="topicRevised" label="Revised" />
  </div>
</template>