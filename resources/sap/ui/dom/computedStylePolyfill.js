/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
/*global window, document */
sap.ui.define([], function() {

	"use strict";

	return function() {
		var fnGetComputedStyle = window.getComputedStyle;

		window.getComputedStyle = function(element, pseudoElt){
			var oCSS2Style = fnGetComputedStyle.call(this, element, pseudoElt);
			if (oCSS2Style === null) {
				//Copy StyleDeclaration of document.body
				return document.body.cloneNode(false).style;
			}
			return oCSS2Style;
		};
	};

});
