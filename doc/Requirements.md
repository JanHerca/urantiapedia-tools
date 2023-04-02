## Quasar requirements

With Node.js >= 16.10 there is no need to install yarn, but open a Cmd Command Prompt as Administrador and execute:
`corepack enable`

Next execute

`corepack prepare yarn@<version> --activate` where `<version>` should be one of the Yarn 1 versions, like 1.21.1

To install dependencies:
`yarn install`

Perhaps it is needed to add quasar as global:
`yarn global add @quasar/cli`

To execute:
`quasar dev -m electron`

## References

https://yarnpkg.com/getting-started/install
