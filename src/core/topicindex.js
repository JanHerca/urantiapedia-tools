import { extendArray } from './utils.js';

// export const topicTypes = ['PERSON', 'PLACE', 'ORDER', 'RACE', 'RELIGION', 'OTHER'];

/**
 * TopicIndex class.
 */
export class TopicIndex {
  language = 'en';
  /**
   * @example
   * topics = [
   *   {
   *      name: 'angels',
   *      nameEN: 'angels',
   *      names: ['angels', 'angel', 'the angels'],
   *      altnames: ['angel', 'the angels'],
   *      links: [
   *          '<a href="/es/The_Urantia_Book/angels">angels</a>',
   *          '<a href="/es/The_Urantia_Book/angels">angel</a>',
   *          '<a href="/es/The_Urantia_Book/angels">the angels</a>'
   *      ],
   *      lines: [
   *        {
   *           text: 'personalities of Infinite Spirit',
   *           level: 0,
   *           seeAlso: ['personalidades'],
   *           refs: ['30:2.82'],
   *           fileline: 1295
   *        },
   *        {
   *          ...
   *        }
   *      ],
   *      seeAlso: ['Infinite Spirit:family'],
   *      externalLinks: [https://en.wikipedia.org/wiki/Angels],
   *      refs: ['26:1'],
   *      type: 'ORDER',
   *      revised: false,
   *      sorting: 'a.txt:01294',
   *      filename: 'a.txt',
   *      fileline: 1294,
   *      errors: [
   *         {
   *            desc: 'seeAlso personalities not found',
   *            fileline: 1296
   *         }
   *      ]
   *   },
   *   {
   *    ...
   *   }
   * ];
   */
  topics = [];
  /**
   * Array, each item for one paper ordered by index. 
   * Each paper item an array, each item for one section ordered by index.
   * Each section item an array, each item for one paragrpah ordered by index.
   * Each paragrpah item an array, each item with topics names that reference
   * that paragrpah.
   */
  ref_topics = [];

  constructor(language, topics, ref_topics) {
    this.language = language;
    this.topics = topics;
    this.ref_topics = ref_topics;
  }

  /**
   * Gets an object containing a summary with the number of topics of each
   * type and totals, as well as redirects number.
   * @return {Object}
   */
  getSummary() {
    const letters = '_abcdefghijklmnopqrstuvwxyz';
    let result = {};
    const columns = ['#', ...topicTypes, 'REDIREC', 'REVISED', 'TOTAL'];
    result.topics = [columns];
    result.lines = [columns];

    letters.split('').forEach(letter => {
      const rowTopics = [letter.toUpperCase()];
      const rowLines = [letter.toUpperCase()];
      const tt = this.topics.filter(t => t.filename === letter + '.txt');
      //Categories
      topicTypes.forEach(type => {
        const tf = tt.filter(t => t.type === type);
        const lines = tf.reduce((a, t) => a += t.lines.length, 0);
        rowTopics.push(tf.length);
        rowLines.push(lines);
      });
      //Redirects
      rowTopics.push(tt.filter(t => t.lines.length === 0).length);
      rowLines.push(0);
      //Revised
      const tr = tt.filter(t => t.revised);
      rowTopics.push(tr.length);
      rowLines.push(tr.reduce((a, t) => a += t.lines.length, 0));
      //Totals
      rowTopics.push(tt.length);
      rowLines.push(tt.reduce((a, t) => a += t.lines.length, 0));
      result.topics.push(rowTopics);
      result.lines.push(rowLines);
    });

    const rowTopicsTotal = columns.map((c, i) => {
      return (i === 0 ? 'TOTAL' : result.topics
        .reduce((a, r, j) => a += (j != 0 ? r[i] : 0), 0));
    });
    result.topics.push(rowTopicsTotal);

    const rowLinesTotal = columns.map((c, i) => {
      return (i === 0 ? 'TOTAL' : result.lines
        .reduce((a, r, j) => a += (j != 0 ? r[i] : 0), 0));
    });
    result.lines.push(rowLinesTotal);

    return result;
  }

