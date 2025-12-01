import { Strings } from 'src/core/strings';
import { replaceSpecialChars, getBookPaperTitle } from 'src/core/utils';

/**
 * Returns the default header for a Wiki.js page.
 * @param {string} title Title.
 * @param {string[]} tags Tags.
 * @param {string|undefined} desc Description.
 * @param {string|undefined} editor Editor. By default is 'ckeditor', but can
 * be 'markdown'.
 * @return {string}
 */
export const getWikijsHeader = (title, tags, desc, editor = 'ckeditor') => {
  const date = new Date();
  const datestr =
    `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}` +
    `T${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}Z`;
  const header =
   `${editor === 'markdown' ? '---' : '<!--'}\r\n` +
    `title: "${title}"\r\n` +
    `description: ${desc ? '"' + desc + '"' : ''}\r\n` +
    `published: true\r\n` +
    `date: ${datestr}\r\n` +
    `tags: ${(tags ? tags.join(', ') : '').replace(/, $/, '')}\r\n` +
    `editor: ${editor}\r\n` +
    `dateCreated: ${datestr}\r\n` +
    `${editor === 'markdown' ? '---' : '-->'}\r\n`;
  return header;
};

/**
 * Fixes the header of a Wiki.js maintaing previous creation date.
 * @param {string} header Header.
 * @param {string[]} prevLines Previous lines.
 * @param {string[]} curLines Current lines.
 * @return {?string}
 */
export const fixWikijsHeader = (header, prevLines, curLines) => {
  let newHeader = null;
  const prevDate = prevLines.findIndex(line => line.startsWith('dateCreated:'));
  const curDate = curLines.findIndex(line => line.startsWith('dateCreated:'));
  const changedLines = prevLines
    .filter((line, i) => line != curLines[i] && !line.startsWith('date'));
  if (changedLines.length > 0 || prevLines.length != curLines.length) {
    if (prevDate != -1 && curDate != -1) {
      newHeader = header.replace(curLines[curDate], prevLines[prevDate]);
    } else {
      newHeader = header;
    }
  }
  return newHeader;
};

/**
 * Returns the links to show on top and bottom of a chapter of a book.
 * @param {string} prevLink Link to previous chapter.
 * @param {string} indexLink Link to index of the book.
 * @param {string} nextLink Link to next chapter.
 * @return {string}
 */
export const getWikijsLinks = (prevLink, indexLink, nextLink) => {
  const links =
    `<figure class="table chapter-navigator">\r\n` +
    `  <table>\r\n` +
    `    <tbody>\r\n` +
    `      <tr>\r\n` +
    `        <td>\r\n` +
    `${prevLink}` +
    `        </td>\r\n` +
    `        <td>\r\n` +
    `${indexLink}` +
    `        </td>\r\n` +
    `        <td>\r\n` +
    `${nextLink}` +
    `        </td>\r\n` +
    `      </tr>\r\n` +
    `    </tbody>\r\n` +
    `  </table>\r\n` +
    `</figure>\r\n`;
  return links;
};

/**
 * Returns the links to show on top and bottom of a book chapter.
 * @param {Object} options Options.
 * @param {?string} options.prevTitle Previous title.
 * @param {?string} options.prevPath Previous path.
 * @param {?string} options.nextTitle Next title.
 * @param {?string} options.nextPath Next path.
 * @param {?string} options.fullIndexTitle Full text of index title.
 * @param {?string} options.indexTitle Text to prefix index title.
 * @param {string} options.indexPath Index path.
 * @return {string}
 */
