sap.ui.define([
	'sap/ui/core/XMLComposite'//, 'sap/m/Text'
], function(XMLComposite) {
	"use strict";
	return XMLComposite.extend("composites.ForwardText2", {
		metadata: {
			aggregations: {
				textItems: {
					type: "sap.m.Text",
					multiple: true
				}
				,
				text: {
					type: "sap.m.Text",
					multiple: false
				}
			},
			defaultAggregation: "textItems"
		},
		alias: "forwardtext"
	});
}, /* bExport= */true);
