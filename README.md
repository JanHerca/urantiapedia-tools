# urantiapedia-tools (urantiapedia-tools)

Tools for building Urantiapedia

## Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).

## Tasks to do

1. Port existing Urantiapedia Tools from `urantiapedia` project (https://github.com/JanHerca/urantiapedia) to this project. That means
   - Tab `Proccesses`
   - Tab `Edit Topic Index`
   - Tab `Settings`
2. New Urantia Book searcher: by old and new reference, with or without words, and with new copy funcionalities
3. New book generator that creates a first of several books from one file or several.
4. New translator that translates any number of files connecting to Google Cloud Translator, and using Urantia Book quotes substitution. Must work with HTML and MD files.
