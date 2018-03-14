/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(['sap/ui/thirdparty/jquery'], function(jQuery) {
	"use strict";


	jQuery.fn.extend( /** @lends jQuery.prototype */ {

		/*
		 * Disable HTML elements selection.
		 *
		 * @return {jQuery} <code>this</code> to allow method chaining.
		 * @private
		 */
		disableSelection: function() {
			return this.on((jQuery.support.selectstart ? "selectstart" : "mousedown") + ".ui-disableSelection", function(oEvent) {
				oEvent.preventDefault();
			});
		},

		/*
		 * Enable HTML elements to get selected.
		 *
		 * @return {jQuery} <code>this</code> to allow method chaining.
		 * @private
		 */
		enableSelection: function() {
			return this.off(".ui-disableSelection");
		}
	});

	return jQuery;

});

