<template>
  <q-page class="q-pa-sm-md">
    <div class="row">
      <div class="col">
        <InputGroupSelect
          id="drpTranslateLanguage1"
          label="Origin Language"
          :options="allLanguages"
          v-model="translateSourceLanguage"
          class="q-pa-sm-none q-mb-sm-md"
          classes="full-width"
        />
      </div>
      <div class="col">
        <InputGroupSelect
          id="drpTranslateLanguage2"
          label="Target Language"
          placeholder="Browse path"
          :options="allLanguages"
          v-model="translateTargetLanguage"
          class="q-pa-sm-none q-mb-sm-md"
          classes="full-width"
        />
      </div>
    </div>
    <InputGroupFolder
      id="fnTranslateOriginFolder"
      label="Origin folder"
      class="q-pa-sm-none q-mb-sm-md"
      classes="full-width"
    />
    <div class="form-group row p-0 mb-2">
      <div class="input-group input-group-sm col-sm-12">
        <div class="input-group-prepend">
          <span id="lblTranslateOriginFolder" class="input-group-text">Origin folder:</span>
        </div>
        <input id="fnTranslateOriginFolder" class="form-control" type="text" placeholder="Browse path"
          readonly="readonly" />
        <div class="input-group-append">
          <button id="fnTranslateOriginClear" class="btn btn-sm btn-secondary" type="button"><i
              class="bi-x-lg"></i></button>
          <button id="fnTranslateOriginOpen" class="btn btn-sm btn-secondary" type="button"><i
              class="bi-file-earmark"></i></button>
        </div>
      </div>
    </div>
    <div class="form-group row p-0 mb-2">
      <div class="input-group input-group-sm col-sm-12">
        <div class="input-group-prepend">
          <span id="lblTranslateTargetFolder" class="input-group-text">Target folder:</span>
        </div>
        <input id="fnTranslateTargetFolder" class="form-control" type="text" placeholder="Browse path"
          readonly="readonly" />
        <div class="input-group-append">
          <button id="fnTranslateTargetClear" class="btn btn-sm btn-secondary" type="button"><i
              class="bi-x-lg"></i></button>
          <button id="fnTranslateTargetOpen" class="btn btn-sm btn-secondary" type="button"><i
              class="bi-file-earmark"></i></button>
        </div>
      </div>
    </div>
    <div class="form-group row p-0 mb-2">
      <div class="col-sm-10">
        <button id="translateButton" class="btn btn-sm btn-secondary" type="button">Translate</button>
        <button id="estimateButton" class="btn btn-sm btn-secondary" type="button">Estimate</button>
      </div>
      <div class="col-sm-2">
        <div class="spinner-border d-none" role="status" id="translateProgress"></div>
      </div>
    </div>
    <div class="form-group row p-0 mb-0 logContainer">
      <div class="col-sm-12 col-form-label-sm alert alert-secondary mb-0">
        <div id="logAreaTranslate"></div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import InputGroupSelect from 'src/components/InputGroupSelect.vue';
import InputGroupToggle from 'src/components/InputGroupToggle.vue';
import InputGroupPassword from 'src/components/InputGroupPassword.vue';
import { useMain } from 'src/stores/main';
import InputGroupFile from 'src/components/InputGroupFile.vue';
import InputGroupFolder from 'src/components/InputGroupFolder.vue';

const mainStore = useMain();
const { allLanguages } = mainStore;
const { 
  translateSourceLanguage,
  translateTargetLanguage,
} = storeToRefs(mainStore);
</script>