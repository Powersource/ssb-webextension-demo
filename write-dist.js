const fs = require('fs')
const path = require('path')
const pull = require('pull-stream')
const rimraf = require("rimraf")
const workboxBuild = require('workbox-build');

var html = fs.readFileSync("browser.html", 'utf-8')

function copyToDist(line, type, match) {
  var filepath = match[1]
  var filename = path.basename(filepath)
  fs.copyFileSync(filepath, path.join('dist', type, filename))
  return line.replace(filepath, path.join(type, filename))
}

function generateOfflineCache() {
  workboxBuild.generateSW({
    importWorkboxFrom: 'local',
    skipWaiting: true,
    maximumFileSizeToCacheInBytes: 10000000,
    swDest: './dist/sw.js',
    globDirectory: './dist',
    globPatterns: ['**/*.{ttf,js,css,html}']
  })
}

rimraf("dist", function () {
  fs.mkdirSync('dist')
  fs.mkdirSync('dist/css')
  fs.mkdirSync('dist/js')

  // other
  fs.copyFileSync('css/NotoColorEmoji.ttf', 'dist/css/NotoColorEmoji.ttf')
  fs.copyFileSync('manifest.json', 'dist/manifest.json')
  fs.copyFileSync('background.js', 'dist/background.js')
  fs.copyFileSync('hermies.png', 'dist/hermies.png')

  pull(
    pull.values(html.split('\n')),
    pull.map(line => {
      var script = line.match(/<script src="(.*?)"/)
      var css = line.match(/text\/css\" href="(.*?)"/)
      if (script)
	return copyToDist(line, 'js', script)
      else if (css)
	return copyToDist(line, 'css', css)
      else
	return line
    }),
    pull.collect((err, lines) => {
      fs.writeFileSync('dist/index.html', lines.join('\n'))

      generateOfflineCache()
    })
  )
})
