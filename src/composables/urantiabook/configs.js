export const bookConfigs = [
  {
    name: 'generic',
    paperTitle: 'h1[id=U{paperIndex}_0_0]',
    secs: 'h2',
    pars: 'p',
    titlesFile: /02-.+html/,
    authors: [{
        item: 'tr',
        index: ['td a', 0],
        author: ['td', 2]
      }, {
        item: 'p',
        index: ['span', 0],
        author: ['span', 2]
      }
    ],
    languages: ['ar', 'bg', 'cs', 'da', 'de', 'en', 'es', 'es-1993',
      'es-2021', 'et', 'fa', 'fi', 'fr', 'hu', 'id', 'it', 'ko',
      'lt', 'nl', 'pl', 'pt', 'ro', 'ru', 'sv', 'tr', 'zh']
  },
  {
    name: 'french-weiss',
    paperTitle: 'h1',
    secs: 'h2',
    sec_exception: '* * *',
    pars: 'p',
    titlesFile: /02-.+html/,
    languages: ['fr-weiss']
  },
  {
    name: 'greek',
    paperTitle: 'h3',
    secs: 'h4',
    sec_exception: '* * *',
    removeTagsInSecs: true,
    pars: 'p',
    titlesFile: /FM_Titles.htm/,
    languages: ['el']
  },
  {
    name: 'hebrew,japanese',
    paperTitle: 'h1:last',
    secs: 'h4',
    sec_exception: '* * *',
    pars: 'p',
    titlesFile: /FM_Titles.htm/,
    languages: ['he', 'ja']
  },
  {
    name: 'korean-2000',
    paperTitle: 'h3',
    secs: 'h4',
    removeTagsInSecs: true,
    sec_exception: '* * *',
    pars: 'p,div:has(h4)',
    pars_ok: 'p',
    titlesFile: /FM_Titles.htm/,
    languages: ['ko-2000']
  },
  {
    name: 'korean-urka',
    paperTitle: 'h1',
    secs: 'h2',
    sec_exception: '* * *',
    pars: 'p',
    titlesFile: /FM_Titles.htm/,
    languages: ['ko-urka']
  },
  {
    name: 'korean-christian-minister',
    paperTitle: 'h1',
    secs: 'h2',
    removeTagsInSecs: true,
    sec_exception: '* * *',
    pars: 'p',
    titlesFile: /FM_Titles.htm/,
    languages: ['ko-christian-minister']
  },
  {
    name: 'russian-usgny',
    paperTitle: 'h1',
    secs: 'h2',
    sec_exception: '* * *',
    pars: 'p',
    titlesFile: /FM_Titles.htm/,
    languages: ['ru-usgny']
  },
  {
    name: 'spanish-angel-francisco-sanchez-escobar',
    paperTitle: 'h1',
    secs: 'h2',
    sec_exception: '* * *',
    pars: 'p',
    titlesFile: /FM_Titles.htm/,
    languages: ['es-afse']
  },
  {
    name: 'croatian',
    paperTitle: 'h1',
    secs: 'h2',
    sec_exception: '* * *',
    pars: 'p',
    titlesFile: /02-.+html/,
    languages: ['hr']
  }
]