export const getWikijsNavLinks = (options) => {
  const { prevTitle, prevPath, nextTitle, nextPath,
    indexTitle, indexPath, fullIndexTitle } = options;
  const lan = indexPath.split('/')[1];
  const indexName = fullIndexTitle ? fullIndexTitle :
    (indexTitle ? indexTitle + ' — ' : '') + Strings.bookIndexName[lan];
  const pl2 = ' class="pl-2"';
  const pr2 = ' class="pr-2"'
  const spanPrev = '<span class="mdi mdi-arrow-left-drop-circle"></span>';
  const spanNext = '<span class="mdi mdi-arrow-right-drop-circle"></span>';
  const spanIndex = '<span class="mdi mdi-book-open-variant"></span>';
  const prevLink = (prevTitle && prevPath ?
    `        <a href="${prevPath}">\r\n` +
    `          ${spanPrev}<span${pl2}>${prevTitle}</span>\r\n` +
    `        </a>\r\n` : '');
  const indexLink =
    `        <a href="${indexPath}">\r\n` +
    `          ${spanIndex}<span${pl2}>${indexName}</span>\r\n` +
    `        </a>\r\n`;
  const nextLink = (nextTitle && nextPath ?
    `        <a href="${nextPath}">\r\n` +
    `          <span${pr2}>${nextTitle}</span>${spanNext}\r\n` +
    `        </a>\r\n` : '');
  return getWikijsLinks(prevLink, indexLink, nextLink);
};

/**
 * Gets the HTML fragment in Wiki.js for the copyright of the Urantia Book.
 * @param {number[]} years The array of years of each translation.
 * @param {string[]} copyrights The array of copyrights of each translation.
 * @param {string} language Language code.
 * @returns {string}
 */
export const getWikijsBookCopyright = (years, copyrights, language) => {
  const multi = years.length > 1;
  const masterYear = Strings.bookMasterYear[language];
  const foundation = Strings.foundation[language];
  const freedomain = Strings.freedomain[language];
  const translations = Strings.translations[language];
  let html = '<p class="v-card v-sheet theme--light grey lighten-3 px-2 mb-4">';
  if (multi) {
    if (language === 'en') {
      html += `${freedomain}. ` +
        '(SRT = <a href="https://www.urantia.org/urantia-book' +
        '/text-standardization">Standard Reference Text</a>).';
    } else {
      const ys = years.slice(1);
      const copys = copyrights.slice(1);
      const copysYears = [];
      copys.forEach((c, i) => {
        const copyYears = copysYears.find(cy => cy[0] === c);
        if (copyYears) {
          copyYears[1].push(ys[i]);
        } else {
          copysYears.push([c, [ys[i]]]);
        }
      });
      html += `${freedomain}.`;
      copysYears.forEach(cy => {
        const y = cy[1].join(', ');
        const c = cy[0] === 'UF' ? foundation : cy[0];
        html += `<br>${translations} © ${y} ${c}`
      });
    }
  } else {
    html += (language === 'en' ? freedomain : `© ${masterYear} ${foundation}`);
  }
  html += '</p>\r\n';
  return html;
};

/**
 * Gets the HTML fragment in Wiki.js for the top buttons that switch the
 * visibility of translations in a multi-version mode.
 * @param {string[]} labels The array of labels of each translation.
 * @param {string} language Language code.
 * @param {string[]} colors List of colors to use for each button. Max to 7.
 * @returns {string}
 */
export const getWikijsBookButtons = (labels, language, colors) => {
  let html = '<div class="d-sm-flex mt-2">\r\n';
  html += labels.map((label, i) => {
    const lname = (i === 0 ? Strings.enLanguage[language] :
      Strings.ownLanguage[language]);
    return (
      '  <div class="pr-sm-5" style="flex-basis:100%">\r\n' +
      `    <a id="urantiapedia-button-${i + 1}"` +
      ` class="v-btn title white--text ${colors[i]} rounded-lg ` +
      `py-1 px-2 d-flex align-center">\r\n` +
      `      <i class="mdi mdi-radiobox-marked pr-2"></i>` +
      `<span>${lname} ${label}</span>\r\n` +
      '    </a>\r\n' +
      '  </div>\r\n'
    );
  }).join('');
  html += '</div>\r\n';
  return html;
};

/**
 * Gets the HTML in Wiki.js for the titles of papers in a multi-version mode.
 * @param {Object[]} papers The array of objects with the papers of each
 * translation.
 * @param {string} language Language code.
 * @returns {string}
 */
