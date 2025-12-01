
/**
 * Articles class (for processing Newsletters library in Urantiapedia)
 */
export class Articles {
  language = 'en';
  paralells = [];

  constructor(language, paralells) {
    this.language = language;
    this.paralells = paralells;
  }

  /**
   * Gets the paralells for a given paper in The Urantia Book.
   * @param {number} paperIndex Urantia Book paper index starting at zero.
   * [0-196].
   * @return {Object[]} Returns an array of objects with the paralells. The 
   * objects have these values:
   * - par_ref: paragraph reference
   * - sorting: a value for sorting
   * - location: the sentence index in which insert the footnote. If 999
   * the footnote must be inserted at the end of the paragraph.
   * - html: HTML fragment to add in the References section of Urantia Book 
   * paper.
   * - suffix: 'a' for articles or 's' for study aids.
   * Returns an empty array if no paralell exists.
   */
  getParalells(paperIndex) {
    const paralells = this.paralells
      .filter(p => p.ref.startsWith(`${paperIndex},`));
    const urls = {
      a: paralells.filter(p => p.anchor[0] === 'a')
        .map(p => p.url).filter((u, i, ar) => ar.indexOf(u) === i)
        .sort(),
      s: paralells.filter(p => p.anchor[0] === 's')
        .map(p => p.url).filter((u, i, ar) => ar.indexOf(u) === i)
        .sort()
    };

    const result = paralells
      .reduce((ac, cur, i, arr) => {
        const prev = ac.find(p => p.url === cur.url);
        if (!prev) {
          const newp = { ...cur };
          delete newp.anchor;
          delete newp.ref;
          newp.refs = arr
            .filter(p => p.url === cur.url)
            .sort((a, b) => {
              if (a.ref > b.ref) return 1;
              if (a.ref < b.ref) return -1;
              return 0;
            })
            .reduce((ac2, cur2) => {
              const prev2 = ac2.find(r => r.ref === cur2.ref);
              if (prev2) {
                prev2.anchors.push(cur2.anchor);
              } else {
                ac2.push({
                  ref: cur2.ref,
                  anchors: [cur2.anchor]
                });
              }
              return ac2;
            }, []);
          newp.refs.forEach(r => r.anchors.sort());
          newp.suffix = cur.anchor[0];
          ac.push(newp);
        }
        return ac;
      }, [])
      .map(p => {
        const r0 = p.refs[0].ref.split(',');
        const s = parseInt(r0[1]) * 1000 +
          (r0.length === 3 ? parseInt(r0[2]) : 0);
        const back = '<a href="{0}">↑ <small{1}>{2}</small></a>';
        const refs = [];
        const link = p.refs.map(r => {
          const ra = r.ref.split(',');
          const ref = (ra.length == 2 ? `${ra[0]}:${ra[1]}` :
            `${ra[0]}:${ra[1]}.${ra[2]}`);
          const index = urls[p.suffix].indexOf(p.url);
          const cite_format = (ra.length == 2 ? '#p{0}' :
            '#cite_{0}{1}_{2}_{3}');
          const cite_id = (ra.length == 2 ?
            strformat(cite_format, ra[1]) :
            strformat(cite_format, p.suffix, ra[1], ra[2], index));
          const small_id = (ra.length == 2 ? '' :
            ' id="' + cite_id.replace('#cite', 'fn') + '"');
          const hback = strformat(back, cite_id, small_id, ref);
          const links = r.anchors.map((a, j) => {
            return `<a href="${p.url + '#' + a}">#${j + 1}</a>`;
          }).join(', ');
          refs.push(ref);
          return hback + ': ' + links;
        }).join('; ') + '.';
        
        const title = ` <a href="${p.url}"><i>${p.title}</i></a>`;
        const author = p.author != '' 
          ? `, ${replaceTags(p.author, '_', '_', '<i>', '</i>', [])}` 
          : '';
        const pub = (p.publication != '' ? `, ${p.publication}` : '');
        const year = (p.year != '' ? `, ${p.year}` : '');
        const html = ' ' + link + title + author + pub + year;

        return {
          par_refs: refs,
          sorting: s,
          location: 999,
          html: html,
          suffix: p.suffix,
          url: p.url
        };
      });
    result.sort((a, b) => a.sorting - b.sorting);
    return result;
  }
}