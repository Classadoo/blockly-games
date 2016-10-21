// Copyright 2016 Classadoo
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview JavaScript for Blockly's Heroes application.
 * @author drewheine@gmail.com
 */

goog.provide('HeroesEditor');

//
// We have one editor instance for each IDE. Instantiating this object populates that instance with either:
// a blank, fresh character,
// a template character,
// an existing character to be edited.
//

var HeroEditor = function(ide, username, hero)
{
  var self = this;

  //
  // Clear the forms.
  //

  $('#' + username + '-hero-name').val("");
  $('#' + username + '-hero-type').val("custom");
  
  //
  // Show the tab.
  //

  $('.nav-tabs a[href="#' + username + '-add-hero"]').tab('show')['keydown'](function(event){
    if(event.keyCode == 13) {
      event.preventDefault();
      $("#" + self.username + "-submit-hero")['click']();
    }
  });

  //
  // Setup LiterallyCanvas.
  //

  var lc = LC['init'](
    document.getElementById('paint-' + username),
    {imageURLPrefix: 'common/literally_canvas_img'}
  );
  lc.clear();
  $("#" + username + "-hero-type")['on']('change', function() {
    lc.clear();
    if (chars[this.value])
    {
      lc.saveShape(LC.createShape('Image', {"image": chars[this.value]}));
    }
  });


  //
  // Show a template/existing hero to edit.
  //

  if (hero)
  {
    $('#' + username + '-hero-name').val(hero.name);
    $('#' + username + '-hero-type').val(hero.type);
    if (hero.image)
    {
      lc.saveShape(LC.createShape('Image', {"image": hero.image}));
    }
  }
  
  //
  // Handle submit (Remove previous handlers. They have an old LC object).
  //

  $("#" + username + "-submit-hero")['off']('click')['click'](function()
  {
    var name = $("#" + username + "-hero-name")['val']();
    var type = $("#" + username + "-hero-type")['val']();
    var image = lc.getImage().toDataURL("image/png");

    name = name.replace(/[^a-zA-Z0-9]+/g, "");

    if (!name || !type)
    {
      console.log("Fill out the whole form: ", name, type);
      return;
    }

    if (!ide.tabs[name] || confirm("Overwrite this hero?"))
    {
      ide.publishHero(name, type, image);
    }
    else
    {
      console.log("This hero already exists: ", name);
      return;
    }
  })

}