<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Urantiapedia Tools </q-toolbar-title>

        <div>Version v{{ appVersion }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer 
      v-model="leftDrawerOpen" 
      :mini="!leftDrawerOpen || miniState"
      show-if-above 
      bordered
      :width="200">
      <div :class="{ 'q-pt-xl': miniState }">
        <q-list>
          <q-item-label header> Urantiapedia Tools </q-item-label>
  
          <SimpleLink v-for="link in linksList" :key="link.title" v-bind="link" />
        </q-list>
      </div>
      <div class="absolute" style="top: 15px; right: -17px">
        <q-btn
          dense
          round
          unelevated
          color="primary"
          :icon="miniState ? 'chevron_right' : 'chevron_left'"
          @click="miniState = !miniState"
        />
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import SimpleLink from "components/SimpleLink.vue";

const appVersion = ref('');
const leftDrawerOpen = ref(false);
const miniState = ref(false)

const linksList = [
  {
    title: "Processes",
    icon: "handyman",
    link: "processes"
  },
  {
    title: "Search",
    icon: "search",
    link: "search"
  },
  {
    title: "Topic Index",
    icon: "edit",
    link: "topicindexeditor"
  },
  {
    title: "Translate",
    icon: "translate",
    link: "translate"
  },
  {
    title: "AirTable",
    icon: "M11.992 1.966c-.434 0-.87.086-1.28.257L1.779 5.917c-.503.208-.49.908.012 1.116l8.982 3.558a3.266 3.266 0 0 0 2.454 0l8.982-3.558c.503-.196.503-.908.012-1.116l-8.957-3.694a3.255 3.255 0 0 0-1.272-.257zM23.4 8.056a.589.589 0 0 0-.222.045l-10.012 3.877a.612.612 0 0 0-.38.564v8.896a.6.6 0 0 0 .821.552L23.62 18.1a.583.583 0 0 0 .38-.551V8.653a.6.6 0 0 0-.6-.596zM.676 8.095a.644.644 0 0 0-.48.19C.086 8.396 0 8.53 0 8.69v8.355c0 .442.515.737.908.54l6.27-3.006l.307-.147l2.969-1.436c.466-.22.43-.908-.061-1.092L.883 8.138a.57.57 0 0 0-.207-.044z",
    link: "airtable"
  },
  {
    title: "Settings",
    icon: "settings",
    link: "settings"
  }
];

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

onMounted(async () => {
  if (window.NodeAPI && window.NodeAPI.getAppVersion) {
    const version = await window.NodeAPI.getAppVersion();
    appVersion.value = version ?? ' - ';
  } else {
    appVersion.value = ' - '; 
  }
});
</script>
