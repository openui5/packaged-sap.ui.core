/*!
 * SAP UI development toolkit for HTML5 (SAPUI5/OpenUI5)
 * (c) Copyright 2009-2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.ui.core.mvc.JSONView.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/library', './View'],
	function(jQuery, library, View) {
	"use strict";


	
	/**
	 * Constructor for a new mvc/JSONView.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A View defined using JSON.
	 * @extends sap.ui.core.mvc.View
	 * @version 1.26.9
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.core.mvc.JSONView
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var JSONView = View.extend("sap.ui.core.mvc.JSONView", /** @lends sap.ui.core.mvc.JSONView.prototype */ { metadata : {
	
		library : "sap.ui.core"
	}});
	
	(function(){
	
		/**
		 * Creates a JSON view of the given name and id.
		 *
		 * The <code>viewName</code> must either correspond to a JSON module that can be loaded
		 * via the module system (viewName + suffix ".view.json") and which defines the view or it must
		 * be a configuration object for a view.
		 * The configuration object can have a viewName, viewContent and a controller property. The viewName
		 * behaves as described above, viewContent can hold the view description as JSON string or as object literal. 
		 * 
		 * <strong>Note</strong>: when an object literal is given, it might be modified during view construction.
		 * 
		 * The controller property can hold an controller instance. If a controller instance is given, 
		 * it overrides the controller defined in the view.
		 *
		 * Like with any other control, an id is optional and will be created when missing.
		 *
		 * @param {string} [sId] id of the newly created view
		 * @param {string | object} vView name of a view resource or view configuration as described above.
		 * @param {string} [vView.viewName] name of a view resource in module name notation (without suffix)
		 * @param {string|object} [vView.viewContent] view definition as a JSON string or an object literal
		 * @param {sap.ui.core.mvc.Controller} [vView.controller] controller to be used for this view instance
		 * @public
		 * @static
		 * @return {sap.ui.core.mvc.JSONView} the created JSONView instance
		 */
		sap.ui.jsonview = function(sId, vView) {
			return sap.ui.view(sId, vView, sap.ui.core.mvc.ViewType.JSON);
		};
		
		/**
		 * The type of the view used for the <code>sap.ui.view</code> factory 
		 * function. This property is used by the parsers to define the specific 
		 * view type.
		 * @private
		 */
		JSONView._sType = sap.ui.core.mvc.ViewType.JSON;
		
		JSONView.prototype.initViewSettings = function(mSettings) {
			if (!mSettings) {
				throw new Error("mSettings must be given");
			}
	
			// View template handling - no JSON template given
			if (mSettings.viewName && mSettings.viewContent) {
				throw new Error("View name and view content are given. There is no point in doing this, so please decide.");
			} else if (!mSettings.viewName && !mSettings.viewContent) {
				throw new Error("Neither view name nor view content is given. One of them is required.");
			}
	
			if (mSettings.viewName) {
				this._loadTemplate(mSettings.viewName);
			} else if (mSettings.viewContent) {
				// keep the content as a pseudo property to make cloning work but without supporting mutation 
				// TODO model this as a property as soon as write-once-during-init properties become available
				this.mProperties["viewContent"] = mSettings.viewContent;
				if (typeof mSettings.viewContent === "string") {
					this._oJSONView = jQuery.parseJSON(mSettings.viewContent);
					if (!this._oJSONView) { // would lead to errors later on
						throw new Error("error when parsing viewContent: " + mSettings.viewContent);
					}
				} else if (typeof mSettings.viewContent === "object") {
					this._oJSONView = mSettings.viewContent;
				} else {
					throw new Error("viewContent must be a JSON string or object, but is a " + (typeof mSettings.viewContent));
				}
			} // else does not happen, already checked
	
			if ((this._oJSONView.resourceBundleName || this._oJSONView.resourceBundleUrl) && (!mSettings.models || !mSettings.models[this._oJSONView.resourceBundleAlias])) {
				var model = new sap.ui.model.resource.ResourceModel({bundleName:this._oJSONView.resourceBundleName, bundleUrl:this._oJSONView.resourceBundleUrl});
				this.setModel(model, this._oJSONView.resourceBundleAlias);
			}
	
		};
	
		JSONView.prototype.onControllerConnected = function(oController) {
			var that = this;
	
			// use preprocessors to fix IDs, associations and event handler references
			sap.ui.base.ManagedObject.runWithPreprocessors(function() {
					// parse
					that.applySettings({ content : that._oJSONView.content});
				},
	
				{
					// preprocessors
					id : function(sId) {
						// prefix only if prefix doesn't exist already. Avoids double prefixes 
						// for composite components (now done in createId)
						return that.createId(sId);
					},
					// preprocess 'mSettings' for setting the controller as Listener for defined events
					// => make sure to store old preprocessor in case of nested views
					settings : function(oSettings) {
						var oMetadata = this.getMetadata(),
						aValidKeys = oMetadata.getJSONKeys(),
						sKey, oValue, oKeyInfo;
						for (sKey in oSettings) {
							// get info object for the key
							if ( (oKeyInfo = aValidKeys[sKey]) !== undefined ) {
								oValue = oSettings[sKey];
								switch (oKeyInfo._iKind) {
								case 3: // SINGLE ASSOCIATIONS
									// prefix the association ids with the view id
									oSettings[sKey] = that.createId(oValue);
									break;
								case 5: // EVENTS
									if ( typeof oValue === "string" ) {
										oSettings[sKey] = View._resolveEventHandler(oValue, oController);
									}
									break;
								}
							}
						}
					}
				});
			
		};
	
		JSONView.prototype._loadTemplate = function(sTemplateName) {
			var sResourceName = jQuery.sap.getResourceName(sTemplateName, ".view.json");
			this._oJSONView = jQuery.sap.loadResource(sResourceName);
		};
	
		JSONView.prototype.getControllerName = function() {
			return this._oJSONView.controllerName;
		};
	
	}());
	

	return JSONView;

}, /* bExport= */ true);
