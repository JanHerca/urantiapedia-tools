import { ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { useMain } from 'src/stores/main';
import { useReadFromJSON } from 'src/composables/urantiabook/useReadFromJSON.js';
import { UrantiaBook } from 'src/core/urantiabook.js';
import { Strings } from 'src/core/strings.js';
import { strformat, getParLink } from 'src/core/utils.js';

import path from 'path';

export const useSearch = defineStore('search', () => {
  const mainStore = useMain();
  const { allLanguages, copyTypes, addLog } = mainStore;
  const {
    uiLanguage,
    urantiapediaFolder,
    darkTheme
  } = storeToRefs(mainStore);

  const { readFromJSON } = useReadFromJSON(uiLanguage, addLog);

  //Variables
  let book1 = null;
  let book2 = null;

  //Storage
  const oldRefs = ref('');
  const newRefs = ref('');
  const searchText = ref('');
  const fileName = ref('');
  const isFileSecondLan = ref(false);
  const searchLanguage = ref('en');
  const secondLanguage = ref('es');
  const copyWithQuotes = ref(false);
  const copyWithLink = ref(false);
  const copyType = ref('Copy Markdown');
  const isSearching = ref(false);
  const isAddingQuotes = ref(false);
  const searchResults = ref([]);
  const error = ref(null);

  //Functions

  const getRefsInLines = (lines) => {
    const pattern = '(\\d{1,3}):(\\d{1,2})(\\.\\d{1,3})?(-\\d{1,3})?';
    const abbs = Object.values(Strings.bookAbb).join('|');
    const regEx1 = new RegExp(pattern, 'g');
    const regEx = new RegExp(`(${abbs}) ${pattern}`, 'g');
    return lines.map(line => {
      const matched = line.match(regEx);
      return (matched ? matched.map(r => r.match(regEx1)[0]) : []);
    });
  };

  const getOldRefsInLines = (lines) => {
    const refRegEx = new RegExp('\\(\\d{1,4}(\\.\\d{1,2})?\\)', 'g');
    const quoteRegEx = new RegExp('"([^"]*)"|“([^”]*)”|«([^»]*)»', 'g');
    return lines.map(line => {
      const refsMatched = line.match(refRegEx);
      const quotesMatched = line.match(quoteRegEx);
      return {
        refs: refsMatched
          ? [...new Set(refsMatched)].map(m => m.replace(/[\(|\)]/g, '')) 
          : [],
        quotes: quotesMatched 
          ? quotesMatched.map(m => m.replace(/["“”«»]/g, '')) 
          : []
      };
    });
  };

  const highlightPar = (parsObj, quotes, text) => {
    const pattern = `<span class="text-primary">{0}</span>`;
    const text2 = (!text || text === '' ? null : strformat(pattern, text));
    const line = parsObj.pars[0];
    let finalLine = line;
    if (quotes && quotes.length > 0) {
      quotes.forEach(q => {
        const plainq = q.replace(/_|\*/g, '');
        if (finalLine.indexOf(plainq) != -1) {
          let q2 = plainq;
          let parts = finalLine.split(plainq);
          if (text2) {
            q2 = plainq.replace(text, text2);
            parts = parts.map(p => p.replace(text, text2));
          }
          finalLine = parts.join(`<b>${q2}</b>`);
        }

      });
    } else if (text2) {
      finalLine = line.replace(text, text2);
    }
    parsObj.pars[0] = finalLine;
  };

  const getParsForLine = (line) => {
    const text = searchText.value;
    const lanIndex = isFileSecondLan.value ? 1 : 0;
    const refs = getRefsInLines([line])[0];
    const obj = getOldRefsInLines([line])[0];
    const classes = ['alert', 'alert-info', 'mx-0', 'my-0', 'px-0', 'py-0'];

    if (refs.length === 0 && obj.refs.length === 0) return '';

    //Line from file
    const finalLine = highlightPar(line, obj.quotes, text);
    const pars = [], rrefs = [];
    pars[lanIndex] = finalLine;
    rrefs[lanIndex] = obj.refs.join('; ') +
      (obj.refs.length > 0 ? '; ' : '') + refs.join(';');
    const lineText = {
      rowClass: classes,
      errClass: classes,
      pars: pars,
      refs: rrefs,
      textToCopy: ['', ''],
      linkToCopy: ['', '']
    };
    //Old refs
    const oldRefsContent = getParsForOldRefs(obj.refs, obj.quotes, text);
    //New refs
    const newRefsContent = getParsForNewRefs(refs, obj.quotes, text);
    return lineText + oldRefsContent + newRefsContent;
  };

  const getParText = (book, ref, link) => {
    const quotes = isAddingQuotes.value;
    const qStart = Strings['quotationStart'][book.language];
    const qEnd = Strings['quotationEnd'][book.language];
    link = (link ? link : '');
    let parText = '', bqStart = '', bqEnd = '';

    if (copyType.value === copyTypes[0].value) {
      parText = book.toParInPlainText(ref, []);
    } else if (copyType.value === copyTypes[1].value) {
      parText = book.toParInMarkdown(ref, []);
      bqStart = '\t> ';
      bqEnd = '';
    } else {
      parText = book.toParInHTML(ref, []);
      bqStart = '\t<blockquote>';
      bqEnd = '</blockquote>';
    }
    if (quotes) {
      parText = `${bqStart}${qStart}${parText}${qEnd}${link}${bqEnd}`;
    }
    return parText;
  };

  const getPars = (r1, r2, r, old) => {
    const copyLink = copyWithLink.value;
    const errs1 = [], errs2 = [];
    const par1 = book1.toParInHTML(r1, errs1);
    const par2 = book2.toParInHTML(r2, errs2);
    const link1 = getParLink(book1, r1, copyType.value);
    const link2 = getParLink(book2, r2, copyType.value);
    const par1Plain = getParText(book1, r1, (copyLink ? ' ' + link1 : ''));
    const par2Plain = getParText(book2, r2, (copyLink ? ' ' + link2 : ''));
    const oldref = (old ? ' (' + r + ')' : '');
    const ref1 = r1
      ? ` [${r1[0]}:${r1[1]}.${r1[2]}]` + oldref
      : (errs1.join(';') + ': [' + r + ']');
    const ref2 = r2
      ? ` [${r2[0]}:${r2[1]}.${r2[2]}]` + oldref
      : (errs2.join(';') + ': [' + r + ']');

    return {
      rowClass: [],
      errClass: (r1 == null || r2 == null ?
        ['alert', 'alert-danger', 'mb-0', 'py-0'] : []),
      pars: [par1, par2],
      refs: [ref1, ref2],
      textToCopy: [par1Plain, par2Plain],
      linkToCopy: [link1, link2]
    };
  };

  const getParsMulti = (refs1, refs2, r) => {
    const copyLink = copyWithLink.value;
    const rn1 = refs1[0];
    const rn = `${rn1[0]}:${rn1[1]}.${rn1[2]}`;
    const rn2 = `${rn}-${refs1[refs1.length - 1][2]}`;
    const link1 = copyLink
      ? getParLink(book1, rn1, copyType.value).replace(rn, rn2)
      : '';
    const link2 = copyLink
      ? getParLink(book2, rn1, copyType.value).replace(rn, rn2)
      : '';
    const pars1Plain = refs1.map(r1 => getParText(book1, r1)).join('') +
      (copyLink ? ' ' + link1 : '');
    const pars2Plain = refs2.map(r2 => getParText(book2, r2)).join('') +
      (copyLink ? ' ' + link2 : '');
    const ref = `[${r}]`;

    return {
      rowClass: [],
      errClass: [],
      pars: [],
      refs: [ref, ref],
      textToCopy: [pars1Plain, pars2Plain],
      linkToCopy: [link1, link2]
    };
  };

  const getParsForOldRefs = (oldRefs, quotes, text) => {
    const pars = oldRefs.map(r => {
      const refs1 = book1.getArrayOfRefsFromOldRefs([r]);
      const refs2 = book2.getArrayOfRefsFromOldRefs([r]);
      return refs1.map((rr, j) => {
        const par = getPars(rr, refs2[j], r, true);
        highlightPar(par, quotes, text);
        return par;
      });
    }).flat();
    return pars;
  };

  const getParsForNewRefs = (newRefs, quotes, text) => {
    const pars = newRefs.map(r => {
      const refs1 = book1.getArrayOfRefs([r]);
      const refs2 = book2.getArrayOfRefs([r]);
      const result = refs1.map((rr, j) => {
        const par = getPars(rr, refs2[j], r, false);
        highlightPar(par, quotes, text);
        return par;
      });
      if (refs1.length > 1) {
        result.push(getParsMulti(refs1, refs2, r));
      }
      return result;
    }).flat();
    return pars;
  };

  const getParsForText = (text) => {
    const refs = book1.search(text);
    return getParsForNewRefs(refs, null, text);
  };

  const loadSearchBooks = async () => {
    const root = urantiapediaFolder.value;
    const lan1 = searchLanguage.value;
    const lan2 = secondLanguage.value;
    const dirBook1 = path.join(root, 'input', 'json', `book-${lan1}`)
    const dirBook2 = path.join(root, 'input', 'json', `book-${lan2}`)
    const load1 = !book1 || book1.language != lan1;
    const load2 = !book2 || book2.language != lan2;

    if (load1) {
      const papers1 = await readFromJSON(dirBook1);
      book1 = new UrantiaBook(lan1, papers1);
    }
    if (load2) {
      const papers2 = await readFromJSON(dirBook2);
      book2 = new UrantiaBook(lan2, papers2);
    }
  };

  const executeSearch = (lines) => {
    const text = searchText.value;
    const txtOldRefs = oldRefs.value;
    const txtNewRefs = newRefs.value;
    const pars = [];

    //Fill listbox
    if (lines) {
      lines.forEach(line => {
        pars.push(...getParsForLine(line));
      });
    } else {
      if (txtOldRefs != '') {
        const arrOldRefs = txtOldRefs.split(';').map(s => s.trim());
        pars.push(...getParsForOldRefs(arrOldRefs, null, text));
      }
      if (txtNewRefs != '') {
        const arrNewRefs = txtNewRefs.split(';').map(s => s.trim());
        pars.push(...getParsForNewRefs(arrNewRefs, null, text));
      }
      if (txtOldRefs === '' && txtNewRefs === '' && text != '') {
        pars.push(...getParsForText(text));
      }
    }
    searchResults.value = pars;
    console.log(pars);
    if (pars.length === 0) {
      throw new Error('No results found.');
    }
  };

  //Actions
  const startSearch = async () => {
    isSearching.value = true;
    error.value = null;
    try {
      let lines = null;
      await loadSearchBooks();
      if (fileName.value != '') {
        const buf = await window.NodeAPI.readFile(fileName);
        lines = buf.toString().split('\n');
      }
      executeSearch(lines);
    } catch (err) {
      error.value = err.message;
    } finally {
      isSearching.value = false;
    }
  };

  const addQuotes = () => {
    isAddingQuotes.value = true;
    // Lógica para añadir comillas a los archivos...
    setTimeout(() => {
      isAddingQuotes.value = false;
    }, 2000);
  };

  return {
    //Constants
    allLanguages,
    copyTypes,
    //State
    uiLanguage,
    darkTheme,
    oldRefs,
    newRefs,
    searchText,
    fileName,
    isFileSecondLan,
    searchLanguage,
    secondLanguage,
    copyWithQuotes,
    copyWithLink,
    copyType,
    isSearching,
    isAddingQuotes,
    searchResults,
    error,
    //Actions
    startSearch,
    addQuotes
  }
});