export const getWikijsBookTitles = (papers, language) => {
  const html = '<div class="d-sm-flex">\r\n' +
    papers.map((p, pi) => {
      const lan = (pi === 0 ? 'en' : language);
      const paperWord = Strings.bookPaper[lan];
      const pt = p.paper_title.replace(paperWord, '').toUpperCase();
      return (
        `  <div class="urantiapedia-column-${pi + 1} pr-sm-5" ` +
        `style="flex-basis:100%">\r\n` +
        `    <p class="text-h4 font-weight-bold text-break"> ${pt} </p>\r\n` +
        '  </div>\r\n'
      );
    }).join('') +
    '</div>\r\n';
  return html;
};

/**
 * Gets the HTML in Wiki.js for the titles of sections in single-version or 
 * multi-version mode.
 * @param {(Object|Object[])} papers The array of objects with the papers of each
 * translation or only one object to obtain the single version.
 * @returns {string}
 */
export const getWikijsBookSectionTitles = (papers, section_index) => {
  let html = '';
  const multi = Array.isArray(papers);
  const masterIndex = (multi ? papers.findIndex(p => p.isMaster) : -1);
  const paper = (multi ? papers[masterIndex] : papers);
  const section = paper.sections[section_index];
  const stitle = section.section_title
    ? replaceSpecialChars(section.section_title).toUpperCase() 
    : null;
  const cls = (multi ? ' mt-0' : '');
  const cls2 = (multi ? ' class="mt-0"' : '');
  const hidden1 = (multi ? ' style="visibility: hidden; height: 5px;"' : '');
  if (stitle) {
    html += `<h2 id="p${section_index}" class="toc-header${cls}"${hidden1}>` +
      `<a href="#p${section_index}" class="toc-anchor">¶</a> ${stitle} </h2>\r\n`;
  } else {
    html += `<span id="p${section_index}"${cls2}${hidden1}>` +
      `<a href="#p${section_index}" class="toc-anchor">¶</a> </span>\r\n`;
  }

  if (multi && stitle) {
    html += '<div class="d-sm-flex">\r\n' +
      papers.map((p, pi) => {
        const st = p.sections[section_index].section_title;
        const st2 = replaceSpecialChars(st).toUpperCase();
        return (
          `  <div class="urantiapedia-column-${pi + 1} pr-sm-5" ` +
          `style="flex-basis:100%">\r\n` +
          `    <p class="text-h5 font-weight-bold"> ${st2} </p>\r\n` +
          '  </div>\r\n'
        );
      }).join('') +
      '</div>\r\n';
  }

  return html;
};

/**
 * Gets the HTML fragment in Wiki.js with the reference that is added before
 * each paragraph.
 * @param {boolean} multi If HTML is for multi-version or not.
 * @param {string} ref The reference of the 
 * @param {string} language Language code.
 * @param {?string} color Optional color.
 * @param {?string} label Optional label.
 * @param {?boolean} hide_ref Optional, if hide reference.
 * @returns {string}
 */
export const getWikijsBookParRef = (
  multi, 
  ref, 
  language, 
  color = 'blue', 
  label = '1955', 
  hide_ref = false
) => {
  let html = '';
  if (multi) {
    html += `<sup class="white--text ${color} rounded px-1">` +
      `<small>${label}</small></sup>   `;
  }
  const vals = ref.replace(/[:.]/g, "|").split('|');
  const suffix = (multi && language != 'en' ? '_Multiple' : '');
  const path = `/${language}/The_Urantia_Book${suffix}/` +
    `${vals[0]}#p${vals[1]}_${vals[2]}`;
  const link = `<a href="${path}">${ref}</a>`;
  const hidden = (hide_ref ? ' class="d-none"' : '');
  html += `<sup${hidden}><small>${link}</small></sup>  `;
  return html;
};

