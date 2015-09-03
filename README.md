# kirby-gulpfile
A Gulp boilerplate for smoother Kirby CMS development workflow. 

Main tasks  are:
- **styles:** compile, minify, autoprefix and sourcemap your `scss` files
- **scripts:** concat, minify and sourcemap your `js` files
- **lint:** lint your `js` and `scss` files
- **zip:** makes and archive of your kirby installations, useful for theme developers.
- **serve:** launch a local php server and watch for sources changes.


## Getting Started
### Prerequisites
- **PHP 5.4.0** or more is required to run the local php server.
- **Ruby** and **scss-lint** is require to lint your scss files. see [scss-lint](https://github.com/brigade/scss-lint)

### Instalation
- Copy `gulpfile.js`, `package.json` and `.eslintrc` intoo yhe root of your kirby installation.
- run `npm install` 

# Usage
## Configuration
The `script` variable allow you to configure the generation of your `js` files. It takes advantage of the `js()` helper in kirby to autoload template specific script files.

The `config` variable contain the configuration for the [connect-php](https://github.com/micahblu/gulp-connect-php), [sass](https://github.com/dlmanning/gulp-sass) and [autoprefixer](https://github.com/sindresorhus/gulp-autoprefixer) gulp plugins. Refer to the correspondic documentations if you need more fine tuning.
