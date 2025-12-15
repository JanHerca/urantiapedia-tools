import { tr, getError, reflectPromise, replaceWords } from 'src/core/utils.js';
import { getWikijsBookRefLink, getWikijsHeader } from 'src/core/wikijs.js';
import { useWriteHTMLToWikijs } from '../useWriteHTMLToWikijs.js';

import path from 'path';

/**
 * Writes all entries in Topic Index in Wiki.js format.
 * @param {Ref<string>} language Language ref.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 * @param {function} addWarning Function to add warning messages.
 */
export const useWriteToWikijs = (
  language,
  uiLanguage,
  addLog,
  addWarning
) => {
  const { writeHTMLToWikijs } = useWriteHTMLToWikijs();

  /**
   * Finds a topic inside a TopicIndex.
   * @param {TopicIndex} topicIndex Topic index to search in.
   * @param {Object} topic Topic to search.
   */
  const findTopic = (topicIndex, topic) => {
    return topicIndex.topics.find(t => {
      return (t.filename === topic.filename && t.fileline === topic.fileline);
    });
  };

  /**
   * Extracts all different link from a topic (and sort them by alphabetic order).
   * @param {Object} topic Topic.
   * @param {Object} topicEN Topic in english.
   * @param {Array.<Error>} err Array of errors.
   * @return {Array.<Object>}
   */
  const sortUniqueSeeAlsoWikijs = (topic, topicEN, err) => {
    let seeAlso = [];
    let seeAlsoObj = [];

    if (topic.lines.length != topicEN.lines.length) {
      err.push(getError(uiLanguage.value, 'topic_invalid_see', topic.name));
      return seeAlsoObj;
    }

    const addSeeAlso = (sa, saEN) => {
      if ((sa && !saEN) || (!sa && saEN) ||
        (sa && saEN && sa.length != saEN.length)) {
        err.push(getError(uiLanguage.value, 'topic_invalid_see', topic.name));
        return;
      }
      if (sa && sa.length > 0) {
        sa.forEach((s, i) => {
          if (seeAlso.indexOf(s) === -1) {
            seeAlso.push(s);
            seeAlsoObj.push({ seeAlso: s, seeAlsoEN: saEN[i] });
          }
        });
      }
    };

    addSeeAlso(topic.seeAlso, topicEN.seeAlso);
    topic.lines.forEach((line, i) => {
      addSeeAlso(line.seeAlso, topicEN.lines[i].seeAlso);
    });

    seeAlsoObj.sort((a, b) => {
      return a.seeAlso.toLowerCase().localeCompare(b.seeAlso.toLowerCase());
    });

    return seeAlsoObj;
  };

  /**
   * Writes an entry of Topic Index in Wiki.js format.
   * @param {string} filePath Output Wiki file.
   * @param {TopicIndex} topicIndex Topic Index in current language to process.
   * @param {Object} topic Object with Topic Index entry.
   * @param {Object} topicEN Object with topic Index entry in english. If 
   * current language is english this object is the same than topic.
   * @param {Array.<Object>} tiNames An array of objects with topic names in
   * current Topic Index, in english, and with aliases.
   */
  const writeFileToWikijs = async (filePath, topicIndex, topic, topicEN, tiNames) => {
    addLog(`Writing TopicIndex file: ${filePath}`);
    try {
      const isEN = language.value === 'en';
      let body = '';
      let header = '';
      const tpath = `/${language.value}/topic`;
      const title = topic.name.substring(0, 1).toUpperCase() + topic.name.substring(1);
      const description = isEN 
        ? undefined 
        : tr('topicOriginalName', language.value) + ': ' + topicEN.name;
      const seeAlsoTxt = tr('topic_see_also', language.value);
      const isRedirect = (
        topic.lines.length === 0 &&
        topic.refs.length === 0 &&
        topic.seeAlso.length > 0 &&
        topic.revised
      );
      const redirectText = isRedirect 
        ? tr('topicRedirect', language.value) 
        : null;
      const notRevisedText = !topic.revised 
        ? tr('topicNotRevised', language.value) 
        : null;
      const redirectsThis = topicIndex.topics
        .filter(t => {
          return (
            t.seeAlso.find(i => i.split(':')[0] === topic.name) &&
            t.name != topic.name &&
            t.revised
          );
        }).map(t => {
          const ti = tiNames.find(i => i.name === t.name);
          return { name: t.name, nameEN: ti.nameEN };
        });
      const tags = [
        'topic', 
        ...(topic.type && topic.type != 'OTHER' ? [topic.type.toLowerCase()] : [])
      ];
      const lineRefs = [];
      let otherRefs = [...topic.refs];

      const writeRefs = (refs) => {
        if (refs && refs.length > 0) {
          body += `<p>${seeAlsoTxt}: `;
          body += refs
            .map(r => getWikijsBookRefLink(r, language.value))
            .join('; ');
          body += '.</p>\r\n';
        }
      };

      header += getWikijsHeader(title, tags, description);
      header += '\r\n';

      // const refs = this.sortUniqueRefs(topic);
      // let refsUsed = refs.map(ru => false);
      const seeAlsoErr = [];
      const seeAlsoObjs = sortUniqueSeeAlsoWikijs(topic, topicEN, seeAlsoErr);
      //TODO: Uncomment for get errors
      // if (seeAlsoErr.length > 0) {
      // 	reject(new Error(seeAlsoErr.map(e => e.message).join(', ')));
      // 	return;
      // }
      //If topic is a redirect
      if (isRedirect) {
        body += 
        `<blockquote class="is-info">` +
        `<p><em>${redirectText}</em></p>` +
        `</blockquote>\r\n`;
      }
      //If topic is not revised
      if (!topic.revised) {
        body += 
        `<blockquote class="is-warning">` +
        `<p><img draggable="false" alt="🚧" src="/_assets/svg/twemoji/1f6a7.svg" class="emoji"> ` +
        `<em>${notRevisedText}</em>` +
        `</p>` +
        `</blockquote>\r\n`;
      }

      //Add line content with headings and references
      topic.lines.forEach((line, i, lines) => {
        const content = line.text;
        const prevline = lines[i - 1];
        const nextline = lines[i + 1];
        const nextline2 = lines[i + 2];
        const level = line.level;
        const prevlevel = (prevline ? prevline.level : -1);
        const nextlevel = (nextline ? nextline.level : -1);
        const nextlevel2 = (nextline2 ? nextline2.level : -1);
        const marks = content.match(/^[#|\*]*/g)[0];
        const prevMarks = (prevline ? prevline.text.match(/^[#|\*]*/g)[0] : "");
        const nextMarks = (nextline ? nextline.text.match(/^[#|\*]*/g)[0] : "");
        const large = (content.length > 150);
        const nextlarge = (nextline && nextline.text.length > 150);
        const isImage = (content.startsWith('<figure'));

        let subcontent = content.replace(/^[#|\*]*/g, '').trim();
        subcontent = subcontent.substring(0, 1).toUpperCase() +
          subcontent.substring(1);

        if (isImage) {
          //Image content is already in HTML
          body += content;
        } else if (nextline && level < nextlevel) {
          const h = `h${line.level + 2}`;
          body += `<${h}> ${subcontent} </${h}>\r\n`;
          otherRefs = [...otherRefs, ...line.refs];
        } else {
          if (!subcontent.match(/[.:!?]$/)) {
            subcontent += '.';
          }
          if (marks.length > 0) {
            if (prevMarks.length < marks.length) {
              //Add start of list
              body += (marks[marks.length - 1] === '#' ? '<ol>' : '<ul>') + '\r\n';
            }
          } else if (
            i === 0 ||
            (prevline && level != prevlevel) ||
            (prevline && level === prevlevel && prevMarks.length > 0) ||
            large
          ) {
            //Add start of paragraph
            body += '<p>';
          }

          //Add links to internal topics
          const nameslinks = [];
          //TODO: Next word separation only works for English and Spanish
          const words = subcontent
            .match(/[a-z0-9áéíóúüñ'-]+(?:'[a-z0-9áéíóúüñ'-]+)*/gi);
          tiNames.forEach(nn => {
            if (nn.name === topic.name) return;
            const ln = nn.nameEN.replace(/\s/g, '_').replace(/[’']/g, '');
            const path = `${tpath}/${ln}`;
            const ipath = body.indexOf(path);
            //If topic used very close skip
            if (
              ipath != -1 &&
              body.length - ipath - path.length < 1000
            ) {
              return;
            }
            nn.names.forEach(n => {
              if (!(topicIndex.isLinkableName(n, subcontent))) return;
              if (
                subcontent.indexOf(n) != -1 &&
                nn.nameEN &&
                words.find(w => n.startsWith(w))
              ) {
                const link = `<a href="${path}">${n}</a>`;
                if (!nameslinks.find(i => i.name === n)) {
                  nameslinks.push({
                    name: n,
                    link
                  });
                }
              }
            });
          });
          if (nameslinks.length > 0) {
            //Order using longest topic names before
            nameslinks.sort((a, b) => b.name.length - a.name.length);
            subcontent = replaceWords(
              nameslinks.map(i => i.name),
              nameslinks.map(i => i.link),
              subcontent
            );
          }

          //Add start list item
          body += (marks.length > 0 ? '<li>' : '');
          //Add subcontent
          body += subcontent + ' ';
          body += (marks.length > 0 && marks.length < nextMarks.length ? '\r\n' : '');

          //Add refs
          if (line.refs && line.refs.length > 0) {
            const j = lineRefs.length + 1;
            lineRefs.push(
              `<li id="fn${j}"><a href="#cite${j}">↑</a>` +
              line.refs
                .map(r => getWikijsBookRefLink(r, language.value))
                .join('; ') +
              '</li>\r\n');
            body += 
              `<sup id="cite${j}">` +
              `<a href="#fn${j}">[${j}]</a>` +
              `</sup> `;
          }

          if (marks.length > 0) {
            if (marks.length === nextMarks.length) {
              //Add end list item
              body += '</li>\r\n';
            } else if (marks.length > nextMarks.length) {
              //Add end list item
              body += '</li>\r\n';
              //Add end of list
              for (let n = 1; n <= marks.length - nextMarks.length; n++) {
                body += (marks[marks.length - n] === '#' ? '</ol>' :
                  '</ul>') + '\r\n';
                body += (marks.length - n > 0 ? '</li>\r\n' : '');
              }
            }
          } else if (
            i === lines.length - 1 ||
            (nextline && level === nextlevel && nextMarks.length > 0) ||
            (nextline && level != nextlevel) ||
            (nextline2 && nextlevel < nextlevel2) ||
            nextlarge
          ) {
            //Add end of paragraph
            body += '</p>\r\n';
          }
        }
      });

      //Add redirects to this
      if (redirectsThis.length > 0) {
        body += `<h2>${tr('topicRedirectsThis', language.value)}</h2>\r\n`;
        body += '<div>\r\n<ul>\r\n';
        redirectsThis.forEach(redir => {
          const redirName = redir.name;
          const redirNameEN = redir.nameEN;
          const redirLink = redirNameEN.replace(/\s/g, '_').replace(/[’']/g, '');
          body += `<li><a href="${tpath}/${redirLink}">${redirName}</a></li>\r\n`;
        });
        body += '</ul>\r\n</div>\r\n';
      }

      //Add Links
      if (seeAlsoObjs && seeAlsoObjs.length > 0) {
        body += `<h2>${tr('topic_links', language.value)}</h2>\r\n`;
        body += '<div>\r\n<ul>\r\n';
        seeAlsoObjs.forEach(alsoObj => {
          const alsoName = alsoObj.seeAlso;
          const alsoNameEN = alsoObj.seeAlsoEN.replace(/[’']/g, '');
          const [alsoNameEN1, alsoNameEN2] = alsoNameEN.split(':');
          const alsoLink1 = alsoNameEN1.replace(/\s/g, '_');
          const alsoLink2 = alsoNameEN2
            ? '#' + alsoNameEN2.replace(/\s/g, '-').toLowerCase()
            : '';
          body += 
            `<li>` +
            `<a href="${tpath}/${alsoLink1}${alsoLink2}">${alsoName}</a>` +
            `</li>\r\n`;
        });
        body += '</ul>\r\n</div>\r\n';
      }

      //Add External Links
      if (topic.externalLinks && topic.externalLinks.length > 0) {
        body += `<h2>${tr('topic_external_links', language.value)}</h2>\r\n`;
        body += '<div>\r\n<ul>\r\n';
        topic.externalLinks.forEach(link => {
          if (link.indexOf('wikipedia') != -1) {
            let linkname = link.substring(link.lastIndexOf('/') + 1)
              .replace(/_/g, ' ');
            body += `<li><a href="${link}">Wikipedia: ${linkname}</a></li>\r\n`;
          } else {
            body += `<li><a href="${link}">${link}</a></li>\r\n`;
          }
        });
        body += '</ul>\r\n</div>\r\n';
      }

      //Add references
      if (lineRefs.length > 0) {
        const fnStyle = (lineRefs.length > 10 ? ' style="column-width: 30em;"' : '');
        body += `<h2>${tr('topic_references', language.value)}</h2>\r\n`;
        body += `<div${fnStyle}>\r\n<ol>\r\n`;
        lineRefs.forEach(f => body += '  ' + f);
        body += '</ol>\r\n</div>\r\n';
      }
      //Add the seeAlso references at Topic level after other references
      writeRefs(otherRefs);

      await writeHTMLToWikijs(filePath, header, body);

    } catch (err) {
      throw err;
    }
  };

  /**
   * Writes all entries in Topic Index in Wiki.js format.
   * @param {string} dirPath Output folder.
   * @param {string} letter Letter in lowercase of topics from Topic Index that 
   * must be read. Those out of the letter are ignored. To read all use `ALL`.
   * @param {TopicIndex} topicIndex Topic Index in current language to process.
   * @param {?TopicIndex} topicIndexEN An optional Topic Index in english. Only
   * required if current language is not English.
   */
  const writeToWikijs = async (dirPath, letter, topicIndex, topicIndexEN) => {
    addLog(`Writing TopicIndex folder: ${dirPath}`);
    try {
      const isEN = language.value === 'en';
      const baseName = path.basename(dirPath.replace(/\\/g, '/'));
      const access = await window.NodeAPI.exists(dirPath);
      if (!access) {
        throw getError(uiLanguage.value, 'folder_no_access', baseName);
      }
      const tiOK = (isEN || (!isEN && topicIndexEN));
      const tiEN = (isEN ? topicIndex : topicIndexEN);
      if (!tiOK) {
        throw getError(uiLanguage.value, 'topic_en_required', baseName);
      }

      const tiNames = topicIndex.topics.map(topic => {
        const tEN = isEN ? topic : findTopic(tiEN, topic);
        return {
          name: topic.name,
          nameEN: (tEN ? tEN.name : null),
          names: [topic.name.split('(')[0].trim(), ...topic.altnames]
        };
      });

      const topicErr = [];
      const promises = topicIndex.topics
        .map(topic => {
          const topicEN = isEN ? topic : findTopic(tiEN, topic);
          if (!topicEN) {
            topicErr.push(getError(uiLanguage.value, 'topic_en_not_found', topic.name));
            return;
          }
          const fileName = topicEN.name.replace(/\s/g, '_').replace(/[’']/g, '');
          const filePath = path.join(dirPath, `${fileName}.html`);
          const isLetter = letter != 'ALL' &&
            !topicEN.name.toLowerCase().startsWith(letter);
          const p = isLetter 
            ? Promise.resolve(null) 
            : writeFileToWikijs(filePath, topicIndex, topic, topicEN, tiNames);
          return reflectPromise(p);
        });
      if (topicErr.length > 0) {
        throw topicErr;
      }
      const results = Promise.all(promises);
      const errors = results.filter(r => r.error).map(r => r.error);
      if (errors.length > 0) {
        throw errors;
      }
    } catch (err) {
      throw err;
    }
  };

  return {
    writeToWikijs
  };

};