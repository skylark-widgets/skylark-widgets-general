/**
 * skylark-widgets-tabs - The skylark tabs widgets library
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-widgets/skylark-widgets-tabs/
 * @license MIT
 */
define(["skylark-langx-strings","skylark-widgets-base/panels/panel","./tabs"],function(t,e,i){"use strict";var n=e.inherit({klassName:"TabElement",_construct:function(i,n,s,a,o,c){e.prototype._construct.call(this,i);var u=this.getSkin();this._elm.style.overflow="visible",this._elm.style.backgroundColor=u.panelColor,this.preventDragEvents(),this.container=s,this.uuid=t.generateUUID(),this.index=a,this.button=null,this.closeable=n,this.title=o,this.icon=c,this.active=!1},updateMetadata:function(){},updateSettings:function(){},updateValues:function(){},updateObjectsView:function(){},updateSelection:function(){},activate:function(){if(!0===this.active&&this.deactivate(),void 0!==this.update){var t=this,e=function(){t.update(),!0===t.active&&requestAnimationFrame(e)};requestAnimationFrame(e)}this.active=!0},deactivate:function(){this.active=!1},attach:function(t){},isAttached:function(t){return!1},close:function(){this.container.removeTab(this)},select:function(){this.container.selectTab(this)},isSelected:function(){return this===this.container.selected},setIcon:function(t){this.icon=t,this.button.setIcon(t)},setName:function(t){this.title=t,this.button.setName(t)},destroy:function(){e.prototype.destroy.call(this),null!==this.button&&this.button.destroy()}});return i.TabElement=n});
//# sourceMappingURL=sourcemaps/tab-element.js.map
