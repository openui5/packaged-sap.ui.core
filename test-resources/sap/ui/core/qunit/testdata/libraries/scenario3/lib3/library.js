sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {
	sap.ui.getCore().initLibrary({
		name: 'testlibs.scenario3.lib3',
		dependencies: [
		],
		noLibraryCSS: true
	});
	return testlibs.scenario3.lib3;
});