import { strformat, removeHTMLTags } from 'src/core/utils.js';
import { Strings } from 'src/core/strings.js';

/**
 * Writes the current index read to Wiki.js HTML format.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useProcessLines = (
  uiLanguage,
  addLog
) => {
  /**
   * Create an array of objects from an array of lines that reduce content
   * to be translated removing parts that are not required for translation.
   * @param {string[]} lines Lines to translate.
   * @param {string} sourceLan Source language code, like `en`.
   * @param {string} targetLan Target language code, like `es`.
   * @param {boolean} isLibraryBook If it is a book (otherwise is an article).
   * @param {UrantiaBook} targetBook Urantia Book in target language.
   * @param {string[]} errors Array of errors for adding any issue found.
   * @return {Object[]} Array of objects.
   */
  const processLines = (
    lines, 
    sourceLan, 
    targetLan, 
    isLibraryBook,
    targetBook,
    errors
  ) => {
    try {
      let headerRead = false;
      let insideHeader = false;
      let insideNavigator = false;
      let insideBookFront = false;
      let insideImage = false;
      let insideMath = false;
      const reAnchor = new RegExp('<a id="[a|s]\\d+_\\d+"><\\/a>', 'g');
      const reUBLink = new RegExp(`\\[[^\\]]+\\]\\(\/${sourceLan}\/` +
        'The_Urantia_Book\/(\\d+)#p(\\d+)(?:_(\\d+))?\\)', 'g');
      const reUBMulti = new RegExp('(\\d+):(\\d+).(\\d+)-(\\d+)', 'g');
      const reUPLink = new RegExp(`\\(?\/${sourceLan}\/[^\\)]+\\)?`, 'g');
      const reUPLink2 = new RegExp(`"\/${sourceLan}\/[^"]+"`, 'g');
      const rePageNumber = new RegExp(`<span id="[^"]+">` +
        `\\[*<sup><small>[^<]+<\\/small><\\/sup>\\]*<\\/span>`, 'g');
      const reVerseNumber = new RegExp(`<sup id="[^"]+">` +
        `<small>[^<]+<\\/small><\\/sup>`, 'g');
      const reVerseNumber2 = new RegExp(
        `<span id="[^"]+"><i>[^<]+<\\/i>[^<]*<\\/span>`, 'g');
      const reSVGText = new RegExp('<text [^>]+>|<\\/text>', 'g');
      const reTitle = new RegExp('<span class="text-h[3|5]">|<\\/span><br>')
      const reLinks = new RegExp(
        `\\(?(https?:\\/\\/[\\w\\d./?=#\\-\\%\\(\\)]+)\\)?`, 'g');
      const reMath = new RegExp('\\$([^ ][^$]*)\\$', 'g');
      const reHref = /href=["'](.*?)["']/g;
      const sourceAbb = Strings.bookAbb[sourceLan];
      const targetAbb = Strings.bookAbb[targetLan];
  
      //Get an array of quote groups. Each contains:
      // [quote_start_index, quote_end_index, ub_ref_as_array]
      const quotesIndexes = lines
        .reduce((ac, cur, i, array) => {
          if (cur.startsWith('>')) {
            if (i === 0 || !array[i - 1].startsWith('>')) {
              ac.push([i, i]);
            } else if (array[i + 1] && !array[i + 1].startsWith('>')) {
              ac[ac.length - 1][1] = i;
            }
          }
          return ac;
        }, [])
        .map(indexes => {
          let n, count = 0, ubLinks, ubLink, ubMultiLinks, link;
          for (n = indexes[0]; n <= indexes[1]; n++) {
            ubLinks = [...lines[n].matchAll(reUBLink)];
            ubLink = ubLinks.length === 1 
              ? [1, 2, 3].map(i => parseInt(ubLinks[0][i])) 
              : [];
            ubMultiLinks = [...lines[n].matchAll(reUBMulti)];
            if (
              ubLink.length > 0 &&
              ubLink.findIndex(i => isNaN(i)) === -1
            ) {
              link = ubLink.slice();
              if (
                ubMultiLinks.length === 1 &&
                !isNaN(parseInt(ubMultiLinks[0][4]))
              ) {
                link.push(parseInt(ubMultiLinks[0][4]));
              }
              count++;
            }
            if (count > 1) {
              break;
            }
          }
          return [...indexes, (count === 1 ? link : null)];
        })
        .filter(indexes => indexes[2] != null);
  
      return lines.map((line, i, array) => {
        let ignore = false;
        let remove = false;
        let text = null;
        let extractIndex = -1;
        let line_type = 'other';
        const errors = [];
        const extracts = [];
        const msg1 = 'Urantia Book ref in line: {0}|{1}:{2}.{3} - {4}';
        const prev = (i > 0 ? array[i - 1] : null);
        const isSep = line.startsWith('---');
        const isTitle = line.startsWith('title:');
        const isDesc = line.startsWith('description:');
        const hasDesc = (isDesc &&
          line.replace('description:', '').replace(/"/g, '').trim() != '');
        const isCopy = line.startsWith('<p class="v-card v-sheet theme--light grey lighten-3');
        const isNavStart = line.startsWith('<figure class="table chapter-navigator">');
        const isImgStart = line.indexOf('class="image urantiapedia') != -1;
        const isBookFrontStart = line.startsWith('<div class="urantiapedia-book-front');
        const isBookFrontText = line.trim().startsWith('<text style="');
        const isFigCaption = line.startsWith('<figcaption');
        const isNavText = line.trim().startsWith('<span class="');
        const isNavLink = line.trim().startsWith('<a href="/');
        const isPrevEnd = (prev && prev.startsWith('</figure>'));
        const isDivEnd = (prev && prev.startsWith('</div>'));
        const isHtml =
          line.startsWith('<br style="clear:both') ||
          line.startsWith('<p style="text-align:center') ||
          line.startsWith('<br>') ||
          line.startsWith('<br/>') ||
          line.startsWith('</p>') ||
          line.trim() == '<br>' ||
          line.trim() == '<br/>';
        const isMathSep = line.startsWith('$$');
        const isMathLine = line.startsWith('$$') && line.endsWith('$$');
        const isQuote = line.startsWith('>');
        const isBlock = line.startsWith('{.is-');
        const isQuoteBlank = isQuote && line.length < 7;
        const ubLinks = [...line.matchAll(reUBLink)].reduce((ac, cur) => {
          const nums = [1, 2, 3].map(i => parseInt(cur[i]));
          let par = null;
          if (nums.findIndex(i => isNaN(i)) === -1) {
            par = targetBook.getPar(nums[0], nums[1], nums[2]);
            nums.push(par.par_content);
            ac.push(nums);
          }
          return ac;
        }, []);
        const quoteGroup = quotesIndexes.find(qi => {
          return (qi[0] <= i && qi[1] >= i);
        });
  
        const genericReplace = match => {
          extractIndex++;
          extracts.push(match);
          return `%%${extractIndex}%%`;
        };
  
        //Check if line is inside header or is a separator
        if (!headerRead && isSep) {
          if (insideHeader) {
            headerRead = true;
          }
          insideHeader = !insideHeader;
        }
        if ((insideHeader && !(isTitle || hasDesc)) || isSep) {
          ignore = true;
        }
        if (insideHeader) {
          line_type = isTitle ? 'title' : hasDesc ? 'description' : 'header';
        }
        //Check if line is copyright
        if (isCopy) {
          line_type = 'copyright';
        }
        //Check if line is inside navigator: in articles must be ignored 
        // and removed, but not in books
        insideNavigator = !insideNavigator && isNavStart 
          ? true 
          : (insideNavigator && isPrevEnd ? false : insideNavigator);
        if (insideNavigator) {
          ignore = !isLibraryBook || !(isNavText || isNavLink);
          remove = !isLibraryBook;
          line_type = 'navigator';
        }
        //Check empty line, break line, or other html to ignore
        if (line.trim() === '' || isHtml || isQuoteBlank || isBlock) {
          line_type = 'blank';
          ignore = true;
        }
        //Check book front
        insideBookFront = !insideBookFront && isBookFrontStart 
          ? true 
          : (insideBookFront && isDivEnd ? false : insideBookFront);
        if (insideBookFront) {
          ignore = !isLibraryBook || !isBookFrontText;
          line_type = 'bookfront';
        }
        //Check image (only translate figcaption)
        insideImage = !insideImage && isImgStart 
          ? true 
          : (insideImage && isPrevEnd ? false : insideImage);
        if (insideImage) {
          ignore = !isFigCaption;
          line_type = 'image';
        }
        //Check Math LaTeX block
        insideMath = !insideMath && isMathSep && !isMathLine
          ? true
          : (insideMath && isMathSep && !isMathLine ? false : insideMath);
        if (insideMath || (isMathSep && !isMathLine)) {
          ignore = true;
          line_type = 'math';
        }
        if (isMathLine) {
          ignore = true;
          line_type = 'math';
        }
  
        //Update text to be translated
        if (!ignore) {
          //Anchors: remove, they are added automatically (in articles)
          if (!isLibraryBook) {
            text = line.replace(reAnchor, '');
          }
          //Title
          if (isTitle) {
            text = line.replace('title:', '').replace(/"/g, '').trim();
          }
          //Description
          if (hasDesc) {
            text = line.replace('description:', '').replace(/"/g, '').trim();
          }
          //Copyright
          if (isCopy) {
            text = removeHTMLTags(line, '<p>', '</p>', false, errors, uiLanguage.value);
          }
          //Check Urantia Book quotes
          if (quoteGroup) {
            ignore = true;
            line_type = 'quote';
          } else if (ubLinks.length > 0) {
            ubLinks.forEach(ubl => {
              errors.push(strformat(msg1, i + 1, ...ubl).split('|'));
            });
          }
          //Urantia Book links
          text = (text ? text : line).replace(reUBLink, match => {
            let extract = match;
            extractIndex++;
            if (match.indexOf(sourceAbb) != -1) {
              extract = extract.replace(sourceAbb, targetAbb);
            }
            extract = extract.replace(`/${sourceLan}/`, `/${targetLan}/`);
            extracts.push(extract);
            return `%%${extractIndex}%%`;
          });
          //Other UP links
          text = text.replace(
            insideNavigator ? reUPLink2 : reUPLink,
            match => {
              let extract = match;
              extractIndex++;
              extract = extract.replace(`/${sourceLan}/`, `/${targetLan}/`);
              extracts.push(extract);
              return `%%${extractIndex}%%`;
            }
          );
          //Page numbers, verse numbers, frontpage texts
          if (isLibraryBook) {
            text = text.replace(rePageNumber, genericReplace)
              .replace(reVerseNumber, genericReplace)
              .replace(reVerseNumber2, genericReplace)
              .replace(reTitle, genericReplace)
              .replace(reSVGText, genericReplace);
          }
          //External links
          // text = text.replace(reLinks, genericReplace);
          text = text.replace(reHref, (match, p1) => {
            extractIndex++;
            extracts.push(p1);
            const replacement = `href="%%${extractIndex}%%"`;
            return replacement;
          });
          //Math LaTeX
          text = text.replace(reMath, genericReplace);
  
          //If text has collapsed set to ignore
          if (insideNavigator && text.trim() === '<a href="%%0%%">') {
            ignore = true;
          }
  
          if (text.trim() === '%%0%%') {
            ignore = true;
          }
        }
  
        //Return
        return {
          index: i,
          line,
          line_type,
          text,
          ignore,
          remove,
          extracts,
          quoteGroup,
          ...(errors.length > 0 ? { errors } : {})
        };
      });
    } catch (err) {
      throw err;
    }
  };

  return {
    processLines
  };
};