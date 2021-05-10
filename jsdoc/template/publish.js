/* global env: true */

let doop = require('jsdoc/util/doop');
let fs = require('jsdoc/fs');
let helper = require('jsdoc/util/templateHelper');
let logger = require('jsdoc/util/logger');
let path = require('jsdoc/path');
let taffy = require('taffydb').taffy;
let template = require('jsdoc/template');
let util = require('util');

let htmlsafe = helper.htmlsafe;
let linkto = helper.linkto;
let resolveAuthorLinks = helper.resolveAuthorLinks;
let hasOwnProp = Object.prototype.hasOwnProperty;

/* prettier-ignore-start */
// eslint-disable-next-line
let themeOpts = env && env.opts && env.opts['theme_opts'] || {};
/* prettier-ignore-end */

let data;
let view;
let searchListArray = [];
let hasSearch = (themeOpts.search === undefined) ? true : Boolean(themeOpts.search);

// eslint-disable-next-line no-restricted-globals
let outdir = path.normalize(env.opts.destination);


function copyToOutputFolder(filePath) {
    let filePathNormalized = path.normalize(filePath);

    fs.copyFileSync(filePathNormalized, outdir);
}

function copyToOutputFolderFromArray(filePathArray) {
    let i = 0;
    let outputList = [];

    if (Array.isArray(filePathArray)) {
        for (; i < filePathArray.length; i++) {
            copyToOutputFolder(filePathArray[i]);
            outputList.push(path.basename(filePathArray[i]));
        }
    }

    return outputList;
}

function find(spec) {
    return helper.find(data, spec);
}

function tutoriallink(tutorial) {
    return helper.toTutorial(tutorial, null, { tag: 'em',
        classname: 'disabled',
        prefix: 'Tutorial: ' });
}

function getAncestorLinks(doclet) {
    return helper.getAncestorLinks(data, doclet);
}

