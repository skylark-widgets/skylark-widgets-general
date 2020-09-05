/**
 * skylark-widgets-tabs - The skylark tabs widgets library
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-widgets/skylark-widgets-tabs/
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx-ns");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('skylark-widgets-tabs/tabs',[
	"skylark-langx/skylark"
],function(skylark){
	return skylark.attach("widgets.tabs",{
		splittable : {
			
		}
	});
});
define('skylark-widgets-tabs/TabButton',[
	"skylark-devices-points/mouse",
	"skylark-widgets-base/Widget",
	"./tabs"
],function(
	mouse,
	Widget, 
	tabs
){

	"use strict";

	/**
	 * Tab button is used to navigate trough tabs.
	 *
	 * @class TabButton
	 * @extends {Widget}
	 * @param {Widget} parent
	 * @param {TabWidget} tab
	 */
	 var TabButton = Widget.inherit({
	 	"klassName" : "TabButton",

		"_construct" : function(parent, tab) {
			Widget.prototype._construct.call(this, parent, "div");

			var self = this;

			this._elm.draggable = true;
			this._elm.style.cursor = "pointer";
			this._elm.style.boxSizing = "border-box";

			var skin = this.getSkin();

			//this._elm.style.backgroundColor = Editor.theme.buttonColor;
			this._elm.style.backgroundColor = skin.buttonColor;

			/**
			 * Pointer to the tab element related with this button.
			 *
			 * @property tab
			 * @type {TabWidget}
			 */
			this.tab = tab;

			//Icon
			this.icon = document.createWidget("img");
			this.icon.style.pointerEvents = "none";
			this.icon.style.position = "absolute";
			this.icon.src = tab.icon;
			this._elm.appendChild(this.icon);

			//Text
			this.text = document.createWidget("div");
			this.text.style.position = "absolute";
			this.text.style.overflow = "hidden";
			this.text.style.textAlign = "center";
			this.text.style.pointerEvents = "none";
			this.text.style.textOverflow = "ellipsis";
			this.text.style.whiteSpace = "nowrap";

			//this.text.style.color = Editor.theme.textColor;
			this.text.style.color = skin.textColor;

			this._elm.appendChild(this.text);

			//Title
			this.title = document.createTextNode(tab.title);
			this.text.appendChild(this.title);

			//Close button
			this.close = document.createWidget("img");
			this.close.draggable = false;
			this.close.style.position = "absolute";
			this.close.style.opacity = 0.5;
			this.close.style.display = (tab.closeable) ? "block" : "none";
			
			//this.close.src = Global.FILE_PATH + "icons/misc/close.png";
			this.close.src = skin.closeIconUrl;
			
			this._elm.appendChild(this.close);

			this.close.onmouseenter = function(){
				this.style.opacity = 1.0;
			};

			this.close.onmouseleave = function(){
				this.style.opacity = 0.5;
			};

			this.close.onclick = function()	{
				self.tab.close();
			};


			//Drag state
			var dragState = TabButton.NONE;

			//Drag control
			this._elm.ondragstart = function(event) {
				event.dataTransfer.setData("tab", self.tab.index);
				dragState = TabButton.NONE;
			};

			//Drag drop
			this._elm.ondrop = function(event) {
				event.preventDefault();
				this.style.borderLeft = null;
				this.style.borderRight = null;
				this.style.borderBottom = null;
				this.style.borderTop = null;

				var index = event.dataTransfer.getData("tab");
				if(index !== "") {
					index = parseInt(index);

					if(index !== self.tab.index) {	
						//Before
						if(dragState === TabButton.PREVIOUS) {
							self.tab.container.moveTabIndex(index, index < self.tab.index ? self.tab.index - 1 : self.tab.index);
						}
						//After
						else if(dragState === TabButton.NEXT){
							self.tab.container.moveTabIndex(index, index < self.tab.index ? self.tab.index : self.tab.index + 1);
						}
					}
				}
			};

			//Drag over
			this._elm.ondragover = function(event)
			{
				if(self.tab.container.placement === TabGroup.TOP || self.tab.container.placement === TabGroup.BOTTOM)
				{
					if(event.layerX > self.size.x * 0.8 || event.target !== this)
					{
						if(dragState !== TabButton.NEXT)
						{
							dragState = TabButton.NEXT;
							this.style.borderLeft = null;
							this.style.borderRight = "thick solid #999999";
						}
					}
					else if(event.layerX < self.size.x * 0.2)
					{
						if(dragState !== TabButton.PREVIOUS)
						{
							dragState = TabButton.PREVIOUS;
							this.style.borderRight = null;
							this.style.borderLeft = "thick solid #999999";
						}
					}
					else
					{
						if(dragState !== TabButton.NONE	)
						{
							dragState = TabButton.NONE;
							this.style.borderLeft = null;
							this.style.borderRight = null;
						}
					}
				}
				else
				{
					if(event.layerY > self.size.y * 0.7 || event.target !== this)
					{
						if(dragState !== TabButton.NEXT)
						{
							dragState = TabButton.NEXT;
							this.style.borderTop = null;
							this.style.borderBottom = "solid #999999";
						}
					}
					else if(event.layerY < self.size.y * 0.3)
					{
						if(dragState !== TabButton.PREVIOUS)
						{
							dragState = TabButton.PREVIOUS;
							this.style.borderBottom = null;
							this.style.borderTop = "solid #999999";
						}
					}
					else
					{
						if(dragState !== TabButton.NONE	)
						{
							dragState = TabButton.NONE;
							this.style.borderBottom = null;
							this.style.borderTop = null;
						}
					}
				}
			};

			//Drag end
			this._elm.ondragend = function(event){
				event.preventDefault();
				
				dragState = TabButton.NONE;
				this.style.borderLeft = null;
				this.style.borderRight = null;
				this.style.borderBottom = null;
				this.style.borderTop = null;
			};

			//Drag leave
			this._elm.ondragleave = function(event)	{
				event.preventDefault();
				
				dragState = TabButton.NONE;
				this.style.borderLeft = null;
				this.style.borderRight = null;
				this.style.borderBottom = null;
				this.style.borderTop = null;
			};

			this._elm.onmousedown = function(event)	{
				var button = event.which - 1;

				//Select tab
				//if(button === Mouse.LEFT)
				if(mouse.isLeftMouseButton(event))
				{
					self.tab.container.selectTab(self.tab);
				}
				//Close tab
				//else if(tab.closeable && button === Mouse.MIDDLE)
				else if(tab.closeable && mouse.isMiddleMouseButton(event))
				{
					self.tab.container.removeTab(self.tab);
				}
			};

			this._elm.onmouseenter = function()	{
				//this.style.backgroundColor = Editor.theme.buttonOverColor;
				this.style.backgroundColor = skin.buttonOverColor;
			};

			this._elm.onmouseleave = function()
			{
				if(tab.isSelected()){
					//this.style.backgroundColor = Editor.theme.buttonOverColor;
					this.style.backgroundColor = skin.buttonOverColor;
				}else{
					//this.style.backgroundColor = Editor.theme.buttonColor;
					this.style.backgroundColor = skin.buttonColor;
				}
			};
		},

		/**
		 * Set the tab icon image.
		 *
		 * @method setIcon
		 * @param {String} icon URL of the icon image.
		 */
		setIcon : function(icon) {
			this.tab.icon = icon;
			this.icon.src = icon;
		},

		/**
		 * Set text to be displayed in the button as its name.
		 *
		 * @method setName
		 * @param {String} text
		 */
		setName : function(text) {
			this.tab.title = text;
			this.title.data = text;
		},

		//Update selected state of the button
		updateSelection : function() {
			//this._elm.style.backgroundColor = this.tab.isSelected() ? Editor.theme.buttonOverColor : Editor.theme.buttonColor;
			var skin = this.getSkin();
			this._elm.style.backgroundColor = this.tab.isSelected() ? skin.buttonOverColor : skin.buttonColor;
		},

		updateSize : function() {
			Widget.prototype.updateSize.call(this);
			
			//Icon
			this.icon.style.top = (this.size.y * 0.2) + "px";
			this.icon.style.left = (this.size.y * 0.2) + "px"
			this.icon.style.width = (this.size.y * 0.6) + "px";
			this.icon.style.height = (this.size.y * 0.6) + "px";

			//Text
			this.text.style.left = this.size.y + "px";
			this.text.style.top = ((this.size.y - 12) / 2) + "px";
			this.text.style.width = (this.size.x - 2 * this.size.y) + "px";
			this.text.style.height = this.size.y + "px";

			//Close
			if(this.tab.closeable === true) {
				this.close.style.width = (this.size.y * 0.4) + "px";
				this.close.style.height = (this.size.y * 0.4) + "px";
				this.close.style.top = (this.size.y * 0.3) + "px";
				this.close.style.right = (this.size.y * 0.3) + "px";
				this.close.style.display = "block";
			} else 	{
				this.close.style.display = "none";
			}

			this.updateSelection();
		}

	 });


	TabButton.NONE = 0;
	TabButton.PREVIOUS = 1;
	TabButton.NEXT = 2;


	return tabs.TabButton = TabButton;
});
define('skylark-widgets-tabs/TabElement',[
	"skylark-langx-strings",
	"skylark-widgets-base/Widget",
	"./tabs"
],function(
	strings,
	Widget,
	tabs
){
	"use strict";

	/**
	 * Tab element is used to create tabbed elements.
	 *
	 * These are used to implement the main components of the interface (editors, menus, etc).
	 *
	 * @class TabElement
	 * @extends {Widget}
	 * @param {Widget} parent Parent element.
	 * @param {Boolean} closeable If false the tab cannot be closed.
	 * @param {TabContainer} container Container for this tab.
	 * @param {Number} index Index of the tab.
	 * @param {String} title Title of the tab.
	 * @param {String} icon Icon of the tab.
	 */

	var TabElement = Widget.inherit({
		"klassName" : "TabElement",

		"_construct" : function (parent, closeable, container, index, title, icon){
			Widget.prototype._construct.call(this, parent, "div");

			var self = this;

			var skin = this.getSkin();

			this._elm.style.overflow = "visible";
			//this._elm.style.backgroundColor = Editor.theme.panelColor;
			this._elm.style.backgroundColor = skin.panelColor;
			this.preventDragEvents();

			/**
			 * Pointer to the group where this tab is.
			 *
			 * @property container
			 * @type {TabGroup}
			 */
			this.container = container;

			/**
			 * UUID of this tab.
			 *
			 * @property uuid
			 * @type {String}
			 */
			this.uuid = strings.generateUUID();

			/**
			 * Index of the tab inside of the container
			 *
			 * @property index
			 * @type {Number}
			 */
			this.index = index;

			/**
			 * Pointer to the button associated with this tab.
			 *
			 * @property container
			 * @type {TabButton}
			 */
			this.button = null;

			//Meta
			this.closeable = closeable;
			this.title = title;
			this.icon = icon;

			/**
			 * Indicates if the tab is currently active (on display).
			 *
			 * @property active
			 * @type {Boolean}
			 */
			this.active = false;
		},


		/**
		 * Update tab metadata (name, icon, ...)
		 * 
		 * Called after applying changes to object.
		 * 
		 * Called for every tab.
		 *
		 * @method updateMetadata
		 */
		updateMetadata : function(){

		},

		/**
		 * Update tab settings.
		 * 
		 * Called after settings of the editor are changed.
		 * 
		 * Called for every tab.
		 *
		 * @method updateSettings
		 */
		updateSettings : function(){

		},

		/**
		 * Update tab values of the gui for the object attached.
		 * 
		 * Called when properties of objects are changed.
		 * 
		 * Called only for active tabs.
		 *
		 * @method updateValues
		 */
		updateValues : function(){

		},

		/**
		 * Update tab object view.
		 * 
		 * Called when objects are added, removed, etc.
		 * 
		 * Called only for active tabs.
		 *
		 * @method updateObjectsView
		 */
		updateObjectsView : function(){

		},

		/**
		 * Update tab after object selection changed.
		 * 
		 * Called after a new object was selected.
		 * 
		 * Called only for active tabs.
		 *
		 * @method updateSelection
		 */
		updateSelection : function(){

		},

		/**
		 * Activate tab.
		 * 
		 * Called when a tab becomes active (visible).
		 *
		 * @method activate
		 */
		activate : function()	{
			if(this.active === true){
				this.deactivate();
			}
			
			//TODO <IF TAB NEEDS UPDATE IT SHOULD TAKE CARE OF IT>
			if(this.update !== undefined){
				var self = this;

				var update = function()
				{
					self.update();

					if(self.active === true)
					{
						requestAnimationFrame(update);
					}
				};

				requestAnimationFrame(update);
			}

			this.active = true;
		},

		/**
		 * Deactivate tab.
		 * 
		 * Called when a tab is deactivated or closed.
		 *
		 * @method deactivate
		 */
		deactivate : function(){
			this.active = false;
		},

		/**
		 * Generic method to attach object to a tab.
		 *
		 * Attached object can be edited using the tab.
		 *
		 * @method attach
		 * @param {Object} object
		 */
		attach : function(object){

		},

		/**
		 * Check if an object or resource is attached to the tab.
		 * 
		 * Called to check if a tab needs to be closed after changes to objects.
		 *
		 * @method isAttached
		 */
		isAttached : function(object)	{
			return false;
		},

		/**
		 * Close the tab element and remove is from the container.
		 * 
		 * @method close
		 */
		close : function()	{
			this.container.removeTab(this);
		},

		/**
		 * Select this tab.
		 * 
		 * @method select
		 */
		select : function(){
			this.container.selectTab(this);
		},

		/**
		 * Check if tab is selected
		 *
		 * @method isSelected
		 * @return {Boolean} True if the tab is selected in the container.
		 */
		isSelected : function(){
			return this === this.container.selected;
		},

		/**
		 * Set icon of the button attached to this tab.
		 *
		 * The button should have a .setIcon(url) method.
		 *
		 * @method setIcon
		 * @param {String} icon URL of the icon.
		 */
		setIcon : function(icon){
			this.icon = icon;
			this.button.setIcon(icon);
		},

		/**
		 * Set text in the button.
		 *
		 * The button should have a .setName(text) method.
		 *
		 * @method setName
		 * @param {String} text
		 */
		setName : function(text){
			this.title = text;
			this.button.setName(text);
		},

		destroy : function(){
			Widget.prototype.destroy.call(this);
			
			if(this.button !== null){
				this.button.destroy();
			}
		}

	});


	return tabs.TabElement = TabElement;
});
define('skylark-widgets-tabs/TabGroup',[
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
define('skylark-widgets-tabs/splittable/TabButtonSplit',[
	"skylark-devices-points/mouse",
	"skylark-widgets-base/dnd/DragBuffer",

	"skylark-widgets-base/Widget",
	"../tabs",
	"../TabElement",
	"../TabGroup"
],function(
	mouse,

	DragBuffer,
	Widget,

	tabs,
	TabElement,
	TabGroup
){
	"use strict";

	/**
	 * Tab button is used to navigate trough tabs.
	 *
	 * The split version of the tab button is intended to be used alongside splitable tab groups.
	 * 
	 * @class TabButtonSplit
	 * @extends {Widget}
	 * @param {Widget} parent
	 * @param {TabElement} tab
	 */
	 var TabButtonSplit = Widget.inherit({
	 	"klassName" : "TabButtonSplit",

		"_construct" : function (parent, tab)
		{
			Widget.prototype._construct.call(this, parent, "div");

			var self = this;

			this._elm.draggable = true;
			this._elm.style.cursor = "pointer";
			this._elm.style.boxSizing = "border-box";


			var skin = this.getSkin();
			//this._elm.style.backgroundColor = Editor.theme.buttonColor;
			this._elm.style.backgroundColor = skin.buttonColor;

			//Tab
			this.tab = tab;

			//Icon
			this.icon = document.createElement("img");
			this.icon.style.pointerEvents = "none";
			this.icon.style.position = "absolute";
			this.icon.src = tab.icon;
			this._elm.appendChild(this.icon);

			//Text
			this.text = document.createElement("div");
			this.text.style.position = "absolute";
			this.text.style.overflow = "hidden";
			this.text.style.textAlign = "center";
			this.text.style.pointerEvents = "none";
			this.text.style.textOverflow = "ellipsis";
			this.text.style.whiteSpace = "nowrap";
			this.text.style.color = Editor.theme.textColor;
			this._elm.appendChild(this.text);

			//Title
			this.title = document.createTextNode(tab.title);
			this.text.appendChild(this.title);

			//Close button
			this.close = document.createElement("img");
			this.close.draggable = false;
			this.close.style.position = "absolute";
			this.close.style.opacity = 0.5;
			this.close.style.display = (tab.closeable) ? "block" : "none";
			this.close.src = Global.FILE_PATH + "icons/misc/close.png";
			this._elm.appendChild(this.close);

			this.close.onmouseenter = function()
			{
				this.style.opacity = 1.0;
			};

			this.close.onmouseleave = function()
			{
				this.style.opacity = 0.5;
			};

			this.close.onclick = function()
			{
				self.tab.close();
			};
			
			//Drag state
			var dragState = TabButtonSplit.NONE;

			//Drag control
			this._elm.ondragstart = function(event)	{
				event.dataTransfer.setData("uuid", self.tab.uuid);
				DragBuffer.push(self.tab);

				event.dataTransfer.setData("tab", self.tab.index);
				dragState = TabButtonSplit.NONE;
			};

			//Drag drop
			this._elm.ondrop = function(event){	event.preventDefault();
				this.style.borderLeft = null;
				this.style.borderRight = null;
				this.style.borderBottom = null;
				this.style.borderTop = null;

				var uuid = event.dataTransfer.getData("uuid");
				var tab = DragBuffer.get(uuid);

				if(tab instanceof TabElement){
					//In the same container
					if(tab.container === self.tab.container){
						var index = event.dataTransfer.getData("tab");
						index = parseInt(index);

						if(index !== self.tab.index){	
							//Before
							if(dragState === TabButtonSplit.PREVIOUS)
							{
								self.tab.container.moveTabIndex(index, index < self.tab.index ? self.tab.index - 1 : self.tab.index);
							}
							//After
							else if(dragState === TabButtonSplit.NEXT)	{
								self.tab.container.moveTabIndex(index, index < self.tab.index ? self.tab.index : self.tab.index + 1);
							}
							
							DragBuffer.pop(uuid);
						}
					}
					//From another container
					else
					{
						//Before
						if(dragState === TabButtonSplit.PREVIOUS){
							self.tab.container.attachTab(tab, self.tab.index);
						}
						//After
						else if(dragState === TabButtonSplit.NEXT){
							self.tab.container.attachTab(tab, self.tab.index + 1);
						}
						
						DragBuffer.pop(uuid);
					}
				}
			};

			//Drag over
			this._elm.ondragover = function(event){
				if(self.tab.container.placement === TabGroup.TOP || self.tab.container.placement === TabGroup.BOTTOM){	
					if(event.layerX > self.size.x * 0.8 || event.target !== this)
					{
						if(dragState !== TabButtonSplit.NEXT)
						{
							dragState = TabButtonSplit.NEXT;
							this.style.borderLeft = null;
							this.style.borderRight = "thick solid #999999";
						}
					}
					else if(event.layerX < self.size.x * 0.2){
						if(dragState !== TabButtonSplit.PREVIOUS){
							dragState = TabButtonSplit.PREVIOUS;
							this.style.borderRight = null;
							this.style.borderLeft = "thick solid #999999";
						}
					}else{
						if(dragState !== TabButtonSplit.NONE){
							dragState = TabButtonSplit.NONE;
							this.style.borderLeft = null;
							this.style.borderRight = null;
						}
					}
				}else{
					if(event.layerY > self.size.y * 0.7 || event.target !== this)
					{
						if(dragState !== TabButtonSplit.NEXT)
						{
							dragState = TabButtonSplit.NEXT;
							this.style.borderTop = null;
							this.style.borderBottom = "solid #999999";
						}
					}
					else if(event.layerY < self.size.y * 0.3)
					{
						if(dragState !== TabButtonSplit.PREVIOUS)
						{
							dragState = TabButtonSplit.PREVIOUS;
							this.style.borderBottom = null;
							this.style.borderTop = "solid #999999";
						}
					}
					else
					{
						if(dragState !== TabButtonSplit.NONE)
						{
							dragState = TabButtonSplit.NONE;
							this.style.borderBottom = null;
							this.style.borderTop = null;
						}
					}
				}
			};

			//Drag end
			this._elm.ondragend = function(event)
			{
				event.preventDefault();
				
				DragBuffer.pop(self.tab.uuid);

				dragState = TabButtonSplit.NONE;
				this.style.borderLeft = null;
				this.style.borderRight = null;
				this.style.borderBottom = null;
				this.style.borderTop = null;
			};

			//Drag leave
			this._elm.ondragleave = function(event)
			{
				event.preventDefault();
				
				dragState = TabButtonSplit.NONE;
				this.style.borderLeft = null;
				this.style.borderRight = null;
				this.style.borderBottom = null;
				this.style.borderTop = null;
			};

			//Mouse down
			this._elm.onmousedown = function(event)
			{
				var button = event.which - 1;

				//Select tab
				//if(button === Mouse.LEFT)
				if (mouse.isLeftMouseButton(event))	{
					self.tab.container.selectTab(self.tab);
				}
				//Close tab
				//else if(tab.closeable && button === Mouse.MIDDLE)
				else if(tab.closeable && mouse.isMiddleMouseButton(event))
				{
					self.tab.container.removeTab(self.tab);
				}
			};

			//Mouse enter
			this._elm.onmouseenter = function()
			{
				//this.style.backgroundColor = Editor.theme.buttonOverColor;
				this.style.backgroundColor = skin.buttonOverColor;
			};

			//Mouse leave
			this._elm.onmouseleave = function()
			{
				if(tab.isSelected())
				{
					//this.style.backgroundColor = Editor.theme.buttonOverColor;
					this.style.backgroundColor = skin.buttonOverColor;
				}
				else
				{
					//this.style.backgroundColor = Editor.theme.buttonColor;
					this.style.backgroundColor = skin.buttonColor;
				}
			};
		},


		/**
		 * Set the tab icon image.
		 *
		 * @method setIcon
		 * @param {String} icon URL of the icon image.
		 */
		setIcon : function(icon) {
			this.tab.icon = icon;
			this.icon.src = icon;
		},

		/**
		 * Set text to be displayed in the button as its name.
		 *
		 * @method setName
		 * @param {String} text
		 */
		setName : function(text) {
			this.tab.title = text;
			this.title.data = text;
		},

		updateSelection : function() {
			//this._elm.style.backgroundColor = this.tab.isSelected() ? Editor.theme.buttonOverColor : Editor.theme.buttonColor;
			var skin = this.getSkin();
			this._elm.style.backgroundColor = this.tab.isSelected() ? skin.buttonOverColor : skin.buttonColor;
		},

		updateSize : function(){
			Widget.prototype.updateSize.call(this);
			
			//Icon
			this.icon.style.top = (this.size.y * 0.2) + "px";
			this.icon.style.left = (this.size.y * 0.2) + "px"
			this.icon.style.width = (this.size.y * 0.6) + "px";
			this.icon.style.height = (this.size.y * 0.6) + "px";

			//Text
			this.text.style.left = this.size.y + "px";
			this.text.style.top = ((this.size.y - 12) / 2) + "px";
			this.text.style.width = (this.size.x - 2 * this.size.y) + "px";
			this.text.style.height = this.size.y + "px";

			//Close
			if(this.tab.closeable === true)
			{
				this.close.style.width = (this.size.y * 0.4) + "px";
				this.close.style.height = (this.size.y * 0.4) + "px";
				this.close.style.top = (this.size.y * 0.3) + "px";
				this.close.style.right = (this.size.y * 0.3) + "px";
				this.close.style.display = "block";
			}
			else
			{
				this.close.style.display = "none";
			}

			this.updateSelection();
		}

	 });

	TabButtonSplit.NONE = 0;
	TabButtonSplit.PREVIOUS = 1;
	TabButtonSplit.NEXT = 2;


	return tabs.splittable.TabButtonSplit = TabButtonSplit;
});

define('skylark-widgets-tabs/splittable/TabContainer',[
	"skylark-widgets-base/Widget",
	"../tabs",
	"../TabGroup"
],function(
	Widget,
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
	 * @extends {Widget}
	 */
	var TabContainer = Widget.inherit({
		"klassName" : "TabContainer",

		"_construct" :  function(parent){
			Widget.prototype._construct.call(this, parent, "div");
			
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
			this.group.attachTo(this);
		},

		updateSize : function()
		{
			Widget.prototype.updateSize.call(this);

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
define('skylark-widgets-tabs/splittable/TabDualContainer',[
	"skylark-widgets-base/panels/DualContainer",
	"../TabGroup"
],function(DualContainer,TabGroup){
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
define('skylark-widgets-tabs/splittable/TabGroupSplit',[
	"skylark-domx-geom",
	"skylark-widgets-base/dnd/DragBuffer",

	"skylark-widgets-base/panels/DualContainer",
	"../TabGroup",
	"../TabElement",
	"./TabContainer",
	"./TabDualContainer",
	"./TabButtonSplit"
],function(
	geom, 
	DragBuffer,
	DualContainer, 
	TabGroup,
	TabElement,
	TabContainer, 
	TabDualContainer,
	TabButtonSplit
){
	"use strict";

	/**
	 * A tab group contains and manages tab elements.
	 *
	 * A splitable tab group can be splited into two tab group allowing a more flexible interface organization during runtime.
	 * 
	 * @class TabGroupSplit
	 * @extends {TabGroup}
	 * @param {Element} parent Parent element.
	 */

	var TabButtonSplit = TabGroup.inherit({
		"klassName" : "TabButtonSplit",

		"_construct" : function (parent, placement)
		{
			TabGroup.prototype._construct.call(this, parent, placement);

			var self = this;

			/**
			 * Border where another another tabs can be dragged to for this tab to be spplited.
			 *
			 * @property dragBorder
			 * @type {Number}
			 */
			this.dragBorder = 0.2;

			/**
			 * If true the group can be split in two.
			 *
			 * @property canSplit
			 * @type {Boolean}
			 */
			this.canSplit = true;

			/**
			 * If true the group can be collapsed.
			 *
			 * @property canCollapse
			 * @type {Boolean}
			 */
			this.canCollapse = true;

			/**
			 * DOM element to be displayed when a tab is dragged over.
			 *
			 * @property tabArea
			 * @type {DOM}
			 */
			this.tabArea = document.createElement("div");
			this.tabArea.style.zIndex = "1000";
			this.tabArea.style.position = "absolute";
			this.tabArea.style.backgroundColor = "rgba(0.0, 0.0, 0.0, 0.2)";
			this.tabArea.style.pointerEvents = "none";

			//Drag drop
			this.tab.element.ondrop = function(event)
			{
				event.preventDefault();

				var uuid = event.dataTransfer.getData("uuid");
				var tab = DragBuffer.get(uuid);

				if(tab instanceof TabElement)
				{
					var position = geom.pagePosition(self.element);
					var x = event.clientX - (position.x || position.left);
					var y = event.clientY - (position.y || position.top);

					//Left
					if(x < self.size.x * self.dragBorder)
					{
						self.split(TabGroup.LEFT).attachTab(tab);
					}
					//Right
					else if(x > self.size.x * (1 - self.dragBorder))
					{
						self.split(TabGroup.RIGHT).attachTab(tab);
					}
					//Top
					else if(y < self.size.y * self.dragBorder)
					{
						self.split(TabGroup.TOP).attachTab(tab);
					}
					//Bottom
					else if(y > self.size.y * (1 - self.dragBorder))
					{
						self.split(TabGroup.BOTTOM).attachTab(tab);
					}
					else
					{
						self.attachTab(tab);
					}

					DragBuffer.pop(uuid);
				}

				if(self.tab.element.contains(self.tabArea))
				{
					self.tab.element.removeChild(self.tabArea);
				}
			};

			//Drag over
			this.tab.element.ondragover = function(event)
			{
				event.preventDefault();

				if(!(DragBuffer.buffer[0] instanceof TabElement))
				{
					return;
				}

				var position = geom.pagePosition(self.element);
				var x = event.clientX - (position.x || position.left);
				var y = event.clientY - (position.y || position.top);

				//Left
				if(x < self.size.x * self.dragBorder)
				{
					self.tabArea.style.right = null;
					self.tabArea.style.bottom = null;
					self.tabArea.style.top = "0px";
					self.tabArea.style.left = "0px";
					self.tabArea.style.width = "50%";
					self.tabArea.style.height = "100%";

					if(!self.tab.element.contains(self.tabArea))
					{
						self.tab.element.appendChild(self.tabArea);
					}
				}
				//Right
				else if(x > self.size.x * (1 - self.dragBorder))
				{
					self.tabArea.style.left = null;
					self.tabArea.style.bottom = null;
					self.tabArea.style.top = "0px";
					self.tabArea.style.right = "0px";
					self.tabArea.style.width = "50%";
					self.tabArea.style.height = "100%";

					if(!self.tab.element.contains(self.tabArea))
					{
						self.tab.element.appendChild(self.tabArea);
					}
				}
				//Top
				else if(y < self.size.y * self.dragBorder)
				{
					self.tabArea.style.right = null;
					self.tabArea.style.bottom = null;
					self.tabArea.style.top = "0px";
					self.tabArea.style.left = "0px";
					self.tabArea.style.width = "100%";
					self.tabArea.style.height = "50%";

					if(!self.tab.element.contains(self.tabArea))
					{
						self.tab.element.appendChild(self.tabArea);
					}
				}
				//Bottom
				else if(y > self.size.y * (1 - self.dragBorder))
				{
					self.tabArea.style.top = null;
					self.tabArea.style.right = null;
					self.tabArea.style.bottom = "0px";
					self.tabArea.style.left = "0px";
					self.tabArea.style.width = "100%";
					self.tabArea.style.height = "50%";

					if(!self.tab.element.contains(self.tabArea))
					{
						self.tab.element.appendChild(self.tabArea);
					}
				}
				else
				{
					if(self.tab.element.contains(self.tabArea))
					{
						self.tab.element.removeChild(self.tabArea);
					}
				}
			};

			//Drag leave
			this.tab.element.ondragleave = function(event)
			{
				event.preventDefault();

				if(self.tab.element.contains(self.tabArea))
				{
					self.tab.element.removeChild(self.tabArea);
				}
			};
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
			if(this.canSplit)
			{
				if(direction === undefined)
				{
					direction = TabGroup.RIGHT;
				}

				var container = new TabDualContainer();
				var parent = this.parent;
				var group = new TabGroupSplit(container, this.placement);

				if(direction === TabGroup.RIGHT)
				{
					container.orientation = DualContainer.HORIZONTAL;
					container.attach(this);
					container.attach(group);
				}
				else if(direction === TabGroup.LEFT)
				{
					container.orientation = DualContainer.HORIZONTAL;
					container.attach(group);
					container.attach(this);
				}
				else if(direction === TabGroup.BOTTOM)
				{
					container.orientation = DualContainer.VERTICAL;
					container.attach(this);
					container.attach(group);
				}
				else if(direction === TabGroup.TOP)
				{
					container.orientation = DualContainer.VERTICAL;
					container.attach(group);
					container.attach(this);
				}
				
				if(parent instanceof TabContainer)
				{
					parent.attach(container);
					parent.updateSize();
				}
				else if(parent instanceof DualContainer)
				{
					if(parent.elementA === this)
					{
						parent.attachA(container);
						parent.updateSize();
					}
					else if(parent.elementB === this)
					{
						parent.attachB(container);
						parent.updateSize();
					}
				}

				return group;
			}
			else
			{
				console.warn("nunuStudio: Tab is not splitable.");
			}
		},

		/**
		 * If the tab is in a split container, move all the tabs to the other tabgroup in the container and close this group.
		 *
		 * @method collapse
		 */ 
		collapse : function()
		{
			if(this.canCollapse)
			{
				if(this.parent instanceof DualContainer)
				{
					var parent = this.parent.parent;
					var group = this.parent.elementA === this ? this.parent.elementB : this.parent.elementA;

					//Dual container
					if(parent instanceof DualContainer)
					{
						if(parent.elementA === this.parent)
						{
							this.parent.destroy();
							this.destroy();
							parent.attachA(group);
						}
						else if(parent.elementB === this.parent)
						{
							this.parent.destroy();
							this.destroy();
							parent.attachB(group);
						}
					}
					//Tab container
					else
					{
						this.parent.destroy();
						this.destroy();
						parent.attach(group);
					}
					
					parent.updateSize();
				}
				else
				{
					console.warn("nunuStudio: Tab cannot be collapsed (parent is not a dual container).");
				}
			}
			else
			{
				console.warn("nunuStudio: Tab is not collapsable.");
			}
		},

		/**
		 * Attach tab to this group and remove it from the original group.
		 *
		 * @method attachTab
		 * @param {TabElement} tab Tab to be moved.
		 * @param {Number} insertIndex Index where to place the tab.
		 */
		attachTab : function(tab, insertIndex)
		{	
			var container = tab.container;
			var tab = TabGroup.prototype.attachTab.call(this, tab, insertIndex);

			if(container.options.length === 0)
			{
				container.collapse();
			}

			return tab;
		},

		removeTab : function(index, dontDestroy)
		{
			TabGroup.prototype.removeTab.call(this, index, dontDestroy);

			if(this.options.length === 0 && dontDestroy !== true)
			{
				this.collapse();
			}
		},

		addTab : function(TabConstructor, closeable)
		{
			var tab = new TabConstructor(this.tab, closeable, this, this.options.length);
			tab.button = new TabButtonSplit(this.buttons, tab);
			tab.updateInterface();

			this.options.push(tab);

			if(this.selected === null || this.options.length === 1)
			{
				this.selectTab(tab);
			}
			else
			{
				this.updateInterface();
			}
			
			return tab;
		}
	});



	return tabs.splittable.TabGroupSplit = TabGroupSplit;
});
define('skylark-widgets-tabs/main',[
	"./tabs",
	"./TabButton",
	"./TabElement",
	"./TabGroup",
	"./splittable/TabButtonSplit",
	"./splittable/TabContainer",
	"./splittable/TabDualContainer",
	"./splittable/TabGroupSplit"

],function(tabs){
	return tabs;
});
define('skylark-widgets-tabs', ['skylark-widgets-tabs/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-widgets-tabs.js.map
