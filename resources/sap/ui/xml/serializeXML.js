/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * Serializes the specified XML document into a string representation.
	 *
	 * @function
	 * @exports sap/ui/xml/serializeXML
	 * @param {string} oXMLDocument the XML document object to be serialized as string
	 * @returns {object} the serialized XML string
	 * @private
	 */
	var fnSerializeXML = function(oXMLDocument) {
		var oSerializer = new XMLSerializer();
		return oSerializer.serializeToString(oXMLDocument);
	};


	return fnSerializeXML;
});