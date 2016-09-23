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

  var ref = new Wilddog("https://blocklypipe.wilddogio.com/users/" + getUsername());
  ref['child']('snapshots')['on']("child_added", function(project)
  {
    $('#no-projects')['hide']();
    project = project['key']();
    var li = document.createElement("li");
    var new_project = document.createElement("a");
    new_project.innerHTML = project;

    if (project == "turtle")
    {
      new_project.href = "/appengine/turtle_collab.html?level=10&username=" + getUsername() + "&saved=" + encodeURIComponent(project);
    }
    else if (project == "maze") {
      return;
    }
    else
    {
      new_project.href = "/appengine/heroes.html?level=4&username=" + getUsername() + "&saved=" + encodeURIComponent(project);
    }
    li.appendChild(new_project);
    project_list.appendChild(li);
  });

  ref['child']('classroom')['on']("value", function(classroom)
  {
    $("#join-lesson")['append']("<div>" + classroom['val']() + "</div>");
    $("#join-lesson")['show']();
    $("#video-link")['attr']("href",
        "https://classadoo.github.io/meetingcenter/cmc/student.html?meetingID=" + encodeURIComponent(classroom['val']()) + "&name=" + getUsername());
    $("#video-link")['show']();

  });
}


window.addEventListener('load', Catalog.init);
