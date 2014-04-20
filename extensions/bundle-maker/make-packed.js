
var argv_modules = process.argv[2] || "profile-3 theme:swiss"
var argv_out = process.argv[3] || "deckjs-custom.js"

var FS = require('fs');

var writefile = function(where, what) {
    FS.writeFile(where, what, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("Saved: '"+where+"'");
        }
    });
};
var readfile = function(path) {
    return FS.readFileSync(path).toString();
}
var includejs = function(js) {
    eval(readfile(js));
    return includedeck;
};

console.log = function (d) {
  process.stdout.write(d + '\n');
};

var deckjsdir = process.argv[1].replace(/\/[^\/]*\/[^\/]*\/[^\/]*$/g, '/')

ACTUALLY_EXPORT_A_LIST_OF_FILES = 'oh yeah!';
var includedeck_loadjs = deckjsdir + 'extensions/includedeck/load.js'
var includedeck = includejs(includedeck_loadjs);
var files = includedeck(includedeck_loadjs + " " + argv_modules, {PREFIX: deckjsdir});

var header = ""
var alljs = ""
var allcss = ""

var gitversion = readfile(deckjsdir+'.git/refs/heads/master').replace(/\n/g, '')
var nl = '\n'
header += "/*" + nl
header += "  This is a packed deck.js with some extensions and styles." + nl
header += "  It has been generated from version " + gitversion + " ." + nl
header += "  It includes:" + nl

for (f in files) {
    if (files[f].match(/\.js$/)) {
        alljs += '\n' + readfile(files[f]);
        header += "     " + files[f] + nl;
    }
}
for (f in files) {
    if (files[f].match(/\.css$/)) {
        allcss += '\n' + readfile(files[f]);
        header += "     " + files[f] + nl;
    }
}

header += "*/" + nl

allcss = allcss.replace(/(["\\])/g, '\\$1').replace(/\n/g, '\\n');
alljs = header + alljs;
alljs += 'function ACTUALLY_FILL_CSS(el) { $(el).text("'+allcss+'") }';
writefile(argv_out, alljs);
