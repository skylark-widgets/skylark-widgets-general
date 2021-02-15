define([
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