/**
 * skylark-widgets-tabs - The skylark tabs widgets library
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-widgets/skylark-widgets-tabs/
 * @license MIT
 */
define(["skylark-widgets-base/panels/panel","../tabs","../tab-group"],function(t,e,i){"use strict";var u=t.inherit({klassName:"TabContainer",_construct:function(e){t.prototype._construct.call(this,e),this.group=null},split:function(t){return this.group.split(t)},attach:function(t){this.group=t,this.group.setParent(this)},updateSize:function(){t.prototype.updateSize.call(this),null!==this.group&&(this.group.position.set(0,0),this.group.size.copy(this.size),this.group.updateInterface())},updateMetadata:function(){this.group.updateMetadata()},updateObjectsView:function(){this.group.updateObjectsView()},updateSelection:function(){this.group.updateSelection()},updateSettings:function(){this.group.updateSettings()},getActiveTab:function(){var t=[];if(this.group instanceof i){var e=this.group.getActiveTab();null!==e&&t.push(e)}else t=t.concat(this.group.getActiveTab());return this.group.getActiveTab()},closeActual:function(){this.group.closeActual()},selectTab:function(t){this.group.selectTab(t)},selectNextTab:function(){this.group.selectNextTab()},selectPreviousTab:function(){this.group.selectPreviousTab()},addTab:function(t,e){return this.group.addTab(t,e)},getTab:function(t,e){return this.group.getTab(t,e)},clear:function(t){this.group.clear()}});return e.splittable.TabContainer=u});
//# sourceMappingURL=../sourcemaps/splittable/tab-container.js.map
