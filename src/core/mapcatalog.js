
/**
 * MapCatalog class (for maps to embed inside The Urantia Book).
 */
export class MapCatalog {
  language = 'en';
  maps = [];
  translations = [];

  // Values:
  // 0 - title of map
  // 1 - quote from UB
  // 2 - ref from UB
  // 3 - map path
  // 4 - Open map text
  // 5 - map thumbnail path
  // CSS is in override.css
  template =
    '<blockquote class="is-map">\r\n' +
    '  <div>\r\n' +
    '    <p><b>{0}</b></p>\r\n' +
    '    <p><i>{1}</i> [{2}]</p>\r\n' +
    '    <p>\r\n' +
    '      <button type="button" class="v-btn theme--dark v-size--default blue-grey">\r\n' +
    '        <span class="v-btn__content">\r\n' +
    '          <span class="text-none">\r\n' +
    '            <a href="{3}">{4}</a>\r\n' +
    '          </span>\r\n' +
    '        </span>\r\n' +
    '      </button>\r\n' +
    '    </p>\r\n' +
    '  </div>\r\n' +
    '  <div>\r\n' +
    '    <img src="{5}">\r\n' +
    '  </div>\r\n' +
    '</blockquote>\r\n';

  constructor(language, maps, translations) {
    this.language = language;
    this.maps = maps;
    this.translations = translations;
  }

  /**
   * Gets map for the given ref or null if no one.
   * @param {string} ref Reference.
   * @return {?string}
   */
  getMapForRef(ref) {
    const map = this.maps.find(m => m.ref === ref);
    if (!map) {
      return null;
    }
    const title2 = this.translations.find(t => t.text === map.title);
    const title = this.language === 'en' 
      ? map.title
      : (title2 ? title2.translation : map.title);
    const quote2 = this.translations.find(t => t.text === map.quote);
    const quote = this.language === 'en' 
      ? map.quote
      : (quote2 ? quote2.translation : map.quote);
    const ref2 = this.tr('bookAbb') + ' ' + ref;
    const path = `/${this.language}${map.path}`;
    const label = this.tr('lblOpenMap');
    const html = strformat(this.template, title, quote, ref2, path, label,
      map.thumbnail);
    return html;
  }
}