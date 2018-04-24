/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

//Provides class sap.ui.model.odata.v4.ODataPropertyBinding
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/BindingMode",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/PropertyBinding",
	"./_ODataHelper",
	"./lib/_Cache"
], function (jQuery, BindingMode, ChangeReason, PropertyBinding, _ODataHelper, _Cache) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataPropertyBinding",
		mSupportedEvents = {
			AggregatedDataStateChange : true,
			change : true,
			dataReceived : true,
			dataRequested : true,
			DataStateChange : true
		};

	/**
	 * Do <strong>NOT</strong> call this private constructor, but rather use
	 * {@link sap.ui.model.odata.v4.ODataModel#bindProperty} instead!
	 *
	 * @param {sap.ui.model.odata.v4.ODataModel} oModel
	 *   The OData V4 model
	 * @param {string} sPath
	 *   The binding path in the model; must not be empty or end with a slash
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @param {object} [mParameters]
	 *   Map of binding parameters which can be OData query options as specified in
	 *   "OData Version 4.0 Part 2: URL Conventions" or the binding-specific parameter "$$groupId".
	 *   Note: Binding parameters may only be provided for absolute binding paths as only those
	 *   lead to a data service request.
	 *   All "5.2 Custom Query Options" are allowed except for those with a name starting with
	 *   "sap-". All other query options lead to an error.
	 *   Query options specified for the binding overwrite model query options.
	 * @param {string} [mParameters.$$groupId]
	 *   The group ID to be used for <b>read</b> requests triggered by this binding; if not
	 *   specified, either the parent binding's group ID (if the binding is relative) or the
	 *   model's group ID is used, see {@link sap.ui.model.odata.v4.ODataModel#constructor}.
	 *   Valid values are <code>undefined</code>, '$auto', '$direct' or application group IDs as
	 *   specified in {@link sap.ui.model.odata.v4.ODataModel#submitBatch}.
	 * @throws {Error}
	 *   If disallowed binding parameters are provided
	 *
	 * @alias sap.ui.model.odata.v4.ODataPropertyBinding
	 * @author SAP SE
	 * @class Property binding for an OData V4 model.
	 *   An event handler can only be attached to this binding for the following events: 'change',
	 *   'dataReceived', and 'dataRequested'.
	 *   For unsupported events, an error is thrown.
	 * @extends sap.ui.model.PropertyBinding
	 * @public
	 * @since 1.37.0
	 * @version 1.44.31
	 */
	var ODataPropertyBinding
		= PropertyBinding.extend("sap.ui.model.odata.v4.ODataPropertyBinding", {
			constructor : function (oModel, sPath, oContext, mParameters) {
				var oBindingParameters;

				PropertyBinding.call(this, oModel, sPath);

				if (!sPath || sPath.slice(-1) === "/") {
					throw new Error("Invalid path: " + sPath);
				}
				oBindingParameters = _ODataHelper.buildBindingParameters(mParameters,
					["$$groupId"]);
				this.sGroupId = oBindingParameters.$$groupId;
				this.mQueryOptions = _ODataHelper.buildQueryOptions(this.oModel.mUriParameters,
					mParameters);
				this.oContext = oContext;
				this.makeCache();
				this.bInitial = true;
				this.bRequestTypeFailed = false;
				this.vValue = undefined;
				oModel.bindingCreated(this);
			},
			metadata : {
				publicMethods : []
			}
		});

	/**
	 * The 'change' event is fired when the binding is initialized or refreshed or its type is
	 * changed or its parent context is changed. It is to be used by controls to get notified about
	 * changes to the value of this property binding. Registered event handlers are called with the
	 * change reason as parameter.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @param {object} oEvent.getParameters
	 * @param {sap.ui.model.ChangeReason} oEvent.getParameters.reason
	 *   The reason for the 'change' event: {@link sap.ui.model.ChangeReason.Change} when the
	 *   binding is initialized, {@link sap.ui.model.ChangeReason.Refresh} when the binding is
	 *   refreshed, and {@link sap.ui.model.ChangeReason.Context} when the parent context is changed
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataPropertyBinding#change
	 * @public
	 * @see sap.ui.base.Event
	 * @since 1.37.0
	 */

	/**
	 * The 'dataRequested' event is fired directly after data has been requested from a back end.
	 * It is to be used by applications for example to switch on a busy indicator. Registered event
	 * handlers are called without parameters.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataPropertyBinding#dataRequested
	 * @public
	 * @see sap.ui.base.Event
	 * @since 1.37.0
	 */

	/**
	 * The 'dataReceived' event is fired after the back-end data has been processed and the
	 * registered 'change' event listeners have been notified. It is to be used by applications for
	 * example to switch off a busy indicator or to process an error.
	 *
	 * If back-end requests are successful, the event has no parameters. Use
	 * {@link #getValue() oEvent.getSource().getValue()} to access the response data. Note that
	 * controls bound to this data may not yet have been updated, meaning it is not safe for
	 * registered event handlers to access data via control APIs.
	 *
	 * If a back-end request fails, the 'dataReceived' event provides an <code>Error</code> in the
	 * 'error' event parameter.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @param {object} oEvent.getParameters
	 * @param {Error} [oEvent.getParameters.error] The error object if a back-end request failed.
	 *   If there are multiple failed back-end requests, the error of the first one is provided.
	 *
	 * @event
	 * @name sap.ui.model.odata.v4.ODataPropertyBinding#dataReceived
	 * @public
	 * @see sap.ui.base.Event
	 * @since 1.37.0
	 */

	// See class documentation
	// @override
	// @public
	// @see sap.ui.base.EventProvider#attachEvent
	// @since 1.37.0
	ODataPropertyBinding.prototype.attachEvent = function (sEventId) {
		if (!(sEventId in mSupportedEvents)) {
			throw new Error("Unsupported event '" + sEventId
				+ "': v4.ODataPropertyBinding#attachEvent");
		}
		return PropertyBinding.prototype.attachEvent.apply(this, arguments);
	};

	/**
	 * Updates the binding's value and sends a change event if necessary. A change event is sent
	 * if the <code>bForceUpdate</code> parameter is set to <code>true</code> or if the value
	 * has changed unless the request to read the new value has been cancelled by a later request.
	 * If a relative binding has no context the <code>bForceUpdate</code> parameter
	 * is ignored and the change event is only fired if the old value was not
	 * <code>undefined</code>.
	 * If the binding has no type, the property's type is requested from the meta model and set.
	 * Note: The change event is only sent asynchronously after reading the binding's value and
	 * type information.
	 * If the binding's path cannot be resolved or if reading the binding's value fails or if the
	 * value read is invalid (e.g. not a primitive value), the binding's value is reset to
	 * <code>undefined</code>. As described above, this may trigger a change event depending on the
	 * previous value and the <code>bForceUpdate</code> parameter.
	 *
	 * @param {boolean} [bForceUpdate=false]
	 *   If <code>true</code> the change event is always fired except there is no context for a
	 *   relative binding and the value is <code>undefined</code>.
	 * @param {sap.ui.model.ChangeReason} [sChangeReason=ChangeReason.Change]
	 *   The change reason for the change event
	 * @param {string} [sGroupId=getGroupId()]
	 *   The group ID to be used for the read.
	 * @returns {Promise}
	 *   A Promise to be resolved when the check is finished
	 *
	 * @private
	 * @see sap.ui.model.Binding#checkUpdate
	 */
	// @override
	ODataPropertyBinding.prototype.checkUpdate = function (bForceUpdate, sChangeReason, sGroupId) {
		var oChangeReason = {reason : sChangeReason || ChangeReason.Change},
			bDataRequested = false,
			bFire = false,
			mParametersForDataReceived,
			oPromise,
			aPromises = [],
			oReadPromise,
			sResolvedPath = this.oModel.resolve(this.sPath, this.oContext),
			that = this;

		if (!sResolvedPath) {
			oPromise = Promise.resolve();
			if (that.vValue !== undefined) {
				oPromise = oPromise.then(function () {
					that._fireChange(oChangeReason);
				});
			}
			that.vValue = undefined; // ensure value is reset
			return oPromise;
		}
		if (!this.bRequestTypeFailed && !this.oType && this.sInternalType !== "any") {
			// request type only once
			aPromises.push(this.oModel.getMetaModel().requestUI5Type(sResolvedPath)
				.then(function (oType) {
					that.setType(oType, that.sInternalType);
				})["catch"](function (oError) {
					that.bRequestTypeFailed = true;
					jQuery.sap.log.warning(oError.message, sResolvedPath, sClassName);
				})
			);
		}
		if (this.oCache) {
			sGroupId = sGroupId || this.getGroupId();
			oReadPromise = this.oCache.read(sGroupId, /*sPath*/undefined, function () {
				bDataRequested = true;
				that.fireDataRequested();
			}, this);
		} else {
			oReadPromise = this.oContext.fetchValue(this.sPath, this);
		}
		aPromises.push(oReadPromise.then(function (vValue) {
			if (vValue && typeof vValue === "object") {
				jQuery.sap.log.error("Accessed value is not primitive", sResolvedPath, sClassName);
				vValue = undefined;
			}
			bFire = that.vValue !== vValue;
			that.vValue = vValue;
		})["catch"](function (oError) {
			// do not rethrow, ManagedObject doesn't react on this either
			// throwing an exception would cause "Uncaught (in promise)" in Chrome
			that.oModel.reportError("Failed to read path " + sResolvedPath, sClassName, oError);
			if (!oError.canceled) {
				// fire change event only if error was not caused by refresh
				// and value was not undefined
				bFire = that.vValue !== undefined;
				mParametersForDataReceived = {error : oError};
				that.vValue = undefined;
			}
			return oError.canceled;
		}));

		return Promise.all(aPromises).then(function (aResults) {
			var bCanceled = aResults[aPromises.length - 1];

			if (!bCanceled) {
				that.bInitial = false;
				if (bForceUpdate || bFire) {
					that._fireChange(oChangeReason);
				}
			}
			if (bDataRequested) {
				that.fireDataReceived(mParametersForDataReceived);
			}
		});
	};

	/**
	 * Destroys the object. The object must not be used anymore after this function was called.
	 *
	 * @public
	 * @since 1.39.0
	 */
	// @override
	ODataPropertyBinding.prototype.destroy = function () {
		if (this.oCache) {
			this.oCache.deregisterChange(undefined, this);
			this.oCache = null;
		} else if (this.oContext) {
			this.oContext.deregisterChange(this.sPath, this);
		}
		this.oModel.bindingDestroyed(this);
		PropertyBinding.prototype.destroy.apply(this, arguments);
	};

	/**
	 * Returns the group ID of the binding that is used for read requests.
	 *
	 * @returns {string}
	 *   The group ID
	 *
	 * @private
	 */
	ODataPropertyBinding.prototype.getGroupId = function () {
		return this.sGroupId
			|| (this.bRelative && this.oContext && this.oContext.getGroupId
					&& this.oContext.getGroupId())
			|| this.oModel.getGroupId();
	};

	/**
	 * Returns the group ID of the binding that is used for update requests.
	 *
	 * @returns {string}
	 *   The update group ID
	 *
	 * @private
	 */
	ODataPropertyBinding.prototype.getUpdateGroupId = function () {
		return (this.bRelative && this.oContext && this.oContext.getUpdateGroupId
					&& this.oContext.getUpdateGroupId())
			|| this.oModel.getUpdateGroupId();
	};

	/**
	 * Returns the current value.
	 *
	 * @returns {any}
	 *   The current value
	 *
	 * @public
	 * @see sap.ui.model.PropertyBinding#getValue
	 * @since 1.37.0
	 */
	ODataPropertyBinding.prototype.getValue = function () {
		return this.vValue;
	};

	/**
	 * Returns <code>true</code> if the binding has pending changes, meaning updates that have not
	 * yet been sent to the server.
	 *
	 * @returns {boolean}
	 *   <code>true</code> if the binding has pending changes
	 *
	 * @public
	 * @since 1.39.0
	 */
	ODataPropertyBinding.prototype.hasPendingChanges = function () {
		if (this.oCache) {
			return this.oCache.hasPendingChanges("");
		}
		if (this.oContext) {
			return this.oContext.hasPendingChanges(this.sPath);
		}
		return false;
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Binding#isInitial
	 * @since 1.37.0
	 */
	// @override
	ODataPropertyBinding.prototype.isInitial = function () {
		throw new Error("Unsupported operation: v4.ODataPropertyBinding#isInitial");
	};

	/**
	 * Creates the cache for absolute bindings and bindings with a base context.
	 *
	 * @private
	 */
	ODataPropertyBinding.prototype.makeCache = function () {
		var sResolvedPath = this.sPath,
			oContext = this.oContext;

		if (oContext && !(oContext.fetchValue)) {
			sResolvedPath = this.oModel.resolve(this.sPath, oContext);
		}
		if (sResolvedPath[0] === "/") {
			this.oCache = _Cache.createSingle(this.oModel.oRequestor, sResolvedPath.slice(1),
				this.mQueryOptions, true);
		} else {
			this.oCache = undefined;
		}
	};

	/**
	 * Change handler for the cache. The cache calls this method when the value is changed.
	 *
	 * @param {any} vValue
	 *   The new value
	 *
	 * @private
	 */
	ODataPropertyBinding.prototype.onChange = function (vValue) {
		this.vValue = vValue;
		this._fireChange({reason : ChangeReason.Change});
	};

	/**
	 * Refreshes this binding. A refresh retrieves data from the server using the given group ID and
	 * fires a change event when new data is available.
	 * Refresh is supported for bindings which are not relative to a V4
	 * {@link sap.ui.model.odata.v4.Context}.
	 *
	 * Note: When calling {@link #refresh} multiple times, the result of the request triggered by
	 * the last call determines the binding's data; it is <b>independent</b> of the order of calls
	 * to {@link sap.ui.model.odata.v4.ODataModel#submitBatch} with the given group ID.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID to be used for refresh; if not specified, the group ID for this binding is
	 *   used, see {@link sap.ui.model.odata.v4.ODataPropertyBinding#constructor}.
	 *   Valid values are <code>undefined</code>, '$auto', '$direct' or application group IDs as
	 *   specified in {@link sap.ui.model.odata.v4.ODataModel#submitBatch}.
	 * @throws {Error}
	 *   If the given group ID is invalid or refresh on this binding is not supported.
	 *
	 * @public
	 * @see sap.ui.model.Binding#refresh
	 * @since 1.37.0
	 */
	// @override
	ODataPropertyBinding.prototype.refresh = function (sGroupId) {
		if (!_ODataHelper.isRefreshable(this)) {
			throw new Error("Refresh on this binding is not supported");
		}

		_ODataHelper.checkGroupId(sGroupId);

		this.oCache.refresh();
		this.refreshInternal(sGroupId);
	};

	/**
	 * Internal method to refresh the binding, called by {@link #refresh} and also by a parent list
	 * binding during its refresh.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID to be used for refresh
	 *
	 * @private
	 */
	ODataPropertyBinding.prototype.refreshInternal = function (sGroupId) {
		this.checkUpdate(true, ChangeReason.Refresh, sGroupId);
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Binding#resume
	 * @since 1.37.0
	 */
	// @override
	ODataPropertyBinding.prototype.resume = function () {
		throw new Error("Unsupported operation: v4.ODataPropertyBinding#resume");
	};

	/**
	 * Sets the (base) context if the binding path is relative. Triggers (@link #makeCache) to check
	 * if a cache needs to be created and {@link #checkUpdate} to check for the current value if the
	 * context has changed. In case of absolute bindings nothing is done.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 *
	 * @private
	 * @see sap.ui.model.Binding#setContext
	 */
	// @override
	ODataPropertyBinding.prototype.setContext = function (oContext) {
		if (this.oContext !== oContext) {
			if (!this.oCache && this.oContext) {
				this.oContext.deregisterChange(this.sPath, this);
			}
			this.oContext = oContext;
			if (this.bRelative) {
				this.makeCache();
				this.checkUpdate(false, ChangeReason.Context);
			}
		}
	};

	/**
	 * Sets the optional type and internal type for this binding; used for formatting and parsing.
	 * Fires a change event if the type has changed.
	 *
	 * @param {sap.ui.model.Type} oType
	 *   The type for this binding
	 * @param {string} sInternalType
	 *   The internal type of the element property which owns this binding, for example "any",
	 *   "boolean", "float", "int", "string"; see {@link sap.ui.model.odata.type} for more
	 *   information
	 *
	 * @public
	 * @since 1.43.0
	 * @see sap.ui.model.PropertyBinding#setType
	 */
	// @override
	ODataPropertyBinding.prototype.setType = function (oType) {
		var oOldType = this.oType;

		if (oType && oType.getName() === "sap.ui.model.odata.type.DateTimeOffset") {
			oType.setV4();
		}
		PropertyBinding.prototype.setType.apply(this, arguments);
		if (!this.bInitial && oOldType !== oType) {
			this._fireChange({reason : ChangeReason.Change});
		}
	};

	/**
	 * Sets the new current value and updates the cache.
	 *
	 * @param {any} vValue
	 *   The new value which must be primitive
	 * @param {string} [sGroupId]
	 *   The group ID to be used for this update call; if not specified, the update group ID for
	 *   this binding (or its relevant parent binding) is used, see
	 *   {@link sap.ui.model.odata.v4.ODataPropertyBinding#constructor}.
	 *   Valid values are <code>undefined</code>, '$auto', '$direct' or application group IDs as
	 *   specified in {@link sap.ui.model.odata.v4.ODataModel#submitBatch}.
	 * @throws {Error}
	 *   If the new value is not primitive or the binding is not relative
	 *
	 * @public
	 * @see sap.ui.model.PropertyBinding#setValue
	 * @since 1.37.0
	 */
	ODataPropertyBinding.prototype.setValue = function (vValue, sGroupId) {
		var that = this;

		if (typeof vValue === "function" || typeof vValue === "object") {
			throw new Error("Not a primitive value");
		}
		_ODataHelper.checkGroupId(sGroupId);

		if (this.vValue !== vValue) {
			if (this.oCache) {
				jQuery.sap.log.error("Cannot set value on this binding",
					this.oModel.resolve(this.sPath, this.oContext), sClassName);
				// do not update this.vValue!
			} else if (this.oContext) {
				this.oContext.updateValue(sGroupId, this.sPath, vValue)
					["catch"](function (oError) {
						if (!oError.canceled) {
							that.oModel.reportError("Failed to update path "
								+ that.oModel.resolve(that.sPath, that.oContext),
								sClassName, oError);
						}
					});
			} else {
				jQuery.sap.log.warning("Cannot set value on relative binding without context",
					this.sPath, sClassName);
				// do not update this.vValue!
			}
		}
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Binding#suspend
	 * @since 1.37.0
	 */
	// @override
	ODataPropertyBinding.prototype.suspend = function () {
		throw new Error("Unsupported operation: v4.ODataPropertyBinding#suspend");
	};

	/**
	 * Returns a string representation of this object including the binding path. If the binding is
	 * relative, the parent path is also given, separated by a '|'.
	 *
	 * @return {string} A string description of this binding
	 * @public
	 * @since 1.37.0
	 */
	ODataPropertyBinding.prototype.toString = function () {
		return sClassName + ": " + (this.bRelative ? this.oContext + "|" : "") + this.sPath;
	};

	return ODataPropertyBinding;
}, /* bExport= */ true);
