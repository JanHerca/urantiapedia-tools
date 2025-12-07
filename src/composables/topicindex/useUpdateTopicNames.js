import { getError, getTopicNames } from 'src/core/utils.js';

/**
 * Updates the list of topic names.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useUpdateTopicNames = (
  uiLanguage,
  addLog
) => {
  /**
   * Updates the list of topic names.
   * @param {string} language Language.
   * @param {Object[]} topics Topic index in given language.
   * @param {(Object[]|undefined)} topicsEN Topic index in English.
   * @return {Promise}
   */
  const updateTopicNames = (language, topics, topicsEN) => {
    if (language != 'en' && !topicsEN) {
      return;
    }
    addLog(`Updating topic names in language ${language}`);
    const topicErr = [];
    const tpath = `/${language}/topic/`;
    try {
      topics.forEach(topic => {
        const tEN = (language === 'en'
          ? topic
          : topicsEN.find(t => {
            return (t.filename === topic.filename &&
              t.fileline === topic.fileline);
          }));
        if (language != 'en' && !tEN) {
          topicErr.push(getError(uiLanguage.value, 'topic_en_not_found',
            topic.name));
        }
        const nameEN = (tEN ? tEN.name : null);
        const urlName = nameEN
          ? nameEN.replace(/\s/g, '_').replace(/[’']/g, '')
          : null;
        const names = getTopicNames(topic);
        const links = names.map(name => {
          return `<a href="${tpath}${urlName}">${name}</a>`;
        });
        topic.nameEN = nameEN;
        topic.names = names;
        topic.links = links;
      });
      if (topicErr.length > 0) {
        throw topicErr;
      }
    } catch (err) {
      throw err;
    }
  };

  return {
    updateTopicNames
  };
};