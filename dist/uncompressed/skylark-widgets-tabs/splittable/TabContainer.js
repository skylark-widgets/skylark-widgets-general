define([
	"skylark-widgets-base/panels/Panel",
	"../tabs",
	"../TabGroup"
],function(
	Panel,
	tabs,
	TabGroup
){
	"use strict";

	/**
	 * Tab container is the root for a tree of tab groups.
	 *
	 * The container keeps track of all groups that may be splited into multiple groups.
	 *
	 * @class TabContainer
	 * @extends {Panel}
	 */
	var TabContainer = Panel.inherit({
		"klassName" : "TabContainer",

		"_construct" :  function(parent){
			Panel.prototype._construct.call(this, parent);
			
			this.group = null;
		},


		/**
		 * Split this tab group into two new tab groups.
		 *
		 * @method split
		 * @param {Number} direction Direction where to insert the new tab.
		 * @return {TabGroupSplit} The new created tab group.
		 */
		split : function(direction)
		{
			return this.group.split(direction);
		},

		attach : function(element)
		{
			this.group = element;
			this.group.setParent(this);
		},

		updateSize : function()
		{
			Panel.prototype.updateSize.call(this);

			if(this.group !== null)
			{
				this.group.position.set(0, 0);
				this.group.size.copy(this.size);
				this.group.updateInterface();
			}
		},

		/**
		 * Update all tabs object data.
		 *
		 * @method updateMetadata
		 */
		updateMetadata : function()
		{
			this.group.updateMetadata();
		},

		/**
		 * Update all tab object views.
		 *
		 * @method updateObjectsView
		 */
		updateObjectsView : function()
		{
			this.group.updateObjectsView();
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
			this.group.updateSelection();
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
			this.group.updateSettings();
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

			if(this.group instanceof TabGroup)
			{
				var tab = this.group.getActiveTab();
				if(tab !== null)
				{
					active.push(tab);
				}
			}
			else
			{
				active = active.concat(this.group.getActiveTab());
			}

			return this.group.getActiveTab();
		},

		/**
		 * Close the tab that is currently being shown if it is closeable.
		 *
		 * @method closeActual
		 */
		closeActual : function()
		{
			this.group.closeActual();
		},

		/**
		 * Select a specific tab from the container tab tree.
		 *
		 * @method selectTab
		 * @param {TabElement} tab Tab to select.
		 */
		selectTab : function(tab)
		{
			this.group.selectTab(tab);
		},

		/**
		 * Select next tab from the currently focused tab group.
		 *
		 * @method selectNextTab
		 */
		selectNextTab : function()
		{
			this.group.selectNextTab();
		},

		/**
		 * Select previous tab from the currently focused tab group.
		 *
		 * @method selectPreviousTab
		 */
		selectPreviousTab : function()
		{
			this.group.selectPreviousTab();
		},

		/**
		 * Add new tab to the tab container.
		 * 
		 * @method addTab
		 * @param {Constructor} TabConstructor Constructor if the TabElement to be added to the container.
		 * @param {Boolean} closeable Indicates if the tab can be closed.
		 */
		addTab : function(TabConstructor, closeable)
		{
			return this.group.addTab(TabConstructor, closeable);
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
			return this.group.getTab(type, object);
		},

		/**
		 * Remove all tabs from the container.
		 * 
		 * @method clear
		 */
		clear : function(forceAll)
		{
			this.group.clear();
		}
	});


	return tabs.splittable.TabContainer = TabContainer;
});