/**
 * Gets the HTML fragment in Wiki.js for a reference to The Urantia Book.
 * @param {string} book_ref Book ref.
 * @param {string} language Language code.
 * @returns {string}
 */
export const getWikijsBookRefLink = (book_ref, language) => {
  const bookAbb = Strings.bookAbb[language];
  const bookName = Strings.bookName.en.replace(/ /g, "_");
  const lan = (language === 'en' ? '' : '/' + language);
  const path = `${lan}/${bookName}`;
  const text = `${bookAbb} ${book_ref}`;
  let link = '';
  let ref = book_ref.replace(/[:.,-]/g, "|");
  let data = ref.split('|');
  if (data.length >= 3) {
    link = `<a href="${path}/${data[0]}#p${data[1]}_${data[2]}">${text}</a>`;
  } else if (data.length === 2) {
    link = `<a href="${path}/${data[0]}#p${data[1]}">${text}</a>`;
  } else if (data.length === 1) {
    link = `<a href="${path}/${data[0]}">${text}</a>`;
  }
  return link;
};

/**
 * Gets the HTML fragment in Wiki.js for a top header link to a paper of 
 * The Urantia Book.
 * @param {(Object|null)} paper Paper object or null.
 * @param {string} language Language code.
 * @param {boolean} isMultiple If it is The Urantia Book shown as multiple
 * versions or not.
 * @param {(boolean|null)} isPrev If the link is for a previous paper (true),
 * a next paper (false) or other (null).
 * @return {string}
 */
export const getWikijsBookLink = (paper, language, isMultiple, isPrev) => {
  if (!paper) {
    return ' ';
  }
  const i = paper.paper_index;
  const isIndex = (isPrev === null);
  const multiple = isMultiple ? '_Multiple' : '';
  const bookName = Strings.bookName.en.replace(/ /g, "_");
  const path = `/${language}/${bookName}${multiple}`;

  let html = '';
  if (isIndex) {
    const indexName = Strings.bookIndexName[language];
    const indexNameEN = Strings.bookIndexName.en;
    const path2 = (isMultiple ? `/${language}/${bookName}/${i}` :
      `/${language}/${bookName}_Multiple/${i}`);
    const icon = (isMultiple ? 'mdi-view-array' : 'mdi-view-parallel');
    const key = (isMultiple ? 'bookSingleVersion' : 'bookMultipleVersion');
    const text2 = Strings[key][language];
    html += (
      `        <a href="${path}/${indexNameEN}">\r\n` +
      `          <span class="mdi mdi-book-open-variant"></span>` +
      `<span class="pl-2">${indexName}</span>\r\n` +
      `        </a>\r\n` +
      '        <br>\r\n' +
      `        <a href="${path2}">\r\n` +
      `          <span class="mdi ${icon}"></span>` +
      `<span class="pl-2">${text2}</span>\r\n` +
      `        </a>\r\n`
    );
    return html;
  } else {
    const text = getBookPaperTitle(paper, language);
    if (isPrev === true) {
      html += (
        `        <a href="${path}/${i}">\r\n` +
        `          <span class="mdi mdi-arrow-left-drop-circle"></span>` +
        `<span class="pl-2">${text}</span>\r\n` +
        `        </a>\r\n`
      );
    } else if (isPrev === false) {
      html += (
        `        <a href="${path}/${i}">\r\n` +
        `          <span class="pr-2">${text}</span>` +
        `<span class="mdi mdi-arrow-right-drop-circle"></span>\r\n` +
        `        </a>\r\n`
      );
    }
  }
  return html;
};

/**
 * Gets the HTML fragment in Wiki.js top header link in index of The Urantia Book.
 * @param {string} language Language code.
 * @param {boolean} isMultiple If it is The Urantia Book shown as multiple
 * versions or not.
 * @param {boolean} isExtended If index is extended one.
 * @return {string}
 */
