// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

/**
 * @fileoverview Templates in namespace Catalog.soy.
 */

goog.provide('Catalog.soy');

goog.require('soy');
goog.require('soydata');


Catalog.soy.start = function(opt_data, opt_ignored, opt_ijData) {
  return '<div class="dashboard"><h1 class="title">' + soy.$$escapeHtml(opt_ijData.username) + '\'s Code</h1><div class="row"><div class="col-md-2 col-md-offset-4"><h3> Saved Projects </h3><div id="no-projects">None yet...</div><ul id="project_list"></ul></div><div class="col-md-3"><a id="join-lesson"><button class="btn btn-success btn-lg btn-block" id="join-lesson-button">Join Class</button></a></div></div><h3 class="title">Press Enter to Talk</h3></div>';
};
if (goog.DEBUG) {
  Catalog.soy.start.soyTemplateName = 'Catalog.soy.start';
}
