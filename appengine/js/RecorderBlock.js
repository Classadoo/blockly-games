/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Object representing a code comment.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Recorder');

goog.require('Blockly.Bubble');
goog.require('Blockly.Icon');
goog.require('goog.userAgent');


/**
 * Class for a comment.
 * @param {!Blockly.Block} block The block associated with this comment.
 * @extends {Blockly.Icon}
 * @constructor
 */
Blockly.Recorder = function(block) {
  var self = this;

  Blockly.Recorder.superClass_.constructor.call(self, block);
  self.createIcon();
  self.recording = false;

  // TODO: probably better quality audio.
  self.recorderJS = new Recorder({
    monitorGain: 0,
    numberOfChannels: 1,
    bitRate: 4000,
    encoderSampleRate: 8000,
    encoderPath: "../appengine/js/encoderWorker.min.js",
    leaveStreamOpen: true
  });
  self.recorderJS.initStream();
  self.recorderJS.addEventListener("dataAvailable", function(e){
    var b64encoded = btoa(String.fromCharCode.apply(null, e.detail));
    self.sound = b64encoded;
  });
  self.recorderJS.addEventListener("streamReady", function(e){
   //TODO enable the buttons or something.
  });
  self.recorderJS.addEventListener("streamError", function(e){
    console.error('Error encountered: ' + e.error.name );
  });


};
goog.inherits(Blockly.Recorder, Blockly.Icon);

/**
 * Recorder text (if bubble is not visible).
 * @private
 */
Blockly.Recorder.prototype.text_ = '';

/**
 * Width of bubble.
 * @private
 */
Blockly.Recorder.prototype.width_ = 60;

/**
 * Height of bubble.
 * @private
 */
Blockly.Recorder.prototype.height_ = 30;

/**
 * Draw the comment icon.
 * @param {!Element} group The icon group.
 * @private
 */
Blockly.Recorder.prototype.drawIcon_ = function(group) {
  // Circle.
  Blockly.createSvgElement('circle',
      {'class': 'blocklyIconShape', 'r': '8', 'cx': '8', 'cy': '8'},
       group);
  // Can't use a real '?' text character since different browsers and operating
  // systems render it differently.
  // Body of question mark.
  Blockly.createSvgElement('path',
      {'class': 'blocklyIconSymbol',
       'd': 'm6.8,10h2c0.003,-0.617 0.271,-0.962 0.633,-1.266 2.875,-2.405 0.607,-5.534 -3.765,-3.874v1.7c3.12,-1.657 3.698,0.118 2.336,1.25 -1.201,0.998 -1.201,1.528 -1.204,2.19z'},
       group);
  // Dot of question point.
  Blockly.createSvgElement('rect',
      {'class': 'blocklyIconSymbol',
       'x': '6.8', 'y': '10.78', 'height': '2', 'width': '2'},
       group);
};

/**
 * Create the editor for the comment's bubble.
 * @return {!Element} The top-level node of the editor.
 * @private
 */
Blockly.Recorder.prototype.createEditor_ = function() {
  /* Create the editor.  Here's the markup that will be generated:
    <foreignObject x="8" y="8" width="164" height="164">
      <body xmlns="http://www.w3.org/1999/xhtml" class="blocklyMinimalBody">
        <button
            class="blocklyRecorderButton"
            style="height: 164px; width: 164px;"></button>
      </body>
    </foreignObject>
  */
  this.foreignObject_ = Blockly.createSvgElement('foreignObject',
      {'x': Blockly.Bubble.BORDER_WIDTH, 'y': Blockly.Bubble.BORDER_WIDTH},
      null);
  var body = document.createElementNS(Blockly.HTML_NS, 'body');
  body.setAttribute('xmlns', Blockly.HTML_NS);
  body.className = 'blocklyMinimalBody';
  var recordButton = document.createElementNS(Blockly.HTML_NS, 'button');
  recordButton.innerHTML = "Start Recording";
  recordButton.className = 'blocklyRecorderButton';
  body.appendChild(recordButton);
  this.recordButton_ = recordButton;
  this.foreignObject_.appendChild(body);
  Blockly.bindEventWithChecks_(recordButton, 'mouseup', this, function(e) {
    if (this.recording_)
    {
      this.recording_ = false;
      console.log("stop recording");
      recordButton.innerHTML = "Start Recording";
      recordButton.className = 'blocklyRecorderButton'
      this.recorderJS.stop();
    }
    else
    {
      this.recording_ = true;
      console.log("start recording");
      recordButton.innerHTML = "Stop Recording";
      recordButton.className = 'blocklyRecorderButton recording'
      this.recorderJS.start();
    }
  });

  return this.foreignObject_;
};

