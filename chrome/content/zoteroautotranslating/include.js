// Only create main object once
if (!Zotero.AutoTranslator) {
	var Zotero = Components.classes["@zotero.org/Zotero;1"].getService(Components.interfaces.nsISupports).wrappedJSObject;
	//const loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
	//loader.loadSubScript("chrome://zoteroautotranslating/content/hello.js");
	
}