  /**
   * Checks if the given topic name is suitable for creating a link in the
   * given content.
   * 
   * In some languages can happen that a topic name collides with a common
   * word. We must avoid creating links for them. For example: in Spanish
   * the word `El` can be an article for masculine or a Jewish god.
   * @param {string} name Topic name in current selected language.
   * @param {string} content Full paragraph in which search for topic name.
   */
  isLinkableName(name, content) {
    //TODO: This function now is very specific only to Spanish
    //TODO: checks if there is any single sentence starting with name
    // How to check if we have name in the middle of a sentence
    // and how to return that position when creating link
    const index = content.indexOf(name);
    if (index == -1) return false;
    //Words that cannot be found at beginning of line
    const noStartES = ['El', 'Esta', 'Sin'];
    //Words that we do not link for now because are very generic
    const excludeES = ['difícil', 'ejemplo', 'valor', 'iguales',
      'fin', 'todo', 'ser', 'gracias', 'era', 'hechos'];
    const sentences = (content.match(/[^\.!\?:]+[\.!\?:\*]+/g) || [])
      .map(r => r.trim());
    if (this.language === 'es') {
      if (noStartES.includes(name) &&
        sentences.find(s => s.match(new RegExp(`^[«|\\*]?${name}`)))) {
        return false;
      }
      if (excludeES.includes(name)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Filter all topics and return those with a reference that is contained
   * within the passed reference. For example, if a topic contains the 
   * reference `10:1.1-4` and the passed reference is `10:1.1`, then the 
   * topic will be returned in the result.
   * @param {number} paper Paper index.
   * @param {number} section Section index.
   * @param {number} par Paragraph index.
   * @return {Array.<Object>} Objects with topics.
   */
  filterTopicsWithRef(paper, section, par) {
    if (!this.ref_topics[paper]) return [];
    if (!this.ref_topics[paper][section]) return [];
    if (!this.ref_topics[paper][section][par]) return [];
    const topicNames = this.ref_topics[paper][section][par];
    return topicNames.map(n => {
      return this.topics.find(t => t.name === n);
    })
  }

  /**
   * Filter all the topics and return those that appear inside the text
   * of a given UB paragraph. The text must be in JSON format, with no HTML
   * markup. Numbers are only returned if the reference matches the ones
   * in a number.
   * @param {string} text Paragraph text without HTML markup.
   * @param {number} paper Paper index.
   * @param {number} section Section index.
   * @param {number} par Paragraph index.
   * @param {Array.<Object>} topicNames Array in which store the names and 
   * links for the paragraph, avoiding repetition.
   * @param {string[]} used Array of topic names already used in previous
   * paragraph that must be avoided.
   * @return {Array.<Object>} Objects with topics.
   */
  filterTopicsInParagraph(text, paper, section, par, topicNames, used) {
    //How to separate words in all languages??
    const words = text
      .match(/[a-z0-9áéíóúäëïöüàèìòùâêîôûñ'-]+(?:'[a-z0-9áéíóúäëïöüàèìòùâêîôûñ'-]+)*/gi);
    //TODO: Instead of a loop through all topics, a loop through words
    return this.topics.filter(t => {
      if (used.includes(t.name)) {
        return false;
      }
      const isProperNoun = ((t.name.toUpperCase()[0] === t.name[0] ||
        t.type === 'ORDER') && isNaN(parseInt(t.name)));
      const index = t.names.findIndex(n => {
        if (!this.isLinkableName(n, text) || text.indexOf(n) === -1) {
          return false;
        }
        const word = words.find(w => n.startsWith(w));
        if (!word) {
          return false;
        }
        if (!isProperNoun || !isNaN(parseInt(word))) {
          const tts = this.filterTopicsWithRef(paper, section, par);
          return tts.filter(tt => tt.names.includes(n)).length > 0;
        }
        return true;
      });
      if (index != -1) {
        extendArray(topicNames, {
          name: t.names[index],
          link: t.links[index]
        });
      }
      return (index != -1);
    });
  }

}