export const getWikijsBookIndexLink = (language, isMultiple, isExtended) => {
  let html = '';
  const bookName = Strings.bookName.en.replace(/ /g, "_");
  const multiple = (isMultiple ? '' : '_Multiple');
  const icon = (isMultiple ? 'mdi-view-array' : 'mdi-view-parallel');
  const key = (isMultiple ? 'bookSingleVersion' : 'bookMultipleVersion');
  const suffix = (isExtended ? '_Extended' : '');
  const path2 = `/${language}/${bookName}${multiple}/Index${suffix}`;
  const text2 = Strings[key][language];
  html += (
    `        <a href="${path2}">\r\n` +
    `          <span class="mdi ${icon}"></span>` +
    `<span class="pl-2">${text2}</span>\r\n` +
    `        </a>\r\n`
  );
  return html;
};

/**
 * Gets the HTML fragment in Wiki.js for the part title in index of The Urantia Book.
 * @param {Object[]} data Array of objects with needed data.
 * @param {number} index Index of the part.
 * @param {boolean} isMultiple If it is The Urantia Book shown as multiple
 * versions or not.
 * @return {string}
 */
export const getWikijsBookIndexPartTitle = (data, index, isMultiple) => {
  let html = '';
  if (isMultiple) {
    const mtitle = data.find(d => d.isMaster).parts_titles[index];
    html += `<h2 class="toc-header mt-0" style="visibility: hidden; height: 5px;">${mtitle}</h2>\r\n`;
    html += (
      '<div class="d-sm-flex">\r\n' +
      data.map((d, c) => {
        const title = d.parts_titles[index];
        return (
          `  <div class="urantiapedia-column-${c + 1} pr-sm-5" ` +
          `style="flex-basis:100%">\r\n` +
          `    <p class="text-h5 font-weight-bold"> ${title} </p>\r\n` +
          `  </div>\r\n`
        );
      }).join('') +
      '</div>\r\n'
    );
  } else {
    html += `<h2> ${data[0].parts_titles[index]} </h2>\r\n`;
  }
  return html;
};

/**
 * Gets the HTML fragment in Wiki.js for the part description in index of The Urantia Book.
 * @param {Object[]} data Array of objects with needed data.
 * @param {number} index Index of the part.
 * @param {boolean} isMultiple If it is The Urantia Book shown as multiple
 * versions or not.
 * @return {string}
 */
export const getWikijsBookIndexPartDesc = (data, index, isMultiple) => {
  let html = '';
  const firstDescs = data[0].parts_descs[index];
  if (!firstDescs) return html;
  if (isMultiple) {
    html += firstDescs
      .map((desc0, n) => {
        return (
          `<div id="p${index}_${n + 1}" class="d-sm-flex">\r\n` +
          data.map((d, c) => {
            const desc = d.parts_descs[index];
            return (
              `  <div class="urantiapedia-column-${c + 1} pr-sm-5" ` +
              `style="flex-basis:100%">\r\n` +
              `    <p>${desc}</p>\r\n` +
              `  </div>\r\n`
            );
          }).join('') +
          '</div>\r\n'
        );
      }).join('');
  } else {
    html += firstDescs.map((desc0, n) => {
      return `<p id="p${index}_${n + 1}">${desc0}</p>\r\n`;
    }).join('');
  }
  return html;
};

/**
 * Gets the HTML fragment in Wiki.js for the paper content in index of The Urantia Book.
 * @param {Object[]} data Array of objects with needed data.
 * @param {number} index Index of the paper.
 * @param {boolean} isMultiple If it is The Urantia Book shown as multiple
 * versions or not.
 * @param {boolean} isExtended If index is extended one.
 * @return {string}
 */
