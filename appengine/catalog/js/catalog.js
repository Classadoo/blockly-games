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

  var ref = new Wilddog("https://blocklypipe.wilddogio.com");
  var user_ref = ref['child']("users")['child'](getUsername());
  var user_games_ref = user_ref['child']("games");
  var games_ref = ref['child']("games");

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
  });

  user_ref['child']('classroom')['on']("value", function(classroom)
  {
    var class_name = classroom['val']();
    $("#join-lesson-button")['append']("<div>" + class_name + "</div>");
    $("#join-lesson")['show']();
    $("#video-link")['attr']("href",
        "https://classadoo.github.io/meetingcenter/cmc/student.html?meetingID=" + encodeURIComponent(class_name) + "&name=" + getUsername());
    $("#video-link")['show']();
    $("#join-lesson")['attr']("href",
        "heroes.html?level=1&lang=en&username=" + getUsername() + "&classroom=" + encodeURIComponent(class_name));

  });


}


window.addEventListener('load', Catalog.init);
