

/**
 * Writes the current index read to Wiki.js HTML format.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useWriteUBParalellsToTSV = (
  uiLanguage,
  addLog
) => {

  /**
   * Writes cross refs (paralells) between articles and Urantia Book.
   * Requires a previous call to readArticlesFromWikijs.
   * @param {string} filePath Output file.
   * @param {Object[]} articles Array of objects with articles data.
   */
  const writeUBParalellsToTSV = async (filePath, articles) => {
    try {
      addLog(`Writing paralells to file: ${filePath}`);

      let lines = [];
      if (articles.length == 0) {
        return null;
      }
      articles.forEach(article => {
        let { refs, title, author, year, publication, url } = article;
        author = (author ? author : '');
        year = (year ? year : '');
        pub = (publication ? publication : '');
        if (refs.length == 0) {
          return;
        }
        refs.forEach(ref => {
          const content = `${ref.anchor}\t${ref.ref.join(',')}\t` +
            `${title}\t${url}\t${author}\t${pub}\t${year}`;
          lines.push(content);
        });
      });
      const errors = articles
        .filter(a => a.errors.length > 0)
        .map(a => {
          const errs = a.errors.join('; ');
          return new Error(`Error in ${a.url}: ${errs}`);
        });
      await window.NodeAPI.writeFile(filePath, lines.join('\n'));
      if (errors.length > 0) {
        throw errors;
      }

    } catch (err) {
      throw err;
    }

  };

  return {
    writeUBParalellsToTSV
  };
};