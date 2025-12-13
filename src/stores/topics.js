import { ref, watch, watchEffect, computed } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { useMain } from 'src/stores/main.js';
import { UrantiaBook } from 'src/core/urantiabook.js';
import { TopicIndex } from 'src/core/topicindex.js';
import { useReadFromTXT } from 'src/composables/topicindex/useReadFromTXT.js';
import { useCheckTopic } from 'src/composables/topicindex/useCheckTopic.js';
import { useReadFromJSON } from 'src/composables/urantiabook/useReadFromJSON.js';

import path from 'path';

export const useTopics = defineStore('topics', () => {
  const mainStore = useMain();
  const { 
    allLanguages, 
    topicFilters, 
    topicLetters,
    addLog 
  } = mainStore;
  const {
    uiLanguage,
    urantiapediaFolder,
    darkTheme
  } = storeToRefs(mainStore);

  const { readFromTXT } = useReadFromTXT(uiLanguage, addLog);
  const { check } = useCheckTopic(uiLanguage, addLog);
  const { readFromJSON } = useReadFromJSON(uiLanguage, addLog);

  // Constants
  const redirectsFilters = [
    'Include redirects', 
    'Only redirects', 
    'Ignore redirects'
  ].map(v => ({value: v, label: v}));
  const lengthFilters = ['all', 'below', 'equal', 'above']
    .map(v => ({value: v, label: v}));

  //Variables
  let topicIndex1 = null;
  let topicIndex2 = null;
  let topicIndex3 = null;
  let topicIndexEN = null;
  let book1 = null;
  let book2 = null;
  let book3 = null;

  //Storage
  const filterCategory = ref('ALL');
  const filterLetter = ref('ALL');
  const filterNonRevised = ref(false);
  const filterErrors = ref(false);
  const filterRedirects = ref('Include redirects');
  const filterLengthOp = ref('all');
  const filterLengthVal = ref(15);
  const loading = ref(false);
  const filteredCount = ref(0);
  const topicList = ref([
    { id: 1, name: 'Aaron' },
    { id: 2, name: 'Abaddon' },
    { id: 3, name: 'Abner' },
    // ... 
  ]);
  const topicEditing = ref(null);
  const selectedTopic = ref(null);
  const saving = ref(false);
  const lang1 = ref('en');
  const lang2 = ref('es');
  const lang3 = ref('fr');
  const topicName = ref('Abner');
  const topicUrl = ref('http://urantiapedia.org/index/topics/Abner');
  const topicAliases = ref('Father of Abner');
  const topicRevised = ref(true);
  const topicRefs = ref('123:4.1');
  const topicSeeAlso = ref('Apostles');
  const topicLinks = ref('');
  const topicCategory = ref('Person');
  const error = ref(null);

  //Actions
  const showTopics = () => {
    const category = filterCategory.value;
    const letter = filterLetter.value;
    const notrevised = filterNonRevised.value;
    const witherrs = filterErrors.value;
    const compare = filterLengthOp.value;
    const redirects = filterRedirects.value;
    const lineslength = filterLengthVal.value;

    console.log(topicIndex1.topics);

    //Fill topic list
    const topics = topicIndex1.topics
      .filter(t => {
        const isRedirect = (t.lines.length === 0 && t.seeAlso.length > 0);
        return (
          (t.type === category || category === 'ALL') &&
          (t.filename.startsWith(letter.toLowerCase()) || letter === 'ALL') &&
          (t.revised != notrevised || !notrevised) &&
          ((t.errors && t.errors.length > 0) === witherrs || !witherrs) &&
          (
            (compare === 'below' && t.lines.length < lineslength) ||
            (compare === 'equal' && t.lines.length === lineslength) ||
            (compare === 'above' && t.lines.length > lineslength) ||
            (compare === 'all')
          ) &&
          (
            (redirects === 'Include redirects') ||
            (redirects === 'Only redirects' && isRedirect) ||
            (redirects === 'Ignore redirects' && !isRedirect)
          )
        );
      })
      .sort((a, b) => {
        if (a.sorting > b.sorting) return 1;
        if (a.sorting < b.sorting) return -1;
        return 0;
      });
    filteredCount.value = topics.length;
    const activeFound = topics.find(t => t.name === topicEditing) != undefined;

    console.log(topics);
    topicList.value = topics;

    // controls.lbxTITopics.innerHTML = createTopicsFn({
    //   topics,
    //   topicEditing,
    // });

    //Handle
    // $(controls.lbxTITopics).find('.list-group-item').on('click', function () {
    //   setTITopicAsSelected(this);
    // });
    // //Select first topic by default if no one is active
    // if (!activeFound && topics.length > 0) {
    //   setTITopicAsSelected($(controls.lbxTITopics).find('.list-group-item')[0]);
    // }
  };

  const editAlias = () => console.log('Edit Alias');
  const editRefs = () => console.log('Edit Refs');
  const editSeeAlso = () => console.log('Edit See Also');
  const editLinks = () => console.log('Edit Links');

  const loadTopics = async () => {
    loading.value = true;
    error.value = null;
    try {
      const category = filterCategory.value;
      const letter = filterLetter.value;
      const notrevised = filterNonRevised.value;
      const witherrs = filterErrors.value;
      const compare = filterLengthOp.value;
      const redirects = filterRedirects.value;
      //Force a load when no filters are applied
      const forceLoad = (
        category === 'ALL' && 
        letter === 'ALL' &&
        !notrevised && 
        !witherrs && 
        compare === 'all' &&
        redirects === 'Include redirects'
      );
      //If previously read then show filtered topics and exit
      if (topicIndex1 && topicIndex1.topics.length > 0 && !forceLoad) {
        showTopics();
      } else {
        const lan1 = lang1.value;
        const lan2 = lang2.value;
        const lan3 = lang3.value;
        const root = urantiapediaFolder.value;
        const dirTopics1 = path.join(root, 'input', 'txt', `topic-index-${lan1}`);
        const dirTopics2 = path.join(root, 'input', 'txt', `topic-index-${lan2}`);
        const dirTopics3 = path.join(root, 'input', 'txt', `topic-index-${lan3}`);
        const dirTopicsEN = path.join(root, 'input', 'txt', 'topic-index-en');
        const dirBook1 = path.join(root, 'input', 'json', `book-${lan1}-footnotes`);
        const dirBook2 = path.join(root, 'input', 'json', `book-${lan2}-footnotes`);
        const dirBook3 = path.join(root, 'input', 'json', `book-${lan3}-footnotes`);
  
        const topics1 = await readFromTXT(dirTopics1, 'ALL');
        const topics2 = await readFromTXT(dirTopics2, 'ALL');
        const topics3 = await readFromTXT(dirTopics3, 'ALL');
        const topicsEN = await readFromTXT(dirTopicsEN, 'ALL');
        const papers1 = await readFromJSON(dirBook1);
        const papers2 = await readFromJSON(dirBook2);
        const papers3 = await readFromJSON(dirBook3);
        topicIndex1 = new TopicIndex(lan1, topics1);
        topicIndex2 = new TopicIndex(lan2, topics2);
        topicIndex3 = new TopicIndex(lan3, topics3);
        topicIndexEN = new TopicIndex('en', topicsEN);
        book1 = new UrantiaBook(lan1, papers1);
        book2 = new UrantiaBook(lan2, papers2);
        book3 = new UrantiaBook(lan3, papers3);
        check(book1, topicIndex1);
        check(book2, topicIndex2);
        check(book3, topicIndex3);
        
        showTopics();
      }

    } catch (err) {
      error.value = err.message;
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  return {
    //Constants
    allLanguages,
    topicFilters,
    topicLetters,
    redirectsFilters,
    lengthFilters,
    //State
    darkTheme,
    filterCategory,
    filterLetter,
    filterNonRevised,
    filterErrors,
    filterRedirects,
    filterLengthOp,
    filterLengthVal,
    loading,
    filteredCount,
    topicList,
    topicEditing,
    selectedTopic,
    saving,
    lang1,
    lang2,
    lang3,
    topicName,
    topicUrl,
    topicAliases,
    topicRevised,
    topicRefs,
    topicSeeAlso,
    topicLinks,
    topicCategory,
    error,
    //Actions
    editAlias,
    editRefs,
    editSeeAlso,
    editLinks,
    loadTopics
  }
});