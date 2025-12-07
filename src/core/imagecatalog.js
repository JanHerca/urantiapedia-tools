import { strformat } from './utils.js';

// TODO: Could be interesting create an algorythm to locate floating right images:
// - using image-style-align-right and style="margin:10px 0 10px 10px;" in figure tag
// - adding @media (max-width: 1000px){.v-main .contents figure.image-style-align-right{float:none;}}
// to each page in CSS injected to avoid floating in small devices
// - problem is that floating floats next paragraphs, not previous
// and we are locating images after paragraphs
// - also this option should not be use when images are horizontal or when
// other images are close, so it is difficult

/**
 * ImageCatalog class (for images to embed inside The Urantia Book).
 */
export class ImageCatalog {
  language = 'en';
  images = [];

  //Values:
  // 0 - Figure ID
  // 1 - classnames
  // 2 - image path
  // 3 - image file
  // 4 - image caption
  template =
    '<figure id="Figure_{0}" class="{1}">\r\n' +
    '  <img src="{2}/{3}">\r\n' +
    '  <figcaption>\r\n' +
    '    {4}\r\n' +
    '  </figcaption>\r\n' +
    '</figure>\r\n';

  constructor(language, images) {
    this.language = language;
    this.images = images;
  }

  /**
   * Gets image for the given ref or null if no one.
   * @param {string} ref Reference.
   * @return {?string}
   */
  getImageForRef(ref) {
    let img = null;
    this.images.find(s => {
      const i = s.list.find(item => item.ref === ref);
      const link = s.path.indexOf('Jesus_life') != -1 
        ? 'Wikimedia' 
        : s.path.indexOf('Gary_Tonge') != -1 
          ? 'Vision Afar' 
          : 'Link';
      if (i && s.path && i.file) {
        const id = ref.replace(/:|\./g, '_');
        let text = this.language === 'en'
          ? i.text 
          : i[`text_${this.language}`];
        text = (text ? text : '');
        let title = this.language === 'en'
          ? i.title 
          : i[`title_${this.language}`];
        title = (title ? '<em>' + title + '</em>' : '');
        const author = (i.author && i.author != '' ? i.author : '');
        const year = (i.year && i.year != '' ? i.year : '');
        const url = i.url && i.url != ''
          ? `<a href="${i.url}" target="_blank">${link}</a>` 
          : '';
        const captions = [text, title, author, year, url].filter(n => n != '');
        let cls = 'image urantiapedia';
        if (i.float === 'R') {
          cls += ' image-style-align-right';
        } else if (i.float === 'L') {
          cls += ' image-style-align-left';
        }

        img = strformat(this.template, id, cls, s.path, i.file, captions.join(', '));
      }
      return (i != null);
    });
    return img;
  };
}