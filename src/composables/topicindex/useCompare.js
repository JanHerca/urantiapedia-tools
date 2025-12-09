import { strformat } from 'src/core/utils.js';

/**
   * Compares this topic index with another one to check if they are equals.
   * Write errors inside topics of this topic index.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useCompare = (
  uiLanguage,
  addLog
) => {
  /**
   * Compares two topicIndex to check if they are equals.
   * Write errors inside topics of first topic index.
   * @param {TopicIndex} topicIndex First topic index.
   * @param {TopicIndex} topicIndex2 Other topic index.
   */
  const compare = (topicIndex, topicIndex2) => {
    addLog('Comparing topic index');
    try {
      const lan2 = topicIndex2.language;
      const ok = `({0}) '{1}': OK`;
      const err1 = `({0}) '{1}': topic not found`;
      const err2 = `({0}) '{1}': {2} not equal: {3} != {4}`;
      const err3 = `({0}) '{1}': {2} not same length: {3} != {4}`;
      const err4 = `({0}) '{1}': line {2} not equal: {3} != {4}`;
      const sorting = (a, b) => {
        if (a.sorting > b.sorting) return 1;
        if (a.sorting < b.sorting) return -1;
        return 0;
      };
  
      const sortedTopics = topicIndex.topics.sort(sorting);
      const sortedTopics2 = topicIndex2.topics.sort(sorting);
      sortedTopics.forEach((topic, i) => {
        if (!Array.isArray(topic.errors)) {
          topic.errors = [];
        }
        const { fileline, errors } = topic;
        const topic2 = sortedTopics2[i];
        const name = topic2 ? topic2.name : 'undefined';
        const data = ['filename', 'fileline', 'type', 'revised', 'sorting'];
        const nums = ['lines', 'seeAlso', 'externalLinks', 'refs'];
        let desc = null;
        //Check topic
        if (!topic2) {
          desc = strformat(err1, lan2, name, filename);
          errors.push({ desc, fileline });
          return;
        }
        //Check filename, fileline, type, revised, sorting
        data.forEach(d => {
          if (topic[d] != topic2[d]) {
            desc = strformat(err2, lan2, name, d, topic[d], topic2[d]);
            errors.push({ desc, fileline });
          }
        });
        //Checks arrays has same number
        nums.forEach(d => {
          const len = Array.isArray(topic[d]) ? topic[d].length : 0;
          const len2 = Array.isArray(topic2[d]) ? topic2[d].length : 0;
          if (len != len2) {
            const t1 = d === 'lines' ? topic[d].length : topic[d];
            const t2 = d === 'lines' ? topic2[d].length : topic2[d];
            desc = strformat(err3, lan2, name, d, t1, t2);
            errors.push({ desc, fileline });
          }
        });
        //Check lines
        topic.lines.forEach((line, i) => {
          const line2 = topic2.lines[i];
          if (line.level != line2.level) {
            desc = strformat(err4, lan2, name, i, line.level, line2.level);
            errors.push({ desc, fileline: line.fileline });
          }
          const lineSA = line.seeAlso ? line.seeAlso : [];
          const lineSA2 = line2.seeAlso ? line2.seeAlso : [];
          if (lineSA.length != lineSA2.length) {
            desc = strformat(err4, lan2, name, i, lineSA, lineSA2);
            errors.push({ desc, fileline: line.fileline });
          }
          const lineRefs = line.refs ? JSON.stringify(line.refs) : '';
          const lineRefs2 = line2.refs ? JSON.stringify(line2.refs) : '';
          if (lineRefs != lineRefs2) {
            desc = strformat(err4, lan2, name, i, lineRefs, lineRefs2);
            errors.push({ desc, fileline: line.fileline });
          }
        });
        //refs must be same length and equal
      });
    } catch (err) {
      throw err;
    }
  };

  return { compare };
};