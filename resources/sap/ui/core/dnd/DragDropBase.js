/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides the base class class for all drag and drop configurations.
sap.ui.define(['../Element', '../library', './DragAndDrop'],
	function(Element, library /*, DragAndDrop */) {
	"use strict";

	/**
	 * Constructor for a new DragDropBase.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Provides the base class for all drag-and-drop configurations.
	 * This feature enables a native HTML5 drag-and-drop API for the controls, therefore it is limited to browser support.
	 * <h3>Limitations</h3>
	 * <ul>
	 *   <li>There is no mobile device that supports drag and drop.</li>
	 *   <li>There is no accessible alternative for drag and drop. Applications which use the drag-and-drop functionality must provide an
	 *   accessible alternative UI (for example, action buttons or menus) to perform the same operations.</li>
	 *   <li>A custom dragging ghost element is not possible in Internet Explorer.</li>
	 *   <li>Transparency of the drag ghost element depends on the browser implementation.</li>
	 *   <li>Internet Explorer does only support plain text MIME type for the DataTransfer Object.</li>
	 *   <li>Constraining a drag position is not possible, therefore there is no snap-to-grid or snap-to-element feature possible.</li>
	 *   <li>For controls which do not provide an aggregation <code>dragDropConfig</code> drag and drop might not work correctly
	 *   if they are configured as target via {@link sap.ui.core.dnd.DragDropInfo}.</li>
	 * </ul>
	 *
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @version 1.54.4
	 *
	 * @public
	 * @since 1.52
	 * @alias sap.ui.core.dnd.DragDropBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DragDropBase = Element.extend("sap.ui.core.dnd.DragDropBase", /** @lends sap.ui.core.dnd.DragDropBase.prototype */ {
		metadata : {
			"abstract" : true,
			library : "sap.ui.core"
		}
	});

	/**
	 * @abstract
	 */
	DragDropBase.prototype.isDraggable = function(oControl) {
		return false;
	};

	/**
	 * @abstract
	 */
	DragDropBase.prototype.isDroppable = function(oControl) {
		return false;
	};

	return DragDropBase;

});