/**
 * Add or remove editability of the comment.
 * @override
 */
Blockly.Recorder.prototype.updateEditable = function() {
  if (this.isVisible()) {
    // Toggling visibility will force a rerendering.
    this.setVisible(false);
    this.setVisible(true);
  }
  // Allow the icon to update.
  Blockly.Icon.prototype.updateEditable.call(this);
};

/**
 * Show or hide the comment bubble.
 * @param {boolean} visible True if the bubble should be visible.
 */
Blockly.Recorder.prototype.setVisible = function(visible) {
  if (visible == this.isVisible()) {
    // No change.
    return;
  }
  Blockly.Events.fire(
      new Blockly.Events.Ui(this.block_, 'commentOpen', !visible, visible));
  if ((!this.block_.isEditable() && !this.textarea_) || goog.userAgent.IE) {
    // Steal the code from warnings to make an uneditable text bubble.
    // MSIE does not support foreignobject; textareas are impossible.
    // http://msdn.microsoft.com/en-us/library/hh834675%28v=vs.85%29.aspx
    // Always treat comments in IE as uneditable.
    Blockly.Warning.prototype.setVisible.call(this, visible);
    return;
  }
  // Save the bubble stats before the visibility switch.
  var size = this.getBubbleSize();
  if (visible) {
    // Create the bubble.
    this.bubble_ = new Blockly.Bubble(
        /** @type {!Blockly.WorkspaceSvg} */ (this.block_.workspace),
        this.createEditor_(), this.block_.svgPath_,
        this.iconXY_, this.width_, this.height_);
    this.updateColour();
  } else {
    // Dispose of the bubble.
    this.bubble_.dispose();
    this.bubble_ = null;
    this.foreignObject_ = null;
  }
  this.setBubbleSize(size.width, size.height);
};

/**
 * Get the dimensions of this comment's bubble.
 * @return {!Object} Object with width and height properties.
 */
Blockly.Recorder.prototype.getBubbleSize = function() {
  if (this.isVisible()) {
    return this.bubble_.getBubbleSize();
  } else {
    return {width: this.width_, height: this.height_};
  }
};

/**
 * Size this comment's bubble.
 * @param {number} width Width of the bubble.
 * @param {number} height Height of the bubble.
 */
Blockly.Recorder.prototype.setBubbleSize = function(width, height) {
  if (this.textarea_) {
    this.bubble_.setBubbleSize(width, height);
  } else {
    this.width_ = width;
    this.height_ = height;
  }
};



/**
 * Set this comment's text.
 * @param {string} text Recorder text.
 */
Blockly.Recorder.prototype.setRecording = function(b64encoded) {
  if (this.recording_ != b64encoded)
  {
    Blockly.Events.fire(new Blockly.Events.Change(
      this.block_, 'recording', null, this.recording_, b64encoded));
    this.recording_ = b64encoded;
  }
};

/**
 * Dispose of this recording.
 */
Blockly.Recorder.prototype.dispose = function() {
  this.block_.recording = null;
  Blockly.Icon.prototype.dispose.call(this);
};
