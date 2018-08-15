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
	 * Create hex string and pad to length with zeros.
	 *
	 * @function
	 * @private
	 * @exports sap/strings/toHex
	 * @param {int} iChar UTF-16 character code
	 * @param {int} [iLength=0] number of padded zeros
	 * @returns {string} padded hex representation of the given character code
	 */
	var fnToHex = function(iChar, iLength) {
		var sHex = iChar.toString(16);
		if (iLength) {
			sHex = sHex.padStart(iLength, '0');
		}
		return sHex;
	};
	return fnToHex;
});