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
	// appends a link object to the head
	// @evo-todo in HTML5 browsers, document.head.appendChild(oElement) shoulw always work
	// get rid of this module and the function
	return function appendHead(oElement) {
		var head = window.document.getElementsByTagName("head")[0];
		if (head) {
			head.appendChild(oElement);
		}
	};

});