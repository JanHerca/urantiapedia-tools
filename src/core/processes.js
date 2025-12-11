/**
 * @typedef {ProcessDef}
 * @type {Object}
 * @property {boolean} active If the process should be shown in list of processes.
 * @property {Object} desc Object with descriptions in each supported language.
 * @property {Object[]} controls Array of control objects for the process.
 * Each control object has:
 * @property {string} controls.type Type of control: 'folder', 'file', 'select', 
 * 'toggle'.
 * @property {string} controls.subtype Subtype. If type is 'select', determines
 * the values.
 * @property {string|Array.<string>} controls.value Default value for the control. 
 * If type is 'folder' or 'file', it is an array of folder names to join. 
 * @property {?Object} extraPath Object with an extra folder name for some languages.
 * @property {string} emoji Icon for the process.
 */

/**
 * Object with process definitions.
 * @type {Object.<ProcessDef>}
 */
export const Processes = {
  "BIBLEREF_TXT_BOOK_JSON_TO_TXT": {
    active: true,
    desc: {
      en: "BIBLE REFS.: Translate Bible Refs (TXT) + UB (JSON) to TXT",
      es: "REFS. DE LA BIBLIA: Traducir Refs Biblia (TXT) + LU (JSON) a TXT"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'json', 'book-{0}-footnotes']
      },
      {
        type: 'folder',
        value: ['input', 'txt', 'bible-refs-{0}']
      }
    ],
    emoji: "\u{1F4D2}"
  },
  "BIBLEREF_JSON_TO_MARKDOWN": {
    active: true,
    desc: {
      en: "BIBLE REFS.: Convert Bible Refs in Urantia Book (JSON) to Markdown",
      es: "REFS. DE LA BIBLIA: Convertir Refs Biblia en Libro de Urantia (JSON) a Markdown"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'json', 'footnotes-book-{0}.json']
      },
      {
        type: 'file',
        value: ['input', 'markdown', '{0}', 'paramony', 'The Urantia Book.md']
      }
    ],
    emoji: "\u{1F4D2}"
  },
  "BOOK_JSON_TO_BIBLEREF_JSON": {
    active: true,
    desc: {
      en: "BIBLE REFS.: Save Bible Refs in (JSON) in JSON",
      es: "REFS. DE LA BIBLIA: Guardar Refs Biblia en (JSON) en JSON"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'json', 'book-{0}-footnotes']
      }
    ],
    emoji: "\u{1F4D2}"
  },
  "BOOK_JSON_BIBLEREF_JSON_TO_JSON": {
    active: false,
    desc: {
      en: "THE URANTIA BOOK: Update Bible Refs in Urantia Book (JSON)",
      es: "EL LIBRO DE URANTIA: Actualizar Refs Biblia en Libro de Urantia (JSON)"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'json', 'book-{0}']
      }
    ],
    emoji: "\u{1F4D8}"
  },
  "BOOK_JSON_BIBLEREF_MARKDOWN_TO_JSON": {
    active: true,
    desc: {
      en: "THE URANTIA BOOK: Update Bible Refs in Urantia Book (MARKDOWN)",
      es: "EL LIBRO DE URANTIA: Actualizar Refs Biblia en Libro de Urantia (MARKDOWN)"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'json', 'book-{0}']
      }
    ],
    emoji: "\u{1F4D8}"
  },
  "BOOK_JSON_SUBSECTIONS_TSV_TO_JSON": {
    active: true,
    desc: {
      en: "THE URANTIA BOOK: Update Subsections in Urantia Book (TSV) [Only Spanish]",
      es: "EL LIBRO DE URANTIA: Actualizar Subsecciones en Libro de Urantia (TSV) [Sólo español]"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'json', 'book-{0}']
      },
      {
        type: 'file',
        value: ['input', 'txt', 'ub_subsections', 'ub_subsections_{0}.tsv']
      }
    ],
    emoji: "\u{1F4D8}"
  },
  "BOOK_HTML_TO_JSON": {
    active: true,
    desc: {
      en: "THE URANTIA BOOK: Convert Urantia Book (HTML) to JSON",
      es: "EL LIBRO DE URANTIA: Convertir Libro de Urantia (HTML) a JSON"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'html', 'book-{0}']
      },
      {
        type: 'file',
        value: ['input', 'txt', 'ub_subsections', 'ub_subsections_{0}.tsv']
      },
      {
        type: 'folder',
        value: ['input', 'json', 'book-{0}']
      },
    ],
    emoji: "\u{1F4D8}"
  },
  "BOOK_JSON_TO_TXT": {
    active: true,
    desc: {
      en: "THE URANTIA BOOK: Convert Urantia Book (JSON) to TXT",
      es: "EL LIBRO DE URANTIA: Convertir Libro de Urantia (JSON) a TXT"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'json', 'book-{0}-footnotes']
      },
      {
        type: 'folder',
        value: ['input', 'audio', 'book-{0}']
      }
    ],
    emoji: "\u{1F4D8}"
  },
  "BOOK_JSON_TOPICS_TXT_TO_WIKIJS": {
    active: true,
    desc: {
      en: "THE URANTIA BOOK: Convert Urantia Book (JSON) + Topic Index (TXT) to Wiki.js",
      es: "EL LIBRO DE URANTIA: Convertir Libro de Urantia (JSON) + Topic Index (TXT) a Wiki.js"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'txt', 'topic-index-{0}']
      },
      {
        type: 'folder',
        value: ['input', 'json', 'book-{0}-footnotes']
      },
      {
        type: 'file',
        value: ['input', 'txt', 'articles-{0}', 'ub_paralells.tsv']
      },
      {
        type: 'file',
        value: ['input', 'txt', 'ub_corrections.tsv']
      },
      {
        type: 'folder',
        value: ['output', 'wikijs', '{0}', 'The_Urantia_Book']
      }
    ],
    emoji: "\u{1F4D8}"
  },
  "BOOK_MULTIPLE_JSON_TOPICS_TXT_TO_WIKIJS": {
    active: true,
    desc: {
      en: "THE URANTIA BOOK: Convert Multiple Urantia Book (JSON) + Topic Index (TXT) to Wiki.js",
      es: "EL LIBRO DE URANTIA: Convertir Múltiples Libros de Urantia (JSON) + Topic Index (TXT) a Wiki.js"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'txt', 'topic-index-{0}']
      },
      {
        type: 'folder',
        value: ['input', 'json']
      },
      {
        type: 'file',
        value: ['input', 'txt', 'articles-{0}', 'ub_paralells.tsv']
      },
      {
        type: 'file',
        value: ['input', 'txt', 'ub_corrections.tsv']
      },
      {
        type: 'folder',
        value: ['output', 'wikijs', '{0}', 'The_Urantia_Book_Multiple']
      }
    ],
    emoji: "\u{1F4D8}"
  },
  "BOOK_INDEX_JSON_TO_WIKIJS": {
    active: true,
    desc: {
      en: "THE URANTIA BOOK: Convert Urantia Book Index (JSON) to Wiki.js",
      es: "EL LIBRO DE URANTIA: Convertir Indice del Libro de Urantia (JSON) a Wiki.js"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'json', 'book-{0}-footnotes']
      },
      {
        type: 'folder',
        value: ['output', 'wikijs', '{0}', 'The_Urantia_Book']
      }
    ],
    emoji: "\u{1F4D8}"
  },
  "BOOK_INDEX_MULTIPLE_JSON_TO_WIKIJS": {
    active: true,
    desc: {
      en: "THE URANTIA BOOK: Convert Multiple Urantia Book Index (JSON) to Wiki.js",
      es: "EL LIBRO DE URANTIA: Convertir Múltiples Indices del Libro de Urantia (JSON) a Wiki.js"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'json']
      },
      {
        type: 'folder',
        value: ['output', 'wikijs', '{0}', 'The_Urantia_Book_Multiple']
      }
    ],
    emoji: "\u{1F4D8}"
  },
  "BIBLE_TEX_BIBLEREF_MARKDOWN_TO_WIKIJS": {
    active: true,
    desc: {
      en: "BIBLE: Convert Bible (LaTeX) + Refs (MARKDOWN) to Wiki.js",
      es: "BIBLIA: Convertir Biblia (LaTeX) + Refs (MARKDOWN) a Wiki.js"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'markdown', '{0}', 'paramony']
      },
      {
        type: 'folder',
        value: ['input', 'tex', 'bible-{0}', '{extraPath}']
      },
      {
        type: 'folder',
        value: ['output', 'wikijs', '{0}', 'Bible']
      }
    ],
    extraPath: {
      en: 'ASV',
      es: 'RV1960'
    },
    emoji: "\u{1F4D5}"
  },
  "BIBLE_TEX_TO_BIBLEINDEX_WIKIJS": {
    active: true,
    desc: {
      en: "BIBLE: Convert Bible (LaTeX) to index Wiki.js",
      es: "BIBLIA: Convertir Biblia (LaTeX) a índice Wiki.js"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'tex', 'bible-{0}', '{extraPath}']
      },
      {
        type: 'folder',
        value: ['output', 'wikijs', '{0}', 'Bible']
      }
    ],
    extraPath: {
      en: 'ASV',
      es: 'RV1960'
    },
    emoji: "\u{1F4D5}"
  },
  "BIBLE_UPDATE_TITLES_WIKIJS": {
    active: true,
    desc: {
      en: "BIBLE: Update titles in Bible pages (MARKDOWN)",
      es: "BIBLIA: Actualizar títulos en páginas de la Biblia (MARKDOWN)",
    },
    controls: [
      {
        type: 'folder',
        value: ['output', 'wikijs', '{0}', 'Bible']
      }
    ],
    emoji: "\u{1F4D5}"
  },
  "BIBLE_TEX_CHECK": {
    active: true,
    desc: {
      en: "BIBLE: Check Bible (LaTeX) comparing with English",
      es: "BIBLIA: Comprobar Biblia (LaTeX) comparando con el inglés"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'tex', 'bible-{0}', '{extraPath}']
      },
      {
        type: 'folder',
        value: ['input', 'tex', 'bible-en', 'ASV']
      }
    ],
    extraPath: {
      en: 'ASV',
      es: 'RV1960'
    },
    emoji: "\u{1F4D5}"
  },
  "TOPICS_TXT_TO_WIKIJS": {
    active: true,
    desc: {
      en: "TOPICS: Convert Topic Index (TXT) to Wiki.js",
      es: "TOPICS: Convertir Topic Index (TXT) a Wiki.js"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'txt', 'topic-index-{0}']
      },
      {
        type: 'folder',
        value: ['output', 'wikijs', '{0}', 'topic']
      },
      {
        type: 'select',
        subtype: 'TopicFilters'
      },
      {
        type: 'select',
        subtype: 'TopicLetters'
      }
    ],
    emoji: "\u{1F4C7}"
  },
  "TOPICS_INDEX_TXT_TO_WIKIJS": {
    active: true,
    desc: {
      en: "TOPICS: Create index of Topic Index (TXT) to Wiki.js",
      es: "TOPICS: Crear Indice de Topic Index (TXT) a Wiki.js"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'txt', 'topic-index-{0}']
      },
      {
        type: 'folder',
        value: ['output', 'wikijs', '{0}', 'index']
      },
      {
        type: 'select',
        subtype: 'TopicIndexes'
      }
    ],
    emoji: "\u{1F4C7}"
  },
  "REVIEW_TOPIC_TXT_LU_JSON": {
    active: true,
    desc: {
      en: "TOPICS: Review Topic Index (TXT) + JSON (UB)",
      es: "TOPICS: Revisar Topic Index (TXT) + JSON (LU)"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'txt', 'topic-index-{0}']
      },
      {
        type: 'folder',
        value: ['input', 'json', 'book-{0}-footnotes']
      },
      {
        type: 'select',
        subtype: 'TopicFilters'
      },
      {
        type: 'select',
        subtype: 'TopicLetters'
      },
      {
        type: 'input',
        label: 'Topic',
        placeholder: 'Enter a topic name to filter (overrides previous selections)'
      }
    ],
    emoji: "\u{1F4C7}"
  },
  "REVIEW_TOPIC_THREE_LANS": {
    active: true,
    desc: {
      en: "TOPICS: Review Topic Index (TXT) in EN/ES/FR languages",
      es: "TOPICS: Revisar Topic Index (TXT) en los idiomas EN/ES/FR"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'txt']
      },
      {
        type: 'folder',
        value: ['input', 'json']
      }
    ],
    emoji: "\u{1F4C7}"
  },
  "SUM_TOPIC_TXT": {
    active: true,
    desc: {
      en: "TOPICS: Summary of Topic Index (TXT)",
      es: "TOPICS: Resumen actual del Topic Index (TXT)"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'txt', 'topic-index-{0}']
      }
    ],
    emoji: "\u{1F4C7}"
  },
  "NORM_TOPIC_TXT": {
    active: true,
    desc: {
      en: "TOPICS: Normalize entries Topic Index (TXT) to TXT",
      es: "TOPICS: Normalizar entradas Topic Index (TXT) a TXT"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'txt', 'topic-index-{0}']
      }
    ],
    emoji: "\u{1F4C7}"
  },
  "ARTICLE_INDEX_TO_WIKIJS": {
    active: true,
    desc: {
      en: "ARTICLES: Convert a Articles Index File (TSV) to Wiki.js",
      es: "ARTICULOS: Convertir un Indice de Artículos (TSV) a Wiki.js"
    },
    controls: [
      {
        type: 'file',
        value: ['input', 'txt', 'articles-{0}', 'articles_innerface.tsv']
      },
      {
        type: 'file',
        value: ['output', 'wikijs', '{0}', 'index', 'articles_innerface.html']
      }
    ],
    emoji: "\u{1F4C3}"
  },
  "ARTICLE_INDEX_ADD_FROM_TRANSLATION": {
    active: true,
    desc: {
      en: "ARTICLES: Add the translation for an index from existing articles (TSV out file required)",
      es: "ARTICULOS: Añadir la traducción de un índice para artículos ya existentes (fichero TSV de salida debe existir)"
    },
    controls: [
      {
        type: 'file',
        value: ['input', 'txt', 'articles-{0}', 'articles_innerface.tsv']
      },
      {
        type: 'folder',
        value: ['output', 'wikijs']
      }
    ],
    emoji: "\u{1F4C3}"
  },
  "ARTICLE_NAVIGATION_HEADERS_IN_WIKIJS": {
    active: true,
    desc: {
      en: "ARTICLES: Add a navigation header to articles in Wiki.js",
      es: "ARTICULOS: Añadir cabecera a los artículos en Wiki.js"
    },
    controls: [
      {
        type: 'file',
        value: ['input', 'txt', 'articles-{0}', 'articles_innerface.tsv']
      },
      {
        type: 'folder',
        value: ['output', 'wikijs', '{0}', 'article']
      }
    ],
    emoji: "\u{1F4C3}"
  },
  "ARTICLE_ANCHORS_IN_WIKIJS": {
    active: true,
    desc: {
      en: "ARTICLES: Add anchors to articles in Wiki.js",
      es: "ARTICULOS: Añadir anclas (enlaces) a artículos en Wiki.js"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'tt', 'articles-{0}', 'study_aids.tsv']
      },
      {
        type: 'folder',
        value: ['output', 'wikijs', '{0}', 'article']
      }
    ],
    emoji: "\u{1F4C3}"
  },
  "ARTICLE_CREATE_PARALELLS_FROM_WIKIJS": {
    active: true,
    desc: {
      en: "ARTICLES: Create UB paralells file from Wiki.js",
      es: "ARTICULOS: Crear fichero de paralelos del LU a partir de Wiki.js"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'json', 'book-{0}-footnotes']
      },
      {
        type: 'folder',
        value: ['output', 'wikijs', '{0}', 'article']
      },
      {
        type: 'file',
        value: ['input', 'txt', 'articles-{0}', 'ub_paralells.tsv']
      }
    ],
    emoji: "\u{1F4C3}"
  },
  "ARTICLE_CREATE_BLANK_FROM_LIST": {
    active: true,
    desc: {
      en: "ARTICLES: Create blank articles from an index",
      es: "ARTICULOS: Crear artículos en blanco a partir de un índice"
    },
    controls: [
      {
        type: 'file',
        value: ['input', 'txt', 'articles-{0}', 'articles_innerface.tsv']
      },
      {
        type: 'folder',
        value: ['output', 'wikijs', '{0}', 'article']
      }
    ],
    emoji: "\u{1F4C3}"
  },
  "ARTICLE_AUTHORS_INDEXES": {
    active: true,
    desc: {
      en: "ARTICLES: Create a file with indexes by author",
      es: "ARTICULOS: Crear un archivo con los índices por autor"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'txt', 'articles-{0}']
      },
      {
        type: 'folder',
        value: ['output', 'wikijs', '{0}', 'article']
      },
      {
        type: 'file',
        value: ['input', 'txt', 'articles-{0}', 'authors_index.md']
      }
    ],
    emoji: "\u{1F4C3}"
  },
  "ARTICLE_COPY_TO_FOLDER": {
    active: true,
    desc: {
      en: "ARTICLES: Copy files to folder from an index",
      es: "ARTICULOS: Copiar archivos a carpeta a partir de un índice"
    },
    controls: [
      {
        type: 'file',
        value: ['input', 'txt', 'articles-{0}', 'articles_innerface.tsv']
      },
      {
        type: 'folder',
        value: ['tests', 'article']
      }
    ],
    emoji: "\u{1F4C3}"
  },
  "LIBRARY_CREATE_BLANK_FROM_LIST": {
    active: true,
    desc: {
      en: "LIBRARY: Create blank book from an index",
      es: "LIBRARY: Crear un libro en blanco a partir de un índice"
    },
    controls: [
      {
        type: 'file',
        value: ['tests', 'book', 'bookinfo.md']
      },
      {
        type: 'folder',
        value: ['tests', 'book_translated']
      }
    ],
    emoji: "\u{1F4DA}"
  },
  "FIX_MARKDOWN_FOOTNOTES": {
    active: true,
    desc: {
      en: "MARKDOWN: Fix footnotes in Markdown files",
      es: "MARKDOWN: Corregir notas al pie en archivos Markdown"
    },
    controls: [
      {
        type: 'folder',
        value: ['output', 'wikijs', '{0}', 'book']
      }
    ],
    emoji: "\u{1F4DA}"
  },
  "ALL_INDEXES": {
    active: true,
    desc: {
      en: "INDEXES: Create the List of All Indexes to Wiki.js",
      es: "INDICES: Crear el Listado de Todos los Índices en Wiki.js"
    },
    controls: [
      {
        type: 'folder',
        value: ['output', 'wikijs', '{0}']
      }
    ],
    emoji: "\u{1F520}"
  },
  "PARALELL_INDEX": {
    active: true,
    desc: {
      en: "INDEXES: Create index of paralells",
      es: "INDICES: Crear índice de paralelos"
    },
    controls: [
      {
        type: 'folder',
        value: ['input', 'json', 'book-{0}-footnotes']
      },
      {
        type: 'folder',
        value: ['input', 'wikijs', '{0}', 'index']
      }
    ],
    emoji: "\u{1F520}"
  }
};