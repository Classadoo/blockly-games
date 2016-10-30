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
'use strict';

goog.provide('Catalog');

goog.require('Catalog.soy');
goog.require('WilddogUtils');


Catalog.init = function()
{
  // Render the Soy template.
  document.body.innerHTML = Catalog.soy.start({}, null,
      {username: getUsername()});

  var project_list = document.getElementById("project_list");

  var ref = new Wilddog("https://classadoo-heroes.wilddogio.com");
  var user_ref = ref['child']("users")['child'](getUsername());
  var user_games_ref = user_ref['child']("games");
  var games_ref = ref['child']("games");

  var saved_games = {};

  //
  // Get saved game.
  //
  user_games_ref['on']("child_added", function(project)
  {
    $('#no-projects')['hide']();
    var project_name = project['key']();
    var li = document.createElement("li");
    var new_project = document.createElement("a");
    new_project.innerHTML = project_name;

    if (project_name == "turtle")
    {
      new_project.href = "/appengine/turtle_collab.html?level=10&username=" + getUsername() + "&saved=" + encodeURIComponent(project['val']()['game_id']);
    }
    else if (project_name == "maze") {
      return;
    }
    else
    {
      new_project.href = "/appengine/heroes.html?level=&username=" + getUsername() + "&saved=" + encodeURIComponent(project['val']()['game_id']);
    }
    li.appendChild(new_project);
    project_list.appendChild(li);

    saved_games[project_name] = encodeURIComponent(project['val']()['game_id']);

    // If the classroom link already exists
    if (project_name == Catalog.class_name)
    {
      var _href = $("#join-lesson")['attr']("href");
      $("#join-lesson")['attr']("href", _href + '&saved=' + saved_games[project_name]);
    }
  });

  //
  // Get link to classroom.
  //
  user_ref['child']('classroom')['on']("value", function(classroom)
  {

    Catalog.class_name = classroom['val']();

    ptt = new Opus(new Wilddog("https://classadoo-audio.wilddogio.com/recordings/" + Catalog.class_name), getUsername());
    document.addEventListener("keydown", function(e) {
      if(e.keyCode == 13) {
        ptt['enableStream'](true);
      }
    });
    document.addEventListener("keyup", function(e) {
      if(e.keyCode == 13) {
        ptt['enableStream'](false);
      }
    });

    // Create classroom link.
    $("#join-lesson-button")['append']("<div>" + Catalog.class_name + "</div>");

    var href = "heroes.html?level=1&username=" + getUsername() + "&classroom=" + encodeURIComponent(Catalog.class_name);

    // Link to a previous save if there is one.
    if (saved_games[Catalog.class_name])
    {
      href += "&saved=" + saved_games[Catalog.class_name];
    }
    $("#join-lesson")['attr']("href", href);
    $("#join-lesson")['show']();
  });
}


window.addEventListener('load', Catalog.init);
