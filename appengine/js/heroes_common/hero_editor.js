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
  self.edited_image_index = 0;
  var canvas_images = {};
  $(".costumes")['remove']();
  
  var STOCK_NAMES = ["Paul", "Mitch", "Peter", "Sally", "Quail", "Dennis", "Lucy", "Trya", "Jimmer", "Randy", "Susan", "Falthia", "Arwen", "Galadriel", "Smeagal"];

  //
  // Clear the forms.
  //

  $('#' + username + '-hero-name')['val']("");
  $('#' + username + '-hero-type')['val']("custom");
  
  //
  // Show the tab.
  //
  $('.nav-tabs a[href="#' + username + '-add-hero"]')['tab']('show')['keydown'](function(event){
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
    {"imageURLPrefix": 'common/literally_canvas_img'}
  );
  lc['clear']();
  
  var load_image = function(src)
  {
    if (!src)
    {
      return;
    }
    var img = new Image();
    img.src = src;
    lc['saveShape'](LC['createShape']('Image', {"image": img}));
    set_thumbnail(self.edited_image_index, src);
  }

  $("#" + username + "-hero-type")['on']('change', function() {
    lc['clear']();
    load_image(chars[this.value]);
  });

  //
  // Show a template/existing hero to edit.
  //

  var set_thumbnail = function(index, image)
  {
    //
    // Create the DOM node if it doesn't exist.
    //
    if (index >= Object.keys(canvas_images).length)
    {
      var new_thumb = $('<div class="costumes">' + index + '<img width="70px" height="70px" id="' + username + '-costume-' + index + '"></div>');
      new_thumb.insertBefore("#" + username + "-add-costume");
    }

    //
    // Save the data.
    //
    canvas_images[index] = image;
    $("#" + username + "-costume-" + index)['attr']('src', canvas_images[index]);

    //
    // Let the user edit the thumbnail later.
    //
    $("#" + username + "-costume-" + index)['click'](function ()
    {
      var edited_image = lc['getImage']();
      if (edited_image)
      {
        set_thumbnail(self.edited_image_index, edited_image.toDataURL("image/png"));
      }
      self.edited_image_index = index;
      lc['clear']();
      load_image(image);
    })
  }
  lc['on']('drawingChange', function() {
    var img = lc['getImage']();
    if (img)
    {
      set_thumbnail(self.edited_image_index, img.toDataURL("image/png"));
    }
  });

  if (hero)
  {
    $('#' + username + '-hero-name')['val'](hero.tab_name);
    $('#' + username + '-hero-type')['val'](hero.hero_type);
    load_image(hero.images[0]);    
    hero.images.forEach( function(el, i)
    {
      set_thumbnail(i, el);
    })
  }
  else
  {
    var placeholder_name = STOCK_NAMES[Math.floor(Math.random() * STOCK_NAMES.length)];
    $('#' + username + '-hero-name')['val'](placeholder_name);
  }
  
  //
  // Handle submit (Remove previous handlers. They have an old LC object).
  //

  $("#" + username + "-submit-hero")['off']('click')['click'](function()
  {
    var name = $("#" + username + "-hero-name")['val']();
    var type = $("#" + username + "-hero-type")['val']();
    
    var image = lc['getImage']();
    if (image)
    {
      canvas_images[self.edited_image_index] = image.toDataURL("image/png");
    }


    name = name.replace(/[^a-zA-Z0-9]+/g, "");

    if (!name || !type)
    {
      console.log("Fill out the whole form: ", name, type);
      return;
    }

    if (!ide.tabs[name] || confirm("Overwrite this hero?"))
    {
      var stock_idx = STOCK_NAMES.indexOf(name);
      if (stock_idx >= 0)
      {
        STOCK_NAMES.splice(stock_idx, 1);
      }
      ide.publishHero(name, type, canvas_images);
    }
    else
    {
      console.log("This hero already exists: ", name);
      return;
    }
  });
  
  var x_button = $("#" + username + "-x")['show']()['off']('click');
  if (hero && hero.tab_name)
  {
    x_button['click'](function()
    {
      if (confirm("DELETE this hero?"))
      {
        ide.remove_tab(hero.tab_name);
      }
    });
  }
  else
  {
    x_button['hide']();
  }

  //
  // Store whatever's in the current canvas, then clear it.
  //
  var new_costume = function()
  {
    //
    // Save current image.
    //

    var image = lc['getImage']().toDataURL("image/png");
    set_thumbnail(self.edited_image_index, image);
    
    //
    // Setup a fresh image.
    //

    self.edited_image_index = Object.keys(canvas_images).length;
    lc['clear']();
    load_image(image);
  }

  
  var costume_button = $("#" + username + "-add-costume")['off']('click')['click'](function()
  {
    if (lc['getImage']())
    {
      new_costume();
    }
  });
}