define([
	"skylark-langx-numerics/Vector2",
	"skylark-widgets-base/dnd/DragBuffer",

	"skylark-widgets-base/Widget",
	"skylark-widgets-base/panels/Panel",
	"./tabs",
	"./TabElement",
	"./TabButton"

],function(
	Vector2,
	DragBuffer,
	Widget,
	Panel,
	TabElement,
	TabButton
){
	"use strict";

	/**
	 * A tab group contains and manages tab elements.
	 *
	 * The group is also responsible for creating and managing the lifecycle of its tab elements.
	 * 
	 * @class TabGroup
	 * @extends {Widget}
	 * @param {Widget} parent Parent element.
	 */

	 var TabGroup = Widget.inherit({
	 	"klassName" : "TabGroup",

		"_construct" : function (parent, placement)
		{
			Widget.prototype._construct.call(this, parent, "div");

			var self = this;

			var skin = this.getSkin();

			this._elm.style.overflow = "visible";
			//this._elm.style.backgroundColor = Editor.theme.panelColor;
			this._elm.style.backgroundColor = skin.panelColor;

			this.preventDragEvents();
			
			// Buttons
			this.buttons = new Panel(this);
			//this.buttons.element.style.backgroundColor = Editor.theme.barColor;
			this.buttons.element.style.backgroundColor = skin.barColor;
			this.buttons.element.ondrop = function(event)
			{
				event.preventDefault();

				var uuid = event.dataTransfer.getData("uuid");
				var tab = DragBuffer.get(uuid);

				if(tab instanceof TabElement)
				{
					self.attachTab(tab);
					DragBuffer.pop(uuid);
				}
			};

			// Tab
			this.tab = new Panel(this);

			/**
			 * Panel used to display a message indicating that the tab is empty.
			 *
			 * @property empty
			 * @type {Widget}
			 */
			this.empty = document.createElement("div");
			this.empty.style.position = "absolute";
			this.empty.style.textAlign = "center";
			this.empty.style.display = "none";
			this.empty.style.width = "100%";
			this.empty.style.height = "100%";
			this.empty.style.flexDirection = "column";
			this.empty.style.justifyContent = "center";
			this.empty.style.pointerEvents = "none";
			this.empty.appendChild(document.createTextNode(Locale.openTabToEditContent));
			this._elm.appendChild(this.empty);

			/**
			 * Tab that is currently selected.
			 *
			 * @property selected
			 * @type {TabElement}
			 */
			this.selected = null;
			
			/**
			 * Base size of the buttons in this group.
			 * 
			 * Size may be ajusted to fit the available space.
			 *
			 * @property buttonSize
			 * @type {Vector2}
			 */
			this.buttonSize = new Vector2(150, 22);

			/**
			 * Tab buttons placement.
			 *
			 * @property placement
			 * @type {number}
			 */
			this.placement = placement !== undefined ? placement : TabGroup.TOP;
			this.setPlacement(this.placement);

			/**
			 * Tab elements attache to this group.
			 * 
			 * @type {Array}
			 */
			this.items = [];

			/**
			 * Indicates if the tab is currently on focus.
			 *
			 * @property focused
			 * @type {boolean}
			 */
			this.focused = false;

			this._elm.onmouseenter = function()
			{
				self.focused = true;
			};
			this._elm.onmouseleave = function()
			{
				self.focused = false;
			};
		},

		/**
		 * Update all tabs object data.
		 *
		 * @method updateMetadata
		 */
		updateMetadata : function(){
			for(var i = 0; i < this.items.length; i++)
			{
				this.items[i].updateMetadata();
			}
		},

		/**
		 * Update all tab object views.
		 *
		 * @method updateMetadata
		 */
		updateObjectsView : function(){
			for(var i = 0; i < this.items.length; i++)
			{
				this.items[i].updateObjectsView();
			}
		},

		/**
		 * Attach tab to this group and remove it from the original group.
		 *
		 * @method attachTab
		 * @param {TabElement} tab Tab to be moved.
		 * @param {number} insertIndex Index where to place the tab.
		 */
		attachTab : function(tab, insertIndex){	
			// Remove from old group
			tab.container.removeTab(tab.index, true);
			
			// Attach to this group
			tab.container = this;
			tab.button.attachTo(this.buttons);
			tab.attachTo(this.tab);
			
			// Add to items
			if(insertIndex !== undefined){
				tab.index = insertIndex;
				this.items.splice(insertIndex, 0, tab);
			}else{
				tab.index = this.items.length;
				this.items.push(tab);
			}

			// Select the tab if none selected
			if(this.selected === null)	{
				this.selectTab(tab);
			}
			
			this.updateItemIndex();
			this.updateInterface();

			return tab;
		},

		/**
		 * Move tab from position to another.
		 *
		 * @method moveTabIndex
		 * @param {number} origin Origin index.
		 * @param {number} destination Destination index.
		 */
		moveTabIndex : function(origin, destination)	{
			var button = this.items[origin];

			this.items.splice(origin, 1);
			this.items.splice(destination, 0, button);

			this.updateItemIndex();
			this.updateInterface();
		},

		updateSelection : function()	{
			for(var i = 0; i < this.items.length; i++)
			{
				this.items[i].updateSelection();
			}
		},

		updateSettings : function()	{
			for(var i = 0; i < this.items.length; i++)
			{
				this.items[i].updateSettings();
			}
		},

		/**
		 * Get the currently active tab of the group.
		 *
		 * @method getActiveTab
		 */
		getActiveTab : function(){
			if(this.selected !== null)
			{
				return this.selected;
			}

			return null;
		},

		/**
		 * Close actual tab if its closeable.
		 *
		 * @method closeActual
		 */
		closeActual : function()	{
			if(this.selected !== null && this.selected.closeable)
			{
				this.selected.deactivate();
				this.removeTab(this.selected);
			}
		},

		/** 
		 * Select tab to set active on this group.
		 *
		 * If not valid tab is selected the actual selection will be cleared.
		 *
		 * @method selectTab
		 * @param {TabElement} tab TabElement to be selected or index in the tab array.
		 */
		selectTab : function(tab){
			if(this.selected !== null)
			{
				this.selected.deactivate();
			}

			// Tab as a TabElement object
			if(tab instanceof TabElement)
			{
				this.selected = tab;
				this.selected.activate();
			}
			// Tab as a index
			else if(typeof tab === "number" && tab > -1 && tab < this.items.length)
			{
				this.selected = this.items[tab];
				this.selected.activate();
			}
			else
			{
				this.selected = null;
			}

			this.empty.style.display = this.selected === null ? "flex" : "none";
			this.updateInterface();
		},

		/**
		 * Select next tab.
		 *
		 * @method selectNextTab
		 */
		selectNextTab : function(){
			if(this.items.length > 0)
			{
				this.selectTab((this.selected.index + 1) % this.items.length);
			}
		},

		/**
		 * Select previous tab.
		 *
		 * @method selectPreviousTab
		 */
		selectPreviousTab : function(){
			if(this.items.length > 0)
			{
				if(this.selected.index === 0)
				{
					this.selectTab(this.items.length - 1);
				}
				else
				{
					this.selectTab(this.selected.index - 1);
				}
			}
		},

		/**
		 * Add new option to tab group.
		 *
		 * @method addtab
		 */
		addTab : function(TabConstructor, closeable)	{
			var tab = new TabConstructor(this.tab, closeable, this, this.items.length);
			tab.button = new TabButton(this.buttons, tab);
			this.items.push(tab);
			
			if(this.selected === null || this.items.length === 1)
			{
				this.selectTab(tab);
			}
			else
			{
				this.updateInterface();
			}

			return tab;
		},

		/**
		 * Get tab from tab type and attached object is there is any.
		 *
		 * @method getTab
		 * @param {Constructor} type Type of tab to look for.
		 * @param {Object} object Object attached to the tab.
		 */
		getTab : function(type, object){
			for(var i = 0; i < this.items.length; i++)
			{
				if(this.items[i] instanceof type)
				{
					if(object === undefined || this.items[i].isAttached(object))
					{
						return this.items[i];
					}
				}
			}

			return null;
		},

		/**
		 * Remove tab from group.
		 *
		 * @method removeTab
		 * @param {number} index Index of tab to look for.
		 * @param {boolean} dontDestroy If true the element is not destroyed.
		 */
		removeTab : function(index, dontDestroy)	{	
			// If index is an object get the actual index
			if(typeof index === "object"){
				index = this.items.indexOf(index);
			}

			// Check if the index is in range
			if(index > -1 && index < this.items.length){
				var tab = this.items[index];

				if(dontDestroy !== true)
				{
					tab.destroy();
				}

				this.items.splice(index, 1);
				this.updateItemIndex();

				// Select option
				if(this.selected === tab)
				{
					if(this.items.length > 0)
					{
						this.selectTab(index !== 0 ? index - 1 : 0);
					}
					else
					{
						this.selectTab(null);
					}
				}
				else 
				{
					this.selectTab(null);
				}

				return tab;
			}

			return null;
		},

		/**
		 * Remove all closable tabs from the group.
		 *
		 * @method clear
		 * @param {boolean} forceAll Remove also the not closable tabs.
		 */
		clear : function(forceAll){
			if(forceAll === true)
			{
				while(this.items.length > 0)
				{
					this.items.pop().destroy();
				}

				this.selectTab(null);
			}
			else
			{
				var i = 0;
				while(i < this.items.length)
				{
					if(this.items[i].closeable)
					{
						this.items[i].destroy();
						this.items.splice(i, 1);
					}
					else
					{
						i++;
					}
				}

				// Check is selected tab is still available
				var index = this.items.indexOf(this.selected);
				if(index === -1 && this.items.length > 0)
				{
					this.selectTab(0);
				}
			}
		},

		/**
		 * Update index variable stored in the tabs.
		 *
		 * @method updateItemIndex
		 */
		updateItemIndex : function(){
			for(var i = 0; i < this.items.length; i++)
			{
				this.items[i].index = i;
			}
		},

		/**
		 * Set the tab group buttons placement.
		 *
		 * @method setPlacement
		 * @param {number} placement
		 */
		setPlacement : function(placement){
			this.placement = placement;
		},

		updateSize : function(){
			Widget.prototype.updateSize.call(this);

			var tabSize = this.size.clone();
			var buttonSize = this.buttonSize.clone();
			var offset = this.buttonSize.clone();

			// Calculate size of the buttons and offset
			if(this.placement === TabGroup.TOP || this.placement === TabGroup.BOTTOM)
			{
				if(buttonSize.x * this.items.length > this.size.x)
				{
					buttonSize.x = this.size.x / this.items.length;
					offset.x = buttonSize.x;
				}
				tabSize.y -= this.buttonSize.y;
				offset.y = 0;
			}
			else if(this.placement === TabGroup.LEFT || this.placement === TabGroup.RIGHT)
			{
				if(buttonSize.y * this.items.length > this.size.y)
				{
					buttonSize.y = this.size.y / this.items.length;
					offset.y = buttonSize.y;
				}
				tabSize.x -= this.buttonSize.x;
				offset.x = 0;
			}
			
			// Update tab and buttons
			for(var i = 0; i < this.items.length; i++)
			{
				var tab = this.items[i];
				tab.visible = this.selected === tab;
				tab.size.copy(tabSize);
				tab.updateInterface();

				var button = tab.button;
				button.size.copy(buttonSize);
				button.position.copy(offset);
				button.position.multiplyScalar(i);
				button.updateInterface();
			}

			this.tab.size.copy(tabSize);
			this.tab.updateSize();

			// Position buttons and tab division
			if(this.placement === TabGroup.TOP)
			{	
				this.buttons.position.set(0, 0);
				this.buttons.updatePosition();
				this.buttons.size.set(this.size.x, this.buttonSize.y);
				this.buttons.updateSize();

				this.tab.position.set(0, this.buttonSize.y);
				this.tab.updatePosition();
			}
			else if(this.placement === TabGroup.BOTTOM)
			{
				this.buttons.position.set(0, this.size.y - this.buttonSize.y);
				this.buttons.updatePosition();
				this.buttons.size.set(this.size.x, this.buttonSize.y);
				this.buttons.updateSize();

				this.tab.position.set(0, 0);
				this.tab.updatePosition();
			}
			else if(this.placement === TabGroup.LEFT)
			{
				this.buttons.position.set(0, 0);
				this.buttons.updatePosition();
				this.buttons.size.set(this.buttonSize.x, this.size.y);
				this.buttons.updateSize();
				
				this.tab.position.set(this.buttonSize.x, 0);
				this.tab.updatePosition();
			}
			else if(this.placement === TabGroup.RIGHT)
			{
				this.buttons.position.set(this.size.x - this.buttonSize.x, 0);
				this.buttons.updatePosition();
				this.buttons.size.set(this.buttonSize.x, this.size.y);
				this.buttons.updateSize();

				this.tab.position.set(0, 0);
				this.tab.updatePosition();
			}
		}
	 });



	TabGroup.TOP = 0;
	TabGroup.BOTTOM = 1;
	TabGroup.LEFT = 2;
	TabGroup.RIGHT = 3;


	return tabs.TabGroup = TabGroup;

});