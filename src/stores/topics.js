import { ref, watch } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { useMain } from 'src/stores/main.js';
import { UrantiaBook } from 'src/core/urantiabook.js';
import { TopicIndex } from 'src/core/topicindex.js';
import { replaceWords, getParLink, getMostSimilarSentence } from 'src/core/utils.js';
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
    copyTypes,
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
  const topicList = ref([]);
  const topicEditing = ref(null);
  const topicErrors = ref([]);
  const topicLines = ref([]);
  const topicOpenAI = ref([]);
  const topicLineEditing = ref(null);
  const ubPars = ref([]);
  const saving = ref(false);
  const lang1 = ref('en');
  const lang2 = ref('es');
  const lang3 = ref('fr');
  const topicName = ref('');
  const topicUrl = ref('');
  const topicAliases = ref('');
  const topicRevised = ref(false);
  const topicRefs = ref('');
  const topicSeeAlso = ref('');
  const topicLinks = ref('');
  const topicCategory = ref('');
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

    //Select first topic by default if no one is active
    if (!activeFound && topics.length > 0) {
      topicEditing.value = topics[0].name;
    }
  };

  const editAlias = () => console.log('Edit Alias');
  const editRefs = () => console.log('Edit Refs');
  const editSeeAlso = () => console.log('Edit See Also');
  const editLinks = () => console.log('Edit Links');

  const loadTopics = async () => {
    loading.value = true;
    error.value = null;
    try {
      //Force a load when no filters are applied
      const forceLoad = (
        filterCategory.value === 'ALL' && 
        filterLetter.value === 'ALL' &&
        !filterNonRevised.value && 
        !filterErrors.value && 
        filterLengthOp.value === 'all' &&
        filterRedirects.value === 'Include redirects'
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

  const getTopicSelected = (onlyFirst) => {
    const name = topicEditing.value;
    if (!name) return onlyFirst ? null : [null, null, null];
    const topic1 = topicIndex1.topics.find(t => t.name === name);
    if (onlyFirst) return topic;
    const sorting = topic1.sorting;
    const topic2 = topicIndex2.topics.find(t => t.sorting === sorting);
    const topic3 = topicIndex3.topics.find(t => t.sorting === sorting);
    return [topic1, topic2, topic3];
  };

  const getPar = (names, book, r, errs) => {
    names.sort((a, b) => b.length - a.length);
    const spans = names.map(n => `<span class="text-primary">${n}</span>`);
    let par = book.toParInHTML(r, errs);
    const parPlain = book.toParInPlainText(r, []);
    par = replaceWords(names, spans, par, false, false, false, true);
    return [parPlain, par];
  };

  const getPars = (r, names, lines) => {
    const errs = [];

    let [par1Plain, par1] = getPar(names[0], book1, r, errs);
    let [par2Plain, par2] = getPar(names[1], book2, r, errs);
    let [par3Plain, par3] = getPar(names[2], book3, r, errs);

    const ref = (r ? ` [${r[0]}:${r[1]}.${r[2]}]` : '');
    const linkref1 = getParLink(book1, r, copyTypes[0].value);
    const linkref2 = getParLink(book2, r, copyTypes[0].value);
    const linkref3 = getParLink(book3, r, copyTypes[0].value);

    const sim1 = getMostSimilarSentence(par1Plain, lines[0].text);
    const sim2 = getMostSimilarSentence(par2Plain, lines[1].text);
    const sim3 = getMostSimilarSentence(par3Plain, lines[2].text);

    par1 = sim1 ? par1.replace(sim1, `<strong>${sim1}</strong>`) : par1;
    par2 = sim2 ? par2.replace(sim2, `<strong>${sim2}</strong>`) : par2;
    par3 = sim3 ? par3.replace(sim3, `<strong>${sim3}</strong>`) : par3;

    return {
      rowClass: [],
      errClass: r == null ? ['alert', 'alert-danger', 'mb-0', 'py-0'] : [],
      pars: [par1, par2, par3],
      refs: [ref, ref, ref],
      textToCopy: [sim1, sim2, sim3],
      linkToCopy: [linkref1, linkref2, linkref3]
    }
  };

  const showLinesUB = () => {
    const topics = getTopicSelected();
    if (!topics[0]) return;
    const fileline = topicLineEditing.value;
    const lines = topics.map(t => t.lines.find(ln => ln.fileline === fileline));
    const names = [topicIndex1, topicIndex2, topicIndex3]
      .map((ti, i) => ti.getNames(topics[i]));
    const refs = book1.getArrayOfRefs(lines[0].refs);
    ubPars.value = refs.map(r => getPars(r, names, lines));
  };

  const showTopic = () => {
    const topics = getTopicSelected();
    const [topic1, topic2, topic3] = topics;
    if (!topic1) return;

    const topicEN = topicIndexEN.topics.find(t => {
      return (t.filename === topic1.filename && t.fileline === topic1.fileline);
    });
    let lan1 = lang1.value;
    const {
      altnames: aliases = [],
      refs = [],
      seeAlso = [],
      externalLinks: links = [],
      lines: lines1 = [],
      revised,
      type
    } = topic1;
    const { lines: lines2 = [] } = topic2;
    const { lines: lines3 = [] } = topic2;
    const pagename = (topicEN ? topicEN.name.replace(/ /g, '_') : 'not_found');
    const url = `http://urantiapedia.org/${lan1}/topic/${pagename}`;

    topicName.value = topicEditing.value;
    topicAliases.value = aliases.join('; ');
    topicRevised.checked = revised;
    topicRefs.value = refs.join('; ');
    topicSeeAlso.value = seeAlso.join('; ');
    topicLinks.value = links.join('; ');
    topicCategory.value = type;
    topicUrl.value = url;

    //Fill lines listbox
    const filterErrors = (objs) => {
      return topics.map((t, i) => {
        return (t.errors || [])
          .filter(er => er.fileline === objs[i].fileline)
          .map(er => er.desc);
      });
    };

    topicErrors.value = filterErrors(topics);

    topicLines.value = lines1.map((line1, i) => {
      const line2 = lines2[i];
      const line3 = lines3[i];
      const errors = filterErrors([line1, line2, line3]);
      return {
        fileline: line1.fileline,
        lines: [line1, line2, line3],
        errors,
        refs: line1.refs.join(', '),
        active: line1.fileline === topicLineEditing.value
      }
    });

    topicOpenAI.value = topics.map(t => {
      if (!t.lines.some(line => line.openAI && line.openAI.value)) {
        return null;
      }
      return t.lines.map(line => {
        const tabs = '\t'.repeat(line.level);
        const text = line.openAI && line.openAI.value
          ? line.openAI.value
          : line.text;
        const refs = line.refs.length > 0
          ? ' ' + line.refs.map(r => `(${r})`).join(' ')
          : '';
        const seeAlso = line.seeAlso.length > 0
          ? ' | ' + line.seeAlso.join('; ')
          : '';
        return `${tabs}${text}${refs}${seeAlso}`;
      }).join('\r\n');
    });
  };

  //Watchers
  watch(topicEditing, () => {
    showTopic();
  });

  watch(topicLineEditing, () => {
    showLinesUB();
  });

  return {
    //Constants
    allLanguages,
    topicFilters,
    topicLetters,
    redirectsFilters,
    lengthFilters,
    copyTypes,
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
    topicErrors,
    topicLines,
    topicOpenAI,
    topicLineEditing,
    ubPars,
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