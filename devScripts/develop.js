const ejs = require('ejs');
const browserSync = require('browser-sync');
const bsInstance = browserSync.create();

const fs = require('fs')
const path = require('path')

function getDirectories (srcpath, filter) {
  const dirs = fs.readdirSync(srcpath)
    .filter(file => fs.statSync(path.join(srcpath, file)).isDirectory());

  if (filter && typeof filter === 'function') {
    return dirs.filter(filter);
  }
  return dirs;
}

function watchDirectoriesForReload() {
  const directoriesToWatch = getDirectories('./', (dirname) => {
    const unwantedDirs = ['devScripts', 'node_modules', 'scss']
    return unwantedDirs.indexOf(dirname) === -1;
  });
  const itemsToWatch = directoriesToWatch.concat(['index.html']);
  console.log('itemsToWatch', itemsToWatch);
  bsInstance.watch(itemsToWatch).on('change', bsInstance.reload);

  bsInstance.init({
    server: './'
  });
}

function watchDirectoriesForRegen() {
  bsInstance.watch('./projects/**/!(index.html)').on('change', (filePath, arg2) => {
    const changedProject = path.dirname(filePath);
    console.log('changed project', changedProject);
    ejs.renderFile(path.join(changedProject, 'index.ejs'), {}, {}, (err, str) => {
      if(!err) {
        fs.writeFileSync(path.join(changedProject, 'index.html'), str);
      }
    });
  });
}

watchDirectoriesForRegen();
watchDirectoriesForReload();