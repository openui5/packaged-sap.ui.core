sap.ui.predefine('testlibs/scenario5/lib6/library',['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario5.lib6',
		dependencies: [
		],
		noLibraryCSS: true
	});
	return testlibs.scenario5.lib6;
});
jQuery.sap.registerPreloadedModules({
	"version":"2.0",
	"name":"testlibs.scenario5.lib6",
	"modules":{
		"testlibs/scenario5/lib6/manifest.json":"{\n\t\"sap.ui5\": {\n\t\t\"dependencies\": {\n\t\t\t\"libs\": {}\n\t\t}\n\t}\n}"
	}
});