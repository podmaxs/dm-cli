[![npm][npm-badge]][npm-badge-url]
[![downloads][npm-downloads]][npm-downloads-url]
[![install size][packagephobia-badge]][packagephobia-badge-url]

# DM CLI

The dm-cli command line interface (CLI) is your go-to tool for manage the bigapp project.

CLI versions:

* [`master`](https://github.com/podmaxs/dm-cli) : `npm i -g dynamicmind-cli` *(recommended)*

## Usage

```bash
$ dm-cli <task> [platform/s] [options]
$ dm-cli switch all --env=myad 
$ dm-cli run ios --env=mona --quick=ok
```

## Usage
	
You need to have a `src/projects` folder with all the specific files and a `builder.config.json` for each app version within your project root.

### Example

```bash
root
|-- projects.builder.json
|-- src/projects
	|-- brand
	|	|-- myadv
	|	|	|-- icon.png
	|	|	|-- splash.png
	|	|-- mona
	|	|	|-- icon.png
	|	|	|-- splash.png
	|		...
	|-- firebase
	|	|-- myadv
	|	|	|-- google-services.json
	|	|	|-- GoogleServices-Info.plist
	|	|-- mona
	|	|	|-- google-services.json
	|	|	|-- GoogleServices-Info.plist
	|-- config.json
	|-- project.myadv.json
	|-- project.mona.json
	...
```

---

If you find issues, please let us know:
* See [Issues Tracker][git-issues]

[git-issues]: https://github.com/podmaxs/dm-cli/issues
[npm-badge]: https://img.shields.io/npm/v/dynamicmind-cli.svg
[npm-badge-url]: https://www.npmjs.com/package/dynamicmind-cli
[npm-downloads]: https://img.shields.io/npm/dm/dynamicmind-cli.svg
[npm-downloads-url]: https://npmcharts.com/compare/dynamicmind-cli?minimal=true
[packagephobia-badge]: https://packagephobia.now.sh/badge?p=dynamicmind-cli
[packagephobia-badge-url]: https://packagephobia.now.sh/result?p=dynamicmind-cli