export const getWikijsBookIndexPaper = (data, index, isMultiple, isExtended) => {
  let html = '';
  const ub = Strings.bookName.en.replace(/\s/g, '_');
  const isEven = index % 2 === 0;
  const master = data.find(d => d.isMaster).papers[index];
  const { title: mTitle, author: mAuthor } = master;

  const getExtended = (d) => {
    const space = (isMultiple ? '    ' : '');
    let h = `${space}<ul>\r\n`;
    const suffix = (isMultiple ? '_Multiple' : '');
    const p = `/${d.language}/${ub}${suffix}/${index}`;
    d.papers[index].sections.forEach(section => {
      if (section.index === 0 && section.subsections) {
        section.subsections.forEach((ss, j) => {
          const isss2 = ss.startsWith('_');
          const ss2 = ss.replace('_', '');
          const margin = isss2 ? 'ml-4' : 'ml-2';
          h += `${j == 0 ? '' : '<br>'}<span class="${margin}">${ss2}</span>`;
        });
      }
      if (section.title) {
        h += `${space}  <li><a href="${p}#p${section.index}">` +
          `${section.title}</a>`;
        if (section.subsections) {
          section.subsections.forEach(ss => {
            const isss2 = ss.startsWith('_');
            const ss2 = ss.replace('_', '');
            const margin = isss2 ? 'ml-4' : 'ml-2';
            h += `<br><span class="${margin}">${ss2}</span>`;
          });
        }
        h += `</li>\r\n`;
      }
    });
    h += `${space}</ul>\r\n`;
    return h;
  };
  
  if (isMultiple) {
    if (isExtended) {
      html += `<h3 class="toc-header mt-0" ` +
        `style="visibility: hidden; height: 2px;">${mTitle}</h3>\r\n`;
      html += (
        `<div class="d-sm-flex">\r\n` +
        data.map((d, c) => {
          const title = d.papers[index].title;
          return (
            `  <div class="urantiapedia-column-${c + 1} pr-sm-5" ` +
            `style="flex-basis:100%">\r\n` +
            `    <p class="text-h6 font-weight-bold">${title}</p>\r\n` +
            `  </div>\r\n`
          );
        }).join('') +
        '</div>\r\n'
      );
      html += (
        `<div class="d-sm-flex">\r\n` +
        data.map((d, c) => {
          return (
            `  <div class="urantiapedia-column-${c + 1} pr-sm-5" ` +
            `style="flex-basis:100%">\r\n` +
            getExtended(d) +
            `  </div>\r\n`
          );
        }).join('') +
        '</div>\r\n'
      );
    } else {
      html += (
        `<div class="d-sm-flex">\r\n` +
        data.map((d, c) => {
          const title = d.papers[index].title;
          const suffix = (isMultiple ? '_Multiple' : '');
          const path = `/${d.language}/${ub}${suffix}/${index}`;
          return (
            `  <div class="urantiapedia-column-${c + 1} pr-sm-5" ` +
            `style="flex-basis:100%">\r\n` +
            `    <div class="pr-sm-5" style="flex-basis:100%">\r\n` +
            `      <span><a href="${path}">${title}</a></span>\r\n` +
            `    </div>\r\n` +
            `    <div class="pr-sm-5 text-right" style="flex-basis:100%">\r\n` +
            `      <span>${mAuthor}</span$>\r\n` +
            `    </div>\r\n` +
            `  </div>\r\n`
          );
        }).join('') +
        '</div>\r\n'
      );
    }
  } else {
    const pTitle = data[0].papers[index].title;
    const pPath = `/${data[0].language}/${ub}/${index}`;
    const pAuthor = data[0].papers[index].author;
    if (isExtended) {
      html += `<h3> ${pTitle} </h3>\r\n`;
      html += getExtended(data[0]);
    } else {
      const even = isEven ? ' grey lighten-4' : '';
      html += (
        `  <div class="d-sm-flex mx-1 my-1 px-1 py-1${even}">\r\n` +
        `    <div class="pr-sm-5" style="flex-basis:100%">\r\n` +
        `      <span><a href="${pPath}">${pTitle}</a></span>\r\n` +
        `    </div>\r\n` +
        `    <div class="pr-sm-5 text-right" style="flex-basis:100%">\r\n` +
        `      <span>${pAuthor}</span$>\r\n` +
        `    </div>\r\n` +
        `  </div>\r\n`
      );
    }
  }
  return html;
};