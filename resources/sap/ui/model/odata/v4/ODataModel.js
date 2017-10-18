/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

/**
 * Model and related classes like bindings for OData V4.
 *
 * @name sap.ui.model.odata.v4
 * @namespace
 * @public
 * @since 1.37.0
 */

//Provides class sap.ui.model.odata.v4.ODataModel
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/message/Message",
	"sap/ui/model/BindingMode",
	"sap/ui/model/Context",
	"sap/ui/model/Model",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/thirdparty/URI",
	"./_ODataHelper",
	"./lib/_MetadataRequestor",
	"./lib/_Requestor",
	"./ODataContextBinding",
	"./ODataListBinding",
	"./ODataMetaModel",
	"./ODataPropertyBinding"
], function (jQuery, Message, BindingMode, BaseContext, Model, OperationMode, URI, _ODataHelper,
		_MetadataRequestor, _Requestor, ODataContextBinding, ODataListBinding, ODataMetaModel,
		ODataPropertyBinding) {

	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataModel",
		mSupportedEvents = {
			messageChange : true
		},
		mSupportedParameters = {
			annotationURI : true,
			groupId : true,
			operationMode : true,
			serviceUrl : true,
			synchronizationMode : true,
			updateGroupId : true
		};

	/**
	 * Constructor for a new ODataModel.
	 *
	 * @param {object} mParameters
	 *   The parameters
	 * @param {string|string[]} [mParameters.annotationURI]
	 *   The URL (or an array of URLs) from which the annotation metadata are loaded.
	 *   The annotation files are merged into the service metadata in the given order (last one
	 *   wins). The same annotations are overwritten; if an annotation file contains other elements
	 *   (like a type definition) that are already merged, an error is thrown.
	 *   Supported since 1.41.0
	 * @param {string} [mParameters.groupId="$auto"]
	 *   Controls the model's use of batch requests: '$auto' bundles requests from the model in a
	 *   batch request which is sent automatically before rendering; '$direct' sends requests
	 *   directly without batch; other values result in an error
	 * @param {sap.ui.model.odata.OperationMode} [mParameters.operationMode]
	 *   The default operation mode for sorting. Only
	 *   {@link sap.ui.model.odata.OperationMode.Server} is supported since 1.39.0.
	 * @param {string} mParameters.serviceUrl
	 *   Root URL of the service to request data from. The path part of the URL must end with a
	 *   forward slash according to OData V4 specification ABNF, rule "serviceRoot". You may append
	 *   OData custom query options to the service root URL separated with a "?", for example
	 *   "/MyService/?custom=foo".
	 *   See specification "OData Version 4.0 Part 2: URL Conventions", "5.2 Custom Query Options".
	 *   OData system query options and OData parameter aliases lead to an error.
	 * @param {string} mParameters.synchronizationMode
	 *   Controls synchronization between different bindings which refer to the same data for the
	 *   case data changes in one binding. Must be set to 'None' which means bindings are not
	 *   synchronized at all; all other values are not supported and lead to an error.
	 * @param {string} [mParameters.updateGroupId]
	 *   The group ID that is used for update requests. If no update group ID is specified,
	 *   <code>mParameters.groupId</code> is used. Valid update group IDs are <code>undefined<code>,
	 *   '$auto', '$direct' or an application group ID, which is a non-empty string consisting of
	 *   alphanumeric characters from the basic Latin alphabet, including the underscore.
	 * @throws {Error} If an unsupported synchronization mode is given, if the given service root
	 *   URL does not end with a forward slash, if an unsupported parameter is given, if OData
	 *   system query options or parameter aliases are specified as parameters, if an invalid group
	 *   ID or update group ID is given, if the given operation mode is not supported, if an
	 *   annotation file cannot be merged into the service metadata.
	 *
	 * @alias sap.ui.model.odata.v4.ODataModel
	 * @author SAP SE
	 * @class Model implementation for OData V4.
	 *
	 *   Every resource path (relative to the service root URL, no query options) according to
	 *   "4 Resource Path" in specification "OData Version 4.0 Part 2: URL Conventions" is
	 *   a valid data binding path within this model if a leading slash is added; for example
	 *   "/" + "EMPLOYEES('A%2FB%26C')" to access an entity instance with key "A/B&C". Note that
	 *   appropriate URI encoding is necessary. "4.5.1 Addressing Actions" needs an operation
	 *   binding, see {@link sap.ui.model.odata.v4.ODataContextBinding}.
	 *
	 *   Note that the OData V4 model has its own {@link sap.ui.model.odata.v4.Context} class.
	 *   Bindings which are relative to such a V4 context depend on their corresponding parent
	 *   binding and do not access data with their own service requests unless parameters are
	 *   provided.
	 *
	 *   The model does not support any public events; attaching an event handler leads to an error.
	 * @extends sap.ui.model.Model
	 * @public
	 * @since 1.37.0
	 * @version 1.44.22
	 */
	var ODataModel = Model.extend("sap.ui.model.odata.v4.ODataModel",
			/** @lends sap.ui.model.odata.v4.ODataModel.prototype */
			{
				constructor : function (mParameters) {
					var mHeaders = {
							"Accept-Language" : sap.ui.getCore().getConfiguration().getLanguageTag()
						},
						sParameter,
						sServiceUrl,
						oUri,
						that = this;

					// do not pass any parameters to Model
					Model.apply(this);

					if (!mParameters || mParameters.synchronizationMode !== "None") {
						throw new Error("Synchronization mode must be 'None'");
					}
					for (sParameter in mParameters) {
						if (!(sParameter in mSupportedParameters)) {
							throw new Error("Unsupported parameter: " + sParameter);
						}
					}
					sServiceUrl = mParameters.serviceUrl;
					if (!sServiceUrl) {
						throw new Error("Missing service root URL");
					}
					oUri = new URI(sServiceUrl);
					if (oUri.path()[oUri.path().length - 1] !== "/") {
						throw new Error("Service root URL must end with '/'");
					}
					if (mParameters.operationMode
							&& mParameters.operationMode !== OperationMode.Server) {
						throw new Error("Unsupported operation mode: "
							+ mParameters.operationMode);
					}
					this.sOperationMode = mParameters.operationMode;
					// Note: strict checking for model's URI parameters, but "sap-*" is allowed
					this.mUriParameters
						= _ODataHelper.buildQueryOptions(null, oUri.query(true), null, true);
					this.sServiceUrl = oUri.query("").toString();
					this.sGroupId = mParameters.groupId;
					if (this.sGroupId === undefined) {
						this.sGroupId = "$auto";
					}
					if (this.sGroupId !== "$auto" && this.sGroupId !== "$direct") {
						throw new Error("Group ID must be '$auto' or '$direct'");
					}
					_ODataHelper.checkGroupId(mParameters.updateGroupId, false,
						"Invalid update group ID: ");
					this.sUpdateGroupId = mParameters.updateGroupId || this.getGroupId();

					this.oMetaModel = new ODataMetaModel(
						_MetadataRequestor.create(mHeaders, this.mUriParameters),
						this.sServiceUrl + "$metadata", mParameters.annotationURI);
					this.oRequestor = _Requestor.create(this.sServiceUrl, mHeaders,
						this.mUriParameters, function (sGroupId) {
							if (sGroupId === "$auto") {
								sap.ui.getCore()
									.addPrerenderingTask(that._submitBatch.bind(that, sGroupId));
							}
						});

					this.aAllBindings = [];
					this.sDefaultBindingMode = BindingMode.TwoWay;
					this.mSupportedBindingModes = {
						OneTime : true,
						OneWay : true,
						TwoWay : true
					};
				}
			});

	/**
	 * Submits the requests associated with the given group ID in one batch request.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @returns {Promise}
	 *   A promise on the outcome of the HTTP request resolving with <code>undefined</code>; it is
	 *   rejected with an error if the batch request itself fails
	 *
	 * @private
	 */
	ODataModel.prototype._submitBatch = function (sGroupId) {
		return this.oRequestor.submitBatch(sGroupId)
			["catch"](function (oError) {
				jQuery.sap.log.error("$batch failed", oError.message, sClassName);
				throw oError;
			});
	};

	// See class documentation
	// @override
	// @public
	// @see sap.ui.base.EventProvider#attachEvent
	// @since 1.37.0
	ODataModel.prototype.attachEvent = function (sEventId) {
		if (!(sEventId in mSupportedEvents)) {
			throw new Error("Unsupported event '" + sEventId
				+ "': v4.ODataModel#attachEvent");
		}
		return Model.prototype.attachEvent.apply(this, arguments);
	};

	/**
	 * Creates a new context binding for the given path, context and parameters.
	 *
	 * This binding is inactive and will not know the bound context initially. You have to call
	 * {@link sap.ui.model.Binding#initialize} to get it updated asynchronously and register a
	 * change listener at the binding to be informed when the bound context is available.
	 *
	 * @param {string} sPath
	 *   The binding path in the model; must not end with a slash
	 * @param {sap.ui.model.odata.v4.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @param {object} [mParameters]
	 *   Map of binding parameters which can be OData query options as specified in
	 *   "OData Version 4.0 Part 2: URL Conventions" or the binding-specific parameters "$$groupId"
	 *   and "$$updateGroupId".
	 *   Note: If parameters are provided for a relative binding path, the binding accesses data
	 *   with its own service requests instead of using its parent binding.
	 *   The following OData query options are allowed:
	 *   <ul>
	 *   <li> All "5.2 Custom Query Options" except for those with a name starting with "sap-"
	 *   <li> The $apply, $expand, $filter, $orderby and $select "5.1 System Query Options"; OData
	 *   V4 only allows $apply, $filter and $orderby inside resource paths that identify a
	 *   collection. In our case here, this means you can only use them inside $expand.
	 *   </ul>
	 *   All other query options lead to an error.
	 *   Query options specified for the binding overwrite model query options.
	 * @param {string} [mParameters.$$groupId]
	 *   The group ID to be used for <b>read</b> requests triggered by this binding; if not
	 *   specified, either the parent binding's group ID (if the binding is relative) or the
	 *   model's group ID is used, see {@link sap.ui.model.odata.v4.ODataModel#constructor}.
	 *   Valid values are <code>undefined</code>, '$auto', '$direct' or application group IDs as
	 *   specified in {@link #submitBatch}.
	 * @param {string} [mParameters.$$updateGroupId]
	 *   The group ID to be used for <b>update</b> requests triggered by this binding;
	 *   if not specified, either the parent binding's update group ID (if the binding is relative)
	 *   or the model's update group ID is used, see
	 *   {@link sap.ui.model.odata.v4.ODataModel#constructor}.
	 *   For valid values, see parameter "$$groupId".
	 * @returns {sap.ui.model.odata.v4.ODataContextBinding}
	 *   The context binding
	 * @throws {Error}
	 *   If disallowed binding parameters are provided
	 *
	 * @public
	 * @see sap.ui.model.Model#bindContext
	 * @since 1.37.0
	 */
	ODataModel.prototype.bindContext = function (sPath, oContext, mParameters) {
		return new ODataContextBinding(this, sPath, oContext, mParameters);
	};

	/**
	 * Callback function for all V4 bindings to add themselves to their model.
	 *
	 * @param {sap.ui.model.odata.v4.ODataContextBinding|sap.ui.model.odata.v4.ODataListBinding|sap.ui.model.odata.v4.ODataPropertyBinding} oBinding
	 *   A context, list, or property binding
	 *
	 * @private
	 */
	ODataModel.prototype.bindingCreated = function (oBinding) {
		this.aAllBindings.push(oBinding);
	};

	/**
	 * Callback function for all V4 bindings to remove themselves from their model.
	 *
	 * @param {sap.ui.model.odata.v4.ODataContextBinding|sap.ui.model.odata.v4.ODataListBinding|sap.ui.model.odata.v4.ODataPropertyBinding} oBinding
	 *   A context, list, or property binding
	 * @throws {Error}
	 *   If a binding is removed twice or without adding.
	 *
	 * @private
	 */
	ODataModel.prototype.bindingDestroyed = function (oBinding) {
		var iIndex = this.aAllBindings.indexOf(oBinding);

		if (iIndex < 0) {
			throw new Error("Unknown " + oBinding);
		}
		this.aAllBindings.splice(iIndex, 1);
	};

	/**
	 * Creates a new list binding for the given path and optional context which must
	 * resolve to an absolute OData path for an entity set.
	 *
	 * @param {string} sPath
	 *   The binding path in the model; must not be empty or end with a slash
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @param {sap.ui.model.Sorter | sap.ui.model.Sorter[]} [vSorters]
	 *   The dynamic sorters to be used initially. Call
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#sort} to replace them. Static sorters, as
	 *   defined in the '$orderby' binding parameter, are always executed after the dynamic sorters.
	 *   Supported since 1.39.0.
	 * @param {sap.ui.model.Filter | sap.ui.model.Filter[]} [vFilters]
	 *   The dynamic application filters to be used initially. Call
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#filter} to replace them. Static filters, as
	 *   defined in the '$filter' binding parameter, are always combined with the dynamic filters
	 *   using a logical <code>AND</code>.
	 *   Supported since 1.39.0.
	 * @param {object} [mParameters]
	 *   Map of binding parameters which can be OData query options as specified in
	 *   "OData Version 4.0 Part 2: URL Conventions" or the binding-specific parameters "$$groupId"
	 *   and "$$updateGroupId".
	 *   Note: If parameters are provided for a relative binding path, the binding accesses data
	 *   with its own service requests instead of using its parent binding.
	 *   The following OData query options are allowed:
	 *   <ul>
	 *   <li> All "5.2 Custom Query Options" except for those with a name starting with "sap-"
	 *   <li> The $apply, $expand, $filter, $orderby and $select "5.1 System Query Options"
	 *   </ul>
	 *   All other query options lead to an error.
	 *   Query options specified for the binding overwrite model query options.
	 * @param {sap.ui.model.odata.OperationMode} [mParameters.operationMode]
	 *   The operation mode for sorting. Since 1.39.0, the operation mode
	 *   {@link sap.ui.model.odata.OperationMode.Server} is supported. All other operation modes
	 *   including <code>undefined</code> lead to an error if 'vSorters' are given or if
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#sort} is called.
	 * @param {string} [mParameters.$$groupId]
	 *   The group ID to be used for <b>read</b> requests triggered by this binding; if not
	 *   specified, either the parent binding's group ID (if the binding is relative) or the
	 *   model's group ID is used, see {@link sap.ui.model.odata.v4.ODataModel#constructor}.
	 *   Valid values are <code>undefined</code>, '$auto', '$direct' or application group IDs as
	 *   specified in {@link #submitBatch}.
	 * @param {string} [mParameters.$$updateGroupId]
	 *   The group ID to be used for <b>update</b> requests triggered by this binding;
	 *   if not specified, either the parent binding's update group ID (if the binding is relative)
	 *   or the model's update group ID is used,
	 *   see {@link sap.ui.model.odata.v4.ODataModel#constructor}.
	 *   For valid values, see parameter "$$groupId".
	 * @returns {sap.ui.model.odata.v4.ODataListBinding}
	 *   The list binding
	 * @throws {Error}
	 *   If disallowed binding parameters are provided or an unsupported operation mode is used
	 *
	 * @public
	 * @see sap.ui.model.Model#bindList
	 * @since 1.37.0
	 */
	ODataModel.prototype.bindList = function (sPath, oContext, vSorters, vFilters, mParameters) {
		return new ODataListBinding(this, sPath, oContext, vSorters, vFilters, mParameters);
	};

	/**
	 * Creates a new property binding for the given path. This binding is inactive and will not
	 * know the property value initially. You have to call {@link sap.ui.model.Binding#initialize}
	 * to get it updated asynchronously and register a change listener at the binding to be informed
	 * when the value is available.
	 *
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
	 *   specified in {@link #submitBatch}.
	 * @returns {sap.ui.model.odata.v4.ODataPropertyBinding}
	 *   The property binding
	 * @throws {Error}
	 *   If disallowed binding parameters are provided
	 *
	 * @public
	 * @see sap.ui.model.Model#bindProperty
	 * @since 1.37.0
	 */
	ODataModel.prototype.bindProperty = function (sPath, oContext, mParameters) {
		return new ODataPropertyBinding(this, sPath, oContext, mParameters);
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#bindTree
	 * @since 1.37.0
	 */
	ODataModel.prototype.bindTree = function () {
		throw new Error("Unsupported operation: v4.ODataModel#bindTree");
	};

	/**
	 * Creates a binding context for the given path. A relative path can only be resolved if a
	 * context is provided.
	 * Note: The parameters <code>mParameters</code>, <code>fnCallBack</code>, and
	 * <code>bReload</code> from {@link sap.ui.model.Model#createBindingContext} are not supported.
	 *
	 * @param {string} sPath
	 *   The binding path, may be relative to the provided context
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @returns {sap.ui.model.Context}
	 *   The binding context with the resolved path and the model instance
	 * @throws {Error}
	 *   If a relative path is provided without a context or in case of unsupported parameters or
	 *   if the given context is a {@link sap.ui.model.odata.v4.Context}
	 *
	 * @public
	 * @see sap.ui.model.Model#createBindingContext
	 * @since 1.37.0
	 */
	ODataModel.prototype.createBindingContext = function (sPath, oContext) {
		var sResolvedPath;

		if (arguments.length > 2) {
			throw new Error("Only the parameters sPath and oContext are supported");
		}
		if (oContext && oContext.getBinding) {
			throw new Error("Unsupported type: oContext must be of type sap.ui.model.Context, "
				+ "but was sap.ui.model.odata.v4.Context");
		}
		sResolvedPath = this.resolve(sPath, oContext);
		if (sResolvedPath === undefined) {
			throw new Error("Cannot create binding context from relative path '" + sPath
				+ "' without context");
		}

		return new BaseContext(this, sResolvedPath);
	};

	/**
	 * Destroys this model and its meta model.
	 *
	 * @public
	 * @see sap.ui.model.Model#destroy
	 * @since 1.38.0
	 */
	// @override
	ODataModel.prototype.destroy = function () {
		this.oMetaModel.destroy();
		return Model.prototype.destroy.apply(this, arguments);
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#destroyBindingContext
	 * @since 1.37.0
	 */
	ODataModel.prototype.destroyBindingContext = function () {
		throw new Error("Unsupported operation: v4.ODataModel#destroyBindingContext");
	};

	/**
	 * Cannot get a shared context for a path. Contexts are created by bindings instead and there
	 * may be multiple contexts for the same path.
	 *
	 * @throws {Error}
	 *
	 * @private
	 * @see sap.ui.model.Model#getContext
	 */
	// @override
	ODataModel.prototype.getContext = function () {
		throw new Error("Unsupported operation: v4.ODataModel#getContext");
	};

	/**
	 * Returns all bindings which are relative to the given parent context or to a context created
	 * by the given parent binding.
	 *
	 * @param {sap.ui.model.Binding|sap.ui.model.Context} oParent
	 *   The parent binding or context
	 * @returns {sap.ui.model.Binding[]}
	 *   A list of all dependent bindings, never <code>null</code>
	 *
	 * @private
	 */
	ODataModel.prototype.getDependentBindings = function (oParent) {
		return this.aAllBindings.filter(function (oBinding) {
			return oBinding.isRelative()
				&& (oBinding.getContext() === oParent
						|| oBinding.getContext() && oBinding.getContext().getBinding
							&& oBinding.getContext().getBinding() === oParent
					);
		});
	};

	/**
	 * Returns the model's group ID.
	 *
	 * @returns {string}
	 *   The group ID
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.ODataModel#constructor
	 * @since 1.41.0
	 */
	ODataModel.prototype.getGroupId = function () {
		return this.sGroupId;
	};

	/**
	 * Returns the meta model for this ODataModel.
	 *
	 * @returns {sap.ui.model.odata.v4.ODataMetaModel}
	 *   The meta model for this ODataModel
	 *
	 * @public
	 * @see sap.ui.model.Model#getMetaModel
	 * @since 1.37.0
	 */
	// @override
	ODataModel.prototype.getMetaModel = function () {
		return this.oMetaModel;
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#getObject
	 * @since 1.37.0
	 */
	// @override
	ODataModel.prototype.getObject = function () {
		throw new Error("Unsupported operation: v4.ODataModel#getObject");
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#getOriginalProperty
	 * @since 1.37.0
	 */
	// @override
	ODataModel.prototype.getOriginalProperty = function () {
		throw new Error("Unsupported operation: v4.ODataModel#getOriginalProperty");
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#getProperty
	 * @since 1.37.0
	 */
	ODataModel.prototype.getProperty = function () {
		throw new Error("Unsupported operation: v4.ODataModel#getProperty");
	};

	/**
	 * Returns the model's update group ID.
	 *
	 * @returns {string}
	 *   The update group ID
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.ODataModel#constructor
	 * @since 1.41.0
	 */
	ODataModel.prototype.getUpdateGroupId = function () {
		return this.sUpdateGroupId;
	};

	/**
	 * Returns <code>true</code> if there are pending changes, meaning updates or created entities
	 * (see {@link sap.ui.model.odata.v4.ODataListBinding#create}) that have not yet been
	 * successfully sent to the server.
	 *
	 * @returns {boolean}
	 *   <code>true</code> if there are pending changes
	 *
	 * @public
	 * @since 1.39.0
	 */
	ODataModel.prototype.hasPendingChanges = function () {
		return this.oRequestor.hasPendingChanges();
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @private
	 * @see sap.ui.model.Model#isList
	 */
	ODataModel.prototype.isList = function () {
		throw new Error("Unsupported operation: v4.ODataModel#isList");
	};

	/**
	 * Refreshes the model by calling refresh on all bindings which have a change event handler
	 * attached.
	 *
	 * Note: When calling {@link #refresh} multiple times, the result of the request triggered by
	 * the last call determines the model's data; it is <b>independent</b> of the order of calls to
	 * {@link #submitBatch} with the given group ID.
	 *
	 * If there are pending changes, an error is thrown. Use {@link #hasPendingChanges} to check if
	 * there are pending changes. If there are changes, call {@link #submitBatch} to submit the
	 * changes or {@link #resetChanges} to reset the changes before calling {@link #refresh}.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID to be used for refresh; valid values are <code>undefined</code>,
	 *   '$auto', '$direct' or application group IDs as specified in {@link #submitBatch}
	 * @throws {Error}
	 *   If the given group ID is invalid or if there are pending changes, see
	 *   {@link #hasPendingChanges}
	 *
	 * @public
	 * @see sap.ui.model.Model#refresh
	 * @see sap.ui.model.odata.v4.ODataContextBinding#refresh
	 * @see sap.ui.model.odata.v4.ODataListBinding#refresh
	 * @see sap.ui.model.odata.v4.ODataPropertyBinding#refresh
	 * @since 1.37.0
	 */
	// @override
	ODataModel.prototype.refresh = function (sGroupId) {
		_ODataHelper.checkGroupId(sGroupId);

		this.aBindings.slice().forEach(function (oBinding) {
			if (_ODataHelper.isRefreshable(oBinding)) {
				oBinding.refresh(sGroupId);
			}
		});
	};

	/**
	 * Reports a technical error by adding a message to the MessageManager and logging the error to
	 * the console. Takes care that the error is only added once to the MessageManager.
	 * Errors caused by cancellation of backend requests are not reported but just logged to the
	 * console with level DEBUG.
	 *
	 * @param {string} sLogMessage
	 *   The message to write to the console log
	 * @param {string} sReportingClassName
	 *   The name of the class reporting the error
	 * @param {Error} oError
	 *   The error
	 *
	 * @private
	 */
	ODataModel.prototype.reportError = function (sLogMessage, sReportingClassName, oError) {
		var sDetails = oError.stack || oError.message;

		if (sDetails.indexOf(oError.message) < 0) {
			sDetails = oError.message + "\n" + oError.stack;
		}

		if (oError.canceled) {
			jQuery.sap.log.debug(sLogMessage, sDetails, sReportingClassName);
			return;
		}

		jQuery.sap.log.error(sLogMessage, sDetails, sReportingClassName);
		if (oError.$reported) {
			return;
		}
		oError.$reported = true;
		sap.ui.getCore().getMessageManager().addMessages(new Message({
			message : oError.message,
			processor : this,
			technical : true,
			type : "Error"
		}));
	};

	/**
	 * Returns a promise for the "canonical path" of the entity for the given context.
	 * According to "4.3.1 Canonical URL" of the specification "OData Version 4.0 Part 2: URL
	 * Conventions", this is the "name of the entity set associated with the entity followed by the
	 * key predicate identifying the entity within the collection".
	 * Use the canonical path in {@link sap.ui.core.Element#bindElement} to create an element
	 * binding.
	 *
	 * @param {sap.ui.model.odata.v4.Context} oEntityContext
	 *   A context in this model which must point to a non-contained OData entity
	 * @returns {Promise}
	 *   A promise which is resolved with the canonical path (e.g. "/EMPLOYEES(ID='1')") in case of
	 *   success, or rejected with an instance of <code>Error</code> in case of failure, e.g. when
	 *   the given context does not point to an entity
	 *
	 * @deprecated since 1.39.0
	 *   Use {@link sap.ui.model.odata.v4.Context#requestCanonicalPath} instead.
	 * @public
	 * @since 1.37.0
	 */
	ODataModel.prototype.requestCanonicalPath = function (oEntityContext) {
		jQuery.sap.assert(oEntityContext.getModel() === this,
				"oEntityContext must belong to this model");
		return oEntityContext.requestCanonicalPath();
	};

	/**
	 * Resets all property changes and created entities associated with the given group ID which
	 * have not been successfully submitted via {@link #submitBatch}. This function does not reset
	 * the deletion of entities (see {@link sap.ui.model.odata.v4.Context#delete}) and the execution
	 * of OData operations (see {@link sap.ui.model.odata.v4.ODataContextBinding#execute}).
	 *
	 * @param {string} [sGroupId]
	 *   The application group ID, which is a non-empty string consisting of alphanumeric
	 *   characters from the basic Latin alphabet, including the underscore. If it is
	 *   <code>undefined</code>, the model's <code>updateGroupId</code> is used. Note that the
	 *   default <code>updateGroupId</code> is '$auto', which is invalid here.
	 * @throws {Error}
	 *   If the given group ID is not an application group ID or if change requests for the given
	 *   group ID are running.
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.ODataModel#constructor.
	 * @since 1.39.0
	 */
	ODataModel.prototype.resetChanges = function (sGroupId) {
		sGroupId = sGroupId || this.sUpdateGroupId;
		_ODataHelper.checkGroupId(sGroupId, true);

		this.oRequestor.cancelChanges(sGroupId);
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Model#setLegacySyntax
	 * @since 1.37.0
	 */
	// @override
	ODataModel.prototype.setLegacySyntax = function () {
		throw new Error("Unsupported operation: v4.ODataModel#setLegacySyntax");
	};

	/**
	 * Submits the requests associated with the given application group ID in one batch request.
	 *
	 * @param {string} sGroupId
	 *   The application group ID, which is a non-empty string consisting of alphanumeric
	 *   characters from the basic Latin alphabet, including the underscore.
	 * @returns {Promise}
	 *   A promise on the outcome of the HTTP request resolving with <code>undefined</code>; it is
	 *   rejected with an error if the batch request itself fails
	 * @throws {Error}
	 *   If the given group ID is not an application group ID
	 *
	 * @public
	 * @since 1.37.0
	 */
	ODataModel.prototype.submitBatch = function (sGroupId) {
		_ODataHelper.checkGroupId(sGroupId, true);

		return this._submitBatch(sGroupId);
	};

	/**
	 * Returns a string representation of this object including the service URL.
	 *
	 * @return {string} A string description of this model
	 * @public
	 * @since 1.37.0
	 */
	ODataModel.prototype.toString = function () {
		return sClassName + ": " + this.sServiceUrl;
	};

	return ODataModel;
}, /* bExport= */ true);
