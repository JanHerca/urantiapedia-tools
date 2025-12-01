
/**
 * Returns an internal array to be be used for fast searches.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useGetRefsForSearching = (
  uiLanguage,
  addLog
) => {
  /**
   * Returns an internal array to be be used for fast searches.
   * @param {UrantiaBook} book Book to be used for extract references.
   * @param {Object[]} topics Topic index.
   */
  const getRefsForSearching = (book, topics) => {
    addLog('Getting topic references for fast searching');

    try {
      const ref_topics = [];
  
      topics.forEach(topic => {
        const refs = [];
        extendArray(refs, topic.refs);
        topic.lines.forEach(line => extendArray(refs, line.refs));
        const nrefs = book.getArrayOfRefs(refs);
        nrefs.forEach(nref => {
          if (nref) {
            const [pi, si, par_i] = nref;
            if (!ref_topics[pi]) {
              ref_topics[pi] = [];
            }
            if (!ref_topics[pi][si]) {
              ref_topics[pi][si] = [];
            }
            if (!ref_topics[pi][si][par_i]) {
              ref_topics[pi][si][par_i] = [];
            }
            if (ref_topics[pi][si][par_i].indexOf(topic.name) === -1) {
              ref_topics[pi][si][par_i].push(topic.name);
            }
          }
        });
      });

      return ref_topics;
    } catch (err) {
      throw err;
    }
  };

  return {
    getRefsForSearching
  };
};