import { tr, strformat, testWords, extendArray } from 'src/core/utils.js';

/**
 * Reads `The Urantia Book` from a folder with files in JSON format.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useCheckTopic = (
  uiLanguage,
  addLog
) => {

  /**
   * Checks the references in a topic and add errors in an array of error
   * objects (with desc and fileline).
   * @param {Object} topic Topic.
   * @param {Book} book The Urantia Book object.
   */
  const checkRefs = (topic, book) => {
    const fnRefs = (refs, fileline) => {
      const invalid = refs.filter(ref => {
        const arRefs = book.getArrayOfRefs([ref]);
        return (arRefs.length === 0 || arRefs[0] == null);
      });
      if (invalid.length > 0) {
        topic.errors.push({
          desc: tr('topic_invalid_refs', uiLanguage.value) + invalid.join('; '),
          fileline
        });
      }
    };
    fnRefs(topic.refs, topic.fileline);
    topic.lines.forEach(line => fnRefs(line.refs ? line.refs : [], line.fileline));
  };

  /**
   * Checks if names are found in any paragraph of Urantia Book and adds an 
   * error in an array of error objects (with desc and fileline). This 
   * function requires a previous call to checkRefs to remove invalid refs
   * from the check.
   * @param {Object} topic Topic.
   * @param {TopicIndex} topicIndex Topic Index in current language to process.
   * @param {UrantiaBook} book The Urantia Book object.
   */
  const checkNamesInPars = (topic, topicIndex, book) => {
    const names = topicIndex.getNames(topic);
    const refs = topic.refs.slice();
    topic.lines.forEach(line => extendArray(refs, line.refs));
    if (refs.length === 0) return;
    //Filter valid refs
    const validRefs = refs.filter(ref =>
      topic.errors.find(er => er.desc.indexOf(ref) != -1) == undefined);
    const validArRefs = book.getArrayOfRefs(validRefs);
    const notfounded = validArRefs.filter(validArRef => {
      const par = book.getPar(...validArRef);
      const content = par ? par.par_content.replace(/\*|\$/g, '') : null;
      return (content == null || !testWords(names, content));
    }).map(r => `${r[0]}:${r[1]}.${r[2]}`);

    if (notfounded.length === validArRefs.length) {
      topic.errors.push({
        desc: strformat(tr('topic_not_in_ref', uiLanguage.value),
          topic.name, notfounded.join('; ')),
        fileline: topic.fileline
      });
    }
  };

  /**
   * Checks an array of links to other topics and add errors in an array
   * of error objects (with desc and fileline).
   * @param {Object} topic Topic to check.
   * @param {?Object} line Line inside a topic (optional for checking lines).
   * @param {TopicIndex} topicIndex Topic Index in current language to process.
   * @param {?TopicIndex} topicIndexEN An optional TopicIndex in English
   * to obtain valid seeAlsos, if they exist.
   */
  const checkSeeAlso = (topic, line, topicIndex, topicIndexEN) => {
    const { errors, filename } = topic;
    const { seeAlso, fileline } = (line ? line : topic);
    if (seeAlso && seeAlso.length > 0) {
      let tEN = null;
      seeAlso.forEach((sa, i) => {
        const term = sa.split(':')[0];
        let correctTerm = '';
        if (!topicIndex.topics.find(t => t.name === term)) {
          if (topicIndexEN && tEN === null) {
            tEN = topicIndexEN.topics
              .find(t => t.filename === filename &&
                t.fileline === topic.fileline);
          }
          if (tEN) {
            const lineEN = line
              ? tEN.lines.find(l => l.fileline === line.fileline)
              : null;
            const seeAlsoEN = lineEN ? lineEN.seeAlso : tEN.seeAlso;
            const saEN = seeAlsoEN ? seeAlsoEN[i] : null;
            const termEN = saEN ? saEN.split(':')[0] : null;
            const t2EN = termEN ? topicIndexEN.topics
              .find(t => t.name === termEN) : null;
            if (t2EN) {
              const t2 = topicIndex.topics
                .find(t => t.filename === t2EN.filename &&
                  t.fileline === t2EN.fileline);
              correctTerm = `, better use '${t2.name}'`;
            }
          }
          errors.push({
            desc: strformat(tr('topic_seealso_not_found', uiLanguage.value), sa,
              correctTerm),
            fileline
          });
        }
        //TODO: check if seeAlso anchors point to topic 1st level headers
      });
    }
  };


  /**
   * Checks a topic, writing errors in it.
   * @param {Object} topic Topic.
   * @param {UrantiaBook} book The Urantia Book object.
   * @param {TopicIndex} topicIndex Topic Index in current language to process.
   * @param {?TopicIndex} topicIndexEN An optional TopicIndex in English
   * to obtain valid seeAlsos, if they exist.
   */
  const checkTopic = (topic, book, topicIndex, topicIndexEN) => {
    addLog(`Checking topic: ${topic.name}`);

    try {
      topic.errors = [];
      //Checking duplicates
      const other = topicIndex.topics.filter(tt => tt != topic && tt.name === topic.name);
      if (other.length > 0) {
        const errors = other.map(tt =>
          `${tt.name}|${tt.filename}:${tt.fileline}`).join(' ');
        topic.errors.push({
          desc: tr('topic_duplicated', uiLanguage.value) + ' ' + errors,
          fileline: topic.fileline
        });
      }

      //Checking refs
      checkRefs(topic, book);

      //Checking names in paragraphs
      // const firstLetter = topic.name.substring(0, 1);
      // const isUpperCase = (firstLetter === firstLetter.toUpperCase());
      // if (isUpperCase) {
      // 	checkNamesInPars(topic, topicIndex, book);
      // }
      checkNamesInPars(topic, topicIndex, book);

      //Checking links to other topics
      checkSeeAlso(topic, undefined, topicIndex, topicIndexEN);
      topic.lines.forEach(line => {
        checkSeeAlso(topic, line, topicIndex, topicIndexEN);
      });

    } catch (err) {
      topic.errors.push({
        desc: err.message,
        fileline: topic.fileline
      });
    }
  };

  /**
   * Checks topics, writing errors found inside topics.
   * @param {UrantiaBook} book The Urantia Book object.
   * @param {TopicIndex} topicIndex Topic Index in current language to process.
   * @param {?TopicIndex} topicIndexEN An optional TopicIndex in English
   * to obtain valid seeAlsos, if they exist.
   * @param {?string} category Topic category to check. By default is 'ALL'.
   * @param {?string} letter Topic letter to output. By default is 'ALL'.
   * @param {?string} topicName Topic name in English of topic to check. If one
   * is provided then category and letter are ignored and that topic is the only
   * checked.
   */
  const check = (
    book, 
    topicIndex, 
    topicIndexEN,
    category = 'ALL',
    letter = 'ALL',
    topicName
  ) => {
    addLog(`Checking topics`);
    try {
      const topics = topicName == null
        ? topicIndex.topics
          .filter(t => category === 'ALL' || t.type === category)
          .filter(t => letter === 'ALL' || t.nameEN.toLowerCase().startsWith(letter))
        : topicIndex.topics.filter(t => t.nameEN === topicName);
  
      if (topics.length === 0) {
        throw new Error('No topics to check');
      }
      topicIndex.topics.forEach(t => checkTopic(t, book, topicIndex, topicIndexEN));
    } catch (err) {
      throw err;
    }

  };

  return { check };


};