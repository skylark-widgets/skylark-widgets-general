define([
	"skylark-widgets-base/panels/dual-container",
	"../tabs",
	"../tab-group"
],function(DualContainer,tabs,TabGroup){
	"use strict";

	/**
	 * Tab dual container is a dual container with tabgroups.
	 *
	 * @class TabDualContainer
	 * @extends {Element, TabDual}
	 */
	 var TabDualContainer = DualContainer.inherit({
		"_construct" : function(parent)	{
			DualContainer.prototype._construct.call(this, parent);

			this._elm.style.overflow = "visible";
		},


		/**
		 * Update all tabs object data.
		 *
		 * @method updateMetadata
		 */
		updateMetadata : function()
		{
			this._elmA.updateMetadata();
			this._elmB.updateMetadata();
		},

		/**
		 * Update all tab object views.
		 *
		 * @method updateObjectsView
		 */
		updateObjectsView : function()
		{
			this._elmA.updateObjectsView();
			this._elmB.updateObjectsView();
		},

		/**
		 * Update all tab object selection status.
		 * 
		 * Should be called after object selection changes.
		 *
		 * @method updateSelection
		 */
		updateSelection : function()
		{
			this._elmA.updateSelection();
			this._elmB.updateSelection();
		},

		/**
		 * Update all tab settings.
		 *
		 * Should be called after editor settings are changed.
		 *
		 * @method updateSettings
		 */
		updateSettings : function()
		{
			this._elmA.updateSettings();
			this._elmB.updateSettings();
		},

		/**
		 * Get an array with all the tabs currently active.
		 *
		 * @method getActiveTab
		 * @return {Array} Active tabs.
		 */
		getActiveTab : function()
		{
			var active = [];

			if(this._elmA instanceof TabGroup)
			{
				var tab = this._elmA.getActiveTab();
				if(tab !== null)
				{
					active.push(tab);
				}
			}
			else
			{
				active = active.concat(this._elmA.getActiveTab());
			}

			if(this._elmB instanceof TabGroup)
			{
				var tab = this._elmB.getActiveTab();
				if(tab !== null)
				{
					active.push(tab);
				}
				this._elmA.getActiveTab();
			}
			else
			{
				active = active.concat(this._elmB.getActiveTab());
			}

			return active;
		},

		/**
		 * Close the tab that is currently being shown if it is closeable.
		 *
		 * @method closeActual
		 */
		closeActual : function()
		{
			if(!(this._elmA instanceof TabGroup) || this._elmA.focused)
			{
				this._elmA.closeActual();
			}

			if(!(this._elmB instanceof TabGroup) || this._elmB.focused)
			{
				this._elmB.closeActual();
			}
		},

		/**
		 * Select a specific tab from the container tab tree.
		 *
		 * @method selectTab
		 * @param {TabElement} tab Tab to select.
		 */
		selectTab : function(tab)
		{
			this._elmA.selectTab(tab);
			this._elmB.selectTab(tab);
		},

		/**
		 * Select next tab from the currently focused tab group.
		 *
		 * @method selectNextTab
		 */
		selectNextTab : function()
		{
			if(!(this._elmA instanceof TabGroup) || this._elmA.focused)
			{
				this._elmA.selectNextTab();
			}

			if(!(this._elmB instanceof TabGroup) || this._elmB.focused)
			{
				this._elmB.selectNextTab();
			}
		},

		/**
		 * Select previous tab from the currently focused tab group.
		 *
		 * @method selectPreviousTab
		 */
		selectPreviousTab : function()
		{
			if(!(this._elmA instanceof TabGroup) || this._elmA.focused)
			{
				this._elmA.selectPreviousTab();
			}

			if(!(this._elmB instanceof TabGroup) || this._elmB.focused)
			{
				this._elmB.selectPreviousTab();
			}
		},

		/**
		 * Add new option to tab group.
		 *
		 * Prefer the tab group stored on the elementA.
		 *
		 * @method addTab
		 * @param {Constructor} TabConstructor Constructor if the TabElement to be added to the container.
		 * @param {Boolean} closeable Indicates if the tab can be closed.
		 */
		addTab : function(TabConstructor, closeable)
		{
			var tab = this._elmA.addTab(TabConstructor, closeable);
			if(tab === null)
			{
				tab = this._elmB.addTab(TabConstructor, closeable);
			}

			return tab;
		},

		/**
		 * Get tab from tab type and attached object is there is any.
		 *
		 * @param {Constructor} type Type of the tab to look for.
		 * @param {Object} object Object attached to the tab.
		 * @return TabElement The tab from the type specified that has the object attached to it.
		 */
		getTab : function(type, object)
		{
			var tab = this._elmA.getTab(type, object);
			
			if(tab === null)
			{
				tab = this._elmB.getTab(type, object);
			}

			return tab;
		},

		/**
		 * Remove all tabs from the container.
		 * 
		 * @method clear
		 */
		clear : function(forceAll)
		{
			this._elmA.clear(forceAll);
			this._elmB.clear(forceAll);
		}

	 });


	return tabs.splittable.TabDualContainer = TabDualContainer;
});