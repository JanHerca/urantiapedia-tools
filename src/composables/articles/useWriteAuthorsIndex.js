

/**
 * Writes the current index read to Wiki.js HTML format.
 * @param {Ref<string>} uiLanguage UI language ref.
 * @param {function} addLog Function to add log messages.
 */
export const useWriteAuthorsIndex = (
  uiLanguage,
  addLog
) => {

  /**
   * Writes the index of authors.
   * @param {string} filePath Output file.
   * @param {Object[]} indexes Array of objects with indexes. Returned using
   * `getAuthorsIndex`.
   * @param {string[]} authorPaths Relative paths of authors.
   * For example, `/en/article/Dick_Bain`
   */
  const writeAuthorsIndex = async (filePath, indexes, authorPaths) => {
    try {
      addLog(`Writing authors index: ${filePath}`);
      const lines = [];
      authorPaths.forEach(authorPath => {
        lines.push(authorPath, '');
        indexes.forEach(index => {
          const p = index.publication.trim();
          index.articles
            .filter(a => a.path.startsWith(authorPath))
            .forEach(a => {
              const i = a.issue.trim();
              lines.push(`- [${a.title}](${a.path}), ${p}, ${i}`);
            });
        });
        lines.push('');
      });
      await window.NodeAPI.writeFile(filePath, lines.join('\n'));
    } catch (err) {
      throw err;
    }
  };

  return {
    writeAuthorsIndex
  };
};