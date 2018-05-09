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
	 * Some private variable used for creation of (pseudo-)unique ids.
	 * @type integer
	 * @private
	 */
	var iIdCounter = 0;

	/**
	 * Creates and returns a pseudo-unique id.
	 *
	 * No means for detection of overlap with already present or future UIDs.
	 *
	 * @function
	 * @exports sap/base/util/uid
	 * @return {string} A pseudo-unique id.
	 * @private
	 */
	var fnUid = function uid() {
		return "id-" + new Date().valueOf() + "-" + iIdCounter++;
	};

	return fnUid;
});
