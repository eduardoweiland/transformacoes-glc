/*    
 * @license requirejs - plugin - bower 0.1.0
 * Copyright(c) 2014, Rodney Robert Ebanks foss@rodneyebanks.com All Rights Reserved.
 * Available via the MIT or new BSD license.
 */

(function(){"use strict";define("bower",["module","json"],function(module,json){var defaults={root:"/bower.json",manifest:"bower.json",baseUrl:"../bower_components",extensions:"js|css",ignore:"requirejs|requirejs-domready|requirejs-text",auto:!0,deps:["dependencies"],loader:{css:"css"}},request={parent:null,config:{}},store={count:0,processed:{},json:{},modules:{},config:{paths:{},shim:{}}},REGEX_PATH_RELATIVE=/^([^a-z|0-9]*)/,REGEX_PATH_SPLIT=/^(.*?)([^/\\]*?)(?:\.([^ :\\/.]*))?$/,REGEX_PATH_MANIFEST=new RegExp("/^(.*?"+defaults.manifest+")+(.*)$/");function objectExtend(destination,source){return typeof source=="object"&&Object.keys(source).forEach(function(value){destination[value]=source[value]}),destination}function formatManifestPath(name){return name=defaults.baseUrl+"/"+name+"/"+defaults.manifest,name}function processManifest(name,req,onProcess,config,root){var jsonFileName;req=req||request.parent,config=config||request.config,onProcess=onProcess||function(){},store.count=store.
count+1;function finished(config){store.count=store.count-1,store.count<1&&request.onLoad(config)}root&&(request.onLoad=onProcess),request.config.isBuild?jsonFileName=name.replace(REGEX_PATH_RELATIVE,request.config.appDir):jsonFileName=name,store.processed[name]!==!0?(store.processed[name]=!0,json.load(jsonFileName,req,function(jsonFile){jsonFile?(typeof jsonFile!="object"&&(jsonFile=JSON.parse(jsonFile)),parseManifest(name,jsonFile,finished,root)):onProcess(store.config)},config)):finished(store.config)}function parseManifest(file,manifestJson,onParse,root){var baseUrl,baseName,shimModules=[],shimDeps=[],localDeps=[],parseManifestPath=new RegExp(REGEX_PATH_SPLIT),parseRelativePath=new RegExp(REGEX_PATH_RELATIVE),validExt=new RegExp("^("+defaults.extensions+")$"),ignoreFile=new RegExp("^("+defaults.ignore+")$");if(!manifestJson){onParse(store.config);return}manifestJson.main=[].concat(manifestJson.main||file),defaults.deps.forEach(function(depsPath){manifestJson[depsPath]=Object.keys(manifestJson
[depsPath]||{})}),baseUrl=parseManifestPath.exec(file)[1],baseName=manifestJson.name,manifestJson.main.forEach(function(moduleName){var name,file,path,ext,filePath=parseManifestPath.exec(moduleName);name=manifestJson.name,path=filePath[1].replace(parseRelativePath,""),file=filePath[2],ext=filePath[3],validExt.test(ext)&&!ignoreFile.test(baseName)&&(name=name.replace(".","-"),ext!=="js"?(name=name+"-"+ext,defaults.loader[ext]&&localDeps.push(defaults.loader[ext]+"!"+name)):file!==name&&manifestJson.main.length>1?(name=file,shimModules.push(name)):(name=name,shimModules.push(name)),store.config.paths[name]=baseUrl+path+file,store.config.shim[name]={},store.config.shim[name].exports=name)}),manifestJson.dependencies.forEach(function(value){shimDeps.push(value.replace(".","-"))}),shimModules.forEach(function(moduleName){if(manifestJson.dependencies.length>0||localDeps.length>0)store.config.shim[moduleName].deps=[].concat(localDeps,shimDeps)}),defaults.deps.forEach(function(bowerDependencies
){manifestJson[bowerDependencies]&&manifestJson[bowerDependencies].length>0&&manifestJson[bowerDependencies].forEach(function(dependency){ignoreFile.test(dependency)||processManifest(formatManifestPath(dependency))})}),onParse(store.config)}function pluginLoad(name,req,onLoad,config){request.parent=req,request.config=config,defaults=objectExtend(defaults,request.config.bower||{}),processManifest(defaults.root,req,function(config){defaults.auto&&!request.config.isBuild&&require.config(config),onLoad(config)},config,!0),config&&config.isBuild&&onLoad(store.config)}function pluginNormalize(name){return REGEX_PATH_MANIFEST.exec(name)||defaults.root}function pluginWrite(pluginName,moduleName,write){var content=JSON.stringify(store.config);defaults.auto?content='define("'+pluginName+"!"+moduleName+'", function(){var bowerConfig='+content+";\nrequirejs.config(bowerConfig);\nreturn bowerConfig;\n});\n":content='define("'+pluginName+"!"+moduleName+'", function(){\nreturn '+content+";\n});\n",write
(content)}return{load:pluginLoad,normalize:pluginNormalize,write:pluginWrite}})})();