function hashToLink(doclet, hash) {
    if ( !/^(#.+)/.test(hash) ) { return hash; }

    let url = helper.createLink(doclet);

    url = url.replace(/(#.+|$)/, hash);

    return '<a href="' + url + '">' + hash + '</a>';
}

function needsSignature(doclet) {
    let needsSig = false;

    // function and class definitions always get a signature
    if (doclet.kind === 'function' || doclet.kind === 'class') {
        needsSig = true;
    }
    // typedefs that contain functions get a signature, too
    else if (doclet.kind === 'typedef' && doclet.type && doclet.type.names &&
        doclet.type.names.length) {
        for (let i = 0, l = doclet.type.names.length; i < l; i++) {
            if (doclet.type.names[i].toLowerCase() === 'function') {
                needsSig = true;
                break;
            }
        }
    }

    return needsSig;
}

function getSignatureAttributes(item) {
    let attributes = [];

    if (item.optional) {
        attributes.push('opt');
    }

    if (item.nullable === true) {
        attributes.push('nullable');
    }
    else if (item.nullable === false) {
        attributes.push('non-null');
    }

    return attributes;
}

function updateItemName(item) {
    let attributes = getSignatureAttributes(item);
    let itemName = item.name || '';

    if (item.letiable) {
        itemName = '&hellip;' + itemName;
    }

    if (attributes && attributes.length) {
        itemName = util.format( '%s<span class="signature-attributes">%s</span>', itemName,
            attributes.join(', ') );
    }

    return itemName;
}

function addParamAttributes(params) {
    return params.filter(function(param) {
        return param.name && param.name.indexOf('.') === -1;
    }).map(updateItemName);
}

function buildItemTypeStrings(item) {
    let types = [];

    if (item && item.type && item.type.names) {
        item.type.names.forEach(function(name) {
            types.push( linkto(name, htmlsafe(name)) );
        });
    }

    return types;
}

function buildAttribsString(attribs) {
    let attribsString = '';

    if (attribs && attribs.length) {
        attribsString = htmlsafe( util.format('(%s) ', attribs.join(', ')) );
    }

    return attribsString;
}

function addNonParamAttributes(items) {
    let types = [];

    items.forEach(function(item) {
        types = types.concat( buildItemTypeStrings(item) );
    });

    return types;
}

function addSignatureParams(f) {
    let params = f.params ? addParamAttributes(f.params) : [];

    f.signature = util.format( '%s(%s)', (f.signature || ''), params.join(', ') );
}

function addSignatureReturns(f) {
    let attribs = [];
    let attribsString = '';
    let returnTypes = [];
    let returnTypesString = '';

    // jam all the return-type attributes into an array. this could create odd results (for example,
    // if there are both nullable and non-nullable return types), but let's assume that most people
    // who use multiple @return tags aren't using Closure Compiler type annotations, and vice-versa.
    if (f.returns) {
        f.returns.forEach(function(item) {
            helper.getAttribs(item).forEach(function(attrib) {
                if (attribs.indexOf(attrib) === -1) {
                    attribs.push(attrib);
                }
            });
        });

        attribsString = buildAttribsString(attribs);
    }

    if (f.returns) {
        returnTypes = addNonParamAttributes(f.returns);
    }
    if (returnTypes.length) {
        returnTypesString = util.format( ' &rarr; %s{%s}', attribsString, returnTypes.join('|') );
    }

    f.signature = '<span class="signature">' + (f.signature || '') + '</span>' +
        '<span class="type-signature">' + returnTypesString + '</span>';
}

function addSignatureTypes(f) {
    let types = f.type ? buildItemTypeStrings(f) : [];

    f.signature = (f.signature || '') + '<span class="type-signature">' +
        (types.length ? ' :' + types.join('|') : '') + '</span>';
}

function addAttribs(f) {
    let attribs = helper.getAttribs(f);
    let attribsString = buildAttribsString(attribs);

    f.attribs = util.format('<span class="type-signature">%s</span>', attribsString);
}

function shortenPaths(files, commonPrefix) {
    Object.keys(files).forEach(function(file) {
        files[file].shortened = files[file].resolved.replace(commonPrefix, '')
            // always use forward slashes
            .replace(/\\/g, '/');
    });

    return files;
}

function getPathFromDoclet(doclet) {
    if (!doclet.meta) {
        return null;
    }

    return doclet.meta.path && doclet.meta.path !== 'null' ?
        path.join(doclet.meta.path, doclet.meta.filename) :
        doclet.meta.filename;
}

function generate(type, title, docs, filename, resolveLinks) {
    resolveLinks = resolveLinks !== false;

    let docData = {
        type: type,
        title: title,
        docs: docs
    };

    let outpath = path.join(outdir, filename),
        html = view.render('container.tmpl', docData);

    if (resolveLinks) {
        html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>
    }

    fs.writeFileSync(outpath, html, 'utf8');
}

function generateSourceFiles(sourceFiles, encoding) {
    encoding = encoding || 'utf8';
    Object.keys(sourceFiles).forEach(function(file) {
        let source;
        // links are keyed to the shortened path in each doclet's `meta.shortpath` property
        let sourceOutfile = helper.getUniqueFilename(sourceFiles[file].shortened);

        helper.registerLink(sourceFiles[file].shortened, sourceOutfile);

        try {
            source = {
                kind: 'source',
                code: helper.htmlsafe( fs.readFileSync(sourceFiles[file].resolved, encoding) )
            };
        }
        catch (e) {
            logger.error('Error while generating source file %s: %s', file, e.message);
        }

        generate('Source', sourceFiles[file].shortened, [source], sourceOutfile, false);
    });
}

/**
 * Look for classes or functions with the same name as modules (which indicates that the module
 * exports only that class or function), then attach the classes or functions to the `module`
 * property of the appropriate module doclets. The name of each class or function is also updated
 * for display purposes. This function mutates the original arrays.
 *
 * @private
 * @param {Array.<module:jsdoc/doclet.Doclet>} doclets - The array of classes and functions to
 * check.
 * @param {Array.<module:jsdoc/doclet.Doclet>} modules - The array of module doclets to search.
 */
function attachModuleSymbols(doclets, modules) {
    let symbols = {};

    // build a lookup table
    doclets.forEach(function(symbol) {
        symbols[symbol.longname] = symbols[symbol.longname] || [];
        symbols[symbol.longname].push(symbol);
    });

    // eslint-disable-next-line array-callback-return
    return modules.map(function(module) {
        if (symbols[module.longname]) {
            module.modules = symbols[module.longname]
                // Only show symbols that have a description. Make an exception for classes, because
                // we want to show the constructor-signature heading no matter what.
                .filter(function(symbol) {
                    return symbol.description || symbol.kind === 'class';
                })
                .map(function(symbol) {
                    symbol = doop(symbol);

                    if (symbol.kind === 'class' || symbol.kind === 'function') {
                        symbol.name = symbol.name.replace('module:', '(require("') + '"))';
                    }

                    return symbol;
                });
        }
    });
}

function buildMenuNav(menu) {
    let m = '<ul>';

    menu.forEach(function(item) {
        // Setting default value for optional parameter
        let c = item.class || '';
        let id = item.id || '';
        let target = item.target || '';

        c += ' menu-link';

        m += '<li class="menu-li">' +
            "<a href='" + item.link + "' class='" + c + "' id='" + id + "' target='" + target + "'>" + item.title + '</a></li>';
    });

    m += '</ul>';

    return m;
}

function buildSearch() {
    let searchHTML = '<div class="search-box" id="search-box">' +
        '<div class="search-box-input-container">' +
        '<input class="search-box-input" type="text" placeholder="Search..." id="search-box-input" />' +
        '<svg class="search-icon"><use xlink:href="#search-icon"></use></svg>' +
        '</div>';

    let searchItemContainer = '<div class="search-item-container" id="search-item-container"><ul class="search-item-ul" id="search-item-ul"></ul></div></div>';

    searchHTML += searchItemContainer;

    return searchHTML;
}

function buildFooter() {
    let footer = themeOpts.footer || '';


    return footer;
}

// function copy
function createDynamicStyleSheet() {
    let styleClass = themeOpts.create_style || undefined;
    /* prettier-ignore-start */

    return styleClass;
}

function createDynamicsScripts() {
    let scripts = themeOpts.add_scripts || undefined;


    return scripts;
}

function returnPathOfScriptScr() {
    let scriptPath = themeOpts.add_script_path || undefined;


    return scriptPath;
}

function returnPathOfStyleSrc() {
    let stylePath = themeOpts.add_style_path || undefined;


    return stylePath;
}

function includeCss() {
    let stylePath = themeOpts.include_css || undefined;

    if (stylePath) {
        stylePath = copyToOutputFolderFromArray(stylePath);
    }


    return stylePath;
}

function overlayScrollbarOptions() {
    let overlayOptions = themeOpts.overlay_scrollbar || undefined;

    if (overlayOptions) {
        return JSON.stringify(overlayOptions);
    }


    return undefined;
}

function includeScript() {
    let scriptPath = themeOpts.include_js || undefined;

    if (scriptPath) {
        scriptPath = copyToOutputFolderFromArray(scriptPath);
    }


    return scriptPath;
}

function getMetaTagData() {
    let meta = themeOpts.meta || undefined;


    return meta;
}

function getTheme() {
    let theme = themeOpts.theme || 'light';
    let baseThemeName = 'clean-jsdoc-theme';
    let themeSrc = `${baseThemeName}-${theme}.css`.trim();

    return themeSrc;
}


function search() {
    let searchOption = themeOpts.search;

    let obj = {
        list: searchListArray,
        options: JSON.stringify(searchOption)
    };

    return obj;
}


function buildMemberNav(items, itemHeading, itemsSeen, linktoFn)
{
    let nav = '';

    if(items.length)
    {
        let itemsNav = '';

        items.forEach(function(item)
        {
            let methods = find({ kind: 'function', memberof: item.longname });

            if (!hasOwnProp.call(item, 'longname'))
            {
                itemsNav += '<li>' + linktoFn('', item.name) + '</li>';
            }
            else if(!hasOwnProp.call(itemsSeen, item.longname))
            {
                let accordionClassName = (methods.length) ? '"accordion collapsed child"' : '"accordion-list"';

                itemsNav += `<li class=${accordionClassName}>`;

                let linkTitle = linktoFn(item.longname, item.name.replace(/^module:/, ''));

                if(methods.length)
                {
                    itemsNav += '<div class="accordion-heading child">' + linkTitle + '<svg><use xlink:href="#down-icon"></use></svg></div>';
                }
                else
                {
                    itemsNav += linkTitle;
                }


                if(hasSearch)
                {
                    searchListArray.push(JSON.stringify({ title: item.name, link: linkto(item.longname, item.name) }));
                }

                if(methods.length)
                {
                    itemsNav += "<ul class='methods accordion-content'>";

                    methods.forEach(function(method)
                    {
                        let name = method.longname.split('#');
                        let first = name[0];
                        let last = name[1];

                        name = first + ' &rtrif; ' + last;

                        if(hasSearch)
                        {
                            searchListArray.push(JSON.stringify({ title: method.longname, link: linkto(method.longname, name) }));
                        }

                        itemsNav += "<li data-type='method'>";
                        itemsNav += linkto(method.longname, method.name);
                        itemsNav += '</li>';
                    });

                    itemsNav += '</ul>';
                }
                itemsNav += '</li>';
                itemsSeen[item.longname] = true;
            }
        });

        if(itemsNav !== '')
        {
            nav += '<div class="accordion">' +
              '<h3 class="accordion-heading">' + itemHeading + '<svg><use xlink:href="#down-icon"></use></svg></h3>' +
              '<ul class="accordion-content">' + itemsNav + '</ul>' +
              '</div>';
        }
    }

    return nav;
}

function linktoTutorial(longName, name)
{
    return tutoriallink(name);
}

function linktoExternal(longName, name)
{
    return linkto(longName, name.replace(/(^"|"$)/g, ''));
}

/**
 * Create the navigation sidebar.
 * @param {object} members The members that will be used to create the sidebar.
 * @param {array<object>} members.classes
 * @param {array<object>} members.externals
 * @param {array<object>} members.globals
 * @param {array<object>} members.mixins
 * @param {array<object>} members.modules
 * @param {array<object>} members.namespaces
 * @param {array<object>} members.tutorials
 * @param {array<object>} members.events
 * @param {array<object>} members.interfaces
 * @return {string} The HTML for the navigation sidebar.
 */
function buildNav(members) {
    let title = (themeOpts.title) || 'Home';


    let isHTML = RegExp.prototype.test.bind(/(<([^>]+)>)/i);
    let nav;

    if (!isHTML(title)) {
        nav = `<div id="navbar-heading-container">
                <a id="navbar-heading-link" href="index.html">
                  <div id="navbar-heading">
                    <img id="navbar-heading-logo" src="images/logo_white.png" alt="Logo" />
                    <h2 id="navbar-heading-text">${title}</h2>
                  </div>
                </a>
              </div>`;
    }
    else {
        // eslint-disable-next-line no-restricted-globals
        let filter = env && env.opts && env.opts.themeOpts;

        if (filter.filter === undefined) { filter.filter = true; }
        if (JSON.parse(filter.filter)) { nav = '<h2><a href="index.html" class="filter">' + title + '</a></h2>'; }
        else { nav = '<h2><a href="index.html">' + title + '</a></h2>'; }
    }


    if (hasSearch) { nav += buildSearch(); }
    nav += '<div class="sidebar-main-content" id="sidebar-main-content">';
    let seen = {};
    let seenTutorials = {};

    let menu = (themeOpts.menu) || undefined;


    if (menu !== undefined) { nav += buildMenuNav(menu); }
    nav += buildMemberNav(members.tutorials, 'Tutorials', seenTutorials, linktoTutorial, true);
    nav += buildMemberNav(members.classes, 'Classes', seen, linkto);
    nav += buildMemberNav(members.modules, 'Modules', {}, linkto);
    nav += buildMemberNav(members.externals, 'Externals', seen, linktoExternal);
    nav += buildMemberNav(members.events, 'Events', seen, linkto);
    nav += buildMemberNav(members.namespaces, 'Namespaces', seen, linkto);
    nav += buildMemberNav(members.mixins, 'Mixins', seen, linkto);
    nav += buildMemberNav(members.interfaces, 'Interfaces', seen, linkto);
    nav += buildMemberNav(members.globals, 'Global', seen, linkto);

    // if (members.globals.length) {
    //     let globalNav = '';

    //     members.globals.forEach(function(g) {
    //         if ( g.kind !== 'typedef' && !hasOwnProp.call(seen, g.longname) ) {
    //             searchListArray.push(JSON.stringify({
    //                 title: g.name,
    //                 link: linkto(g.longname, 'Global &rtrif; ' + g.name)
    //             }));
    //             globalNav += '<li>' + linkto(g.longname, g.name) + '</li>';
    //         }
    //         seen[g.longname] = true;
    //     });

    //     if (!globalNav) {
    //         // turn the heading into a link so you can actually get to the global page
    //         nav += '<h3>' + linkto('global', 'Global') + '</h3>';
    //     }
    //     else {
    //         nav += '<h3>' + linkto('global', 'Global') + '</h3><ul>' + globalNav + '</ul>';
    //     }
    // }

    nav += '</div>';

    return nav;
}

/**
    @param {TAFFY} taffyData See <http://taffydb.com/>.
    @param {object} opts
    @param {Tutorial} tutorials
 */
exports.publish = function(taffyData, opts, tutorials) {
    data = taffyData;

    // eslint-disable-next-line no-restricted-globals
    let conf = env.conf.templates || {};

    conf.default = conf.default || {};

    let templatePath = path.normalize(opts.template);

    view = new template.Template( path.join(templatePath, 'tmpl') );

    // claim some special filenames in advance, so the All-Powerful Overseer of Filename Uniqueness doesn't try to hand them out later
    let indexUrl = helper.getUniqueFilename('index');
    // don't call registerLink() on this one! 'index' is also a valid longname

    let globalUrl = helper.getUniqueFilename('global');

    helper.registerLink('global', globalUrl);

    // set up templating
    view.layout = conf.default.layoutFile ? path.getResourcePath(path.dirname(conf.default.layoutFile), path.basename(conf.default.layoutFile) ) : 'layout.tmpl';

    // set up tutorials for helper
    helper.setTutorials(tutorials);

    data = helper.prune(data);
    data.sort('longname, version, since');
    helper.addEventListeners(data);

    let sourceFiles = {};
    let sourceFilePaths = [];

    data().each(function(doclet) {
        doclet.attribs = '';

        if (doclet.examples) {
            doclet.examples = doclet.examples.map(function(example) {
                let caption, code;

                if (example.match(/^\s*<caption>([\s\S]+?)<\/caption>(\s*[\n\r])([\s\S]+)$/i)) {
                    caption = RegExp.$1;
                    code = RegExp.$3;
                }

                return {
                    caption: caption || '',
                    code: code || example
                };
            });
        }
        if (doclet.see) {
            doclet.see.forEach(function(seeItem, i) {
                doclet.see[i] = hashToLink(doclet, seeItem);
            });
        }

        // build a list of source files
        let sourcePath;

        if (doclet.meta) {
            sourcePath = getPathFromDoclet(doclet);
            sourceFiles[sourcePath] = {
                resolved: sourcePath,
                shortened: null
            };
            if (sourceFilePaths.indexOf(sourcePath) === -1) {
                sourceFilePaths.push(sourcePath);
            }
        }
    });

    // update outdir if necessary, then create outdir
    let packageInfo = ( find({kind: 'package'}) || [] )[0];

    if (packageInfo && packageInfo.name) {
        outdir = path.join( outdir, packageInfo.name, (packageInfo.version || '') );
    }
    fs.mkPath(outdir);

    // copy the template's static files to outdir
    let fromDir = path.join(templatePath, 'static');
    let staticFiles = fs.ls(fromDir, 3);

    staticFiles.forEach(function(fileName) {
        let toDir = fs.toDir( fileName.replace(fromDir, outdir) );

        fs.mkPath(toDir);
        fs.copyFileSync(fileName, toDir);
    });

    // copy user-specified static files to outdir
    let staticFilePaths;
    let staticFileFilter;
    let staticFileScanner;

    if (conf.default.staticFiles) {
        // The canonical property name is `include`. We accept `paths` for backwards compatibility
        // with a bug in JSDoc 3.2.x.
        staticFilePaths = conf.default.staticFiles.include ||
            conf.default.staticFiles.paths ||
            [];
        staticFileFilter = new (require('jsdoc/src/filter')).Filter(conf.default.staticFiles);
        staticFileScanner = new (require('jsdoc/src/scanner')).Scanner();

        staticFilePaths.forEach(function(filePath) {
            let extraStaticFiles = staticFileScanner.scan([filePath], 10, staticFileFilter);

            extraStaticFiles.forEach(function(fileName) {
                let sourcePath = fs.toDir(filePath);
                let toDir = fs.toDir( fileName.replace(sourcePath, outdir) );

                fs.mkPath(toDir);
                fs.copyFileSync(fileName, toDir);
            });
        });
    }

    if (sourceFilePaths.length) {
        sourceFiles = shortenPaths( sourceFiles, path.commonPrefix(sourceFilePaths) );
    }
    data().each(function(doclet) {
        let url = helper.createLink(doclet);

        helper.registerLink(doclet.longname, url);

        // add a shortened version of the full path
        let docletPath;

        if (doclet.meta) {
            docletPath = getPathFromDoclet(doclet);
            docletPath = sourceFiles[docletPath].shortened;
            if (docletPath) {
                doclet.meta.shortpath = docletPath;
            }
        }
    });

    data().each(function(doclet) {
        let url = helper.longnameToUrl[doclet.longname];

        if (url.indexOf('#') > -1) {
            doclet.id = helper.longnameToUrl[doclet.longname].split(/#/).pop();
        }
        else {
            doclet.id = doclet.name;
        }

        if ( needsSignature(doclet) ) {
            addSignatureParams(doclet);
            addSignatureReturns(doclet);
            addAttribs(doclet);
        }
    });

    // do this after the urls have all been generated
    data().each(function(doclet) {
        doclet.ancestors = getAncestorLinks(doclet);

        if (doclet.kind === 'member') {
            addSignatureTypes(doclet);
            addAttribs(doclet);
        }

        if (doclet.kind === 'constant') {
            addSignatureTypes(doclet);
            addAttribs(doclet);
            doclet.kind = 'member';
        }
    });

    let members = helper.getMembers(data);

    members.tutorials = tutorials.children;

    // output pretty-printed source files by default
    let outputSourceFiles = Boolean(conf.default && conf.default.outputSourceFiles !== false);

    // add template helpers
    view.find = find;
    view.linkto = linkto;
    view.resolveAuthorLinks = resolveAuthorLinks;
    view.tutoriallink = tutoriallink;
    view.htmlsafe = htmlsafe;
    view.outputSourceFiles = outputSourceFiles;
    view.footer = buildFooter();
    view.dynamicStyle = createDynamicStyleSheet();
    view.dynamicStyleSrc = returnPathOfStyleSrc();
    view.dynamicScript = createDynamicsScripts();
    view.dynamicScriptSrc = returnPathOfScriptScr();
    view.includeScript = includeScript();
    view.includeCss = includeCss();
    view.meta = getMetaTagData();
    view.overlayScrollbar = overlayScrollbarOptions();
    view.theme = getTheme();
    // once for all
    view.nav = buildNav(members);
    view.search = search();
    attachModuleSymbols( find({ longname: {left: 'module:'} }), members.modules );

    // generate the pretty-printed source files first so other pages can link to them
    if (outputSourceFiles) {
        generateSourceFiles(sourceFiles, opts.encoding);
    }

    if (members.globals.length) {
        generate('', 'Global', [{kind: 'globalobj'}], globalUrl);
    }

    // index page displays information from package.json and lists files
    let files = find({kind: 'file'});
    let packages = find({kind: 'package'});

    generate('', 'Home',
        packages.concat(
            [{kind: 'mainpage',
                readme: opts.readme,
                longname: (opts.mainpagetitle) ? opts.mainpagetitle : 'Main Page'}]
        ).concat(files),
        indexUrl);

    // set up the lists that we'll use to generate pages
    let classes = taffy(members.classes);
    let modules = taffy(members.modules);
    let namespaces = taffy(members.namespaces);
    let mixins = taffy(members.mixins);
    let externals = taffy(members.externals);
    let interfaces = taffy(members.interfaces);

    Object.keys(helper.longnameToUrl).forEach(function(longname) {
        let myModules = helper.find(modules, {longname: longname});

        if (myModules.length) {
            generate('Module', myModules[0].name, myModules, helper.longnameToUrl[longname]);
        }

        let myClasses = helper.find(classes, {longname: longname});

        if (myClasses.length) {
            generate('Class', myClasses[0].name, myClasses, helper.longnameToUrl[longname]);
        }

        let myNamespaces = helper.find(namespaces, {longname: longname});

        if (myNamespaces.length) {
            generate('Namespace', myNamespaces[0].name, myNamespaces, helper.longnameToUrl[longname]);
        }

        let myMixins = helper.find(mixins, {longname: longname});

        if (myMixins.length) {
            generate('Mixin', myMixins[0].name, myMixins, helper.longnameToUrl[longname]);
        }

        let myExternals = helper.find(externals, {longname: longname});

        if (myExternals.length) {
            generate('External', myExternals[0].name, myExternals, helper.longnameToUrl[longname]);
        }

        let myInterfaces = helper.find(interfaces, {longname: longname});

        if (myInterfaces.length) {
            generate('Interface', myInterfaces[0].name, myInterfaces, helper.longnameToUrl[longname]);
        }
    });

    // TODO: move the tutorial functions to templateHelper.js
    function generateTutorial(title, tutorial, filename) {
        let tutorialData = {
            title: title,
            header: tutorial.title,
            content: tutorial.parse(),
            children: tutorial.children
        };

        let tutorialPath = path.join(outdir, filename);
        let html = view.render('tutorial.tmpl', tutorialData);

        // yes, you can use {@link} in tutorials too!
        html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>
        fs.writeFileSync(tutorialPath, html, 'utf8');
    }

    // tutorials can have only one parent so there is no risk for loops
    function saveChildren(node) {
        node.children.forEach(function(child) {
            generateTutorial('Tutorial: ' + child.title, child, helper.tutorialToUrl(child.name));
            saveChildren(child);
        });
    }

    saveChildren(tutorials);
};
