# This script turns this giant repo into a smaller electron app.

# Bail on errors
set -e

# Grab the few third-party things we need
cp -r appengine/third-party/blockly/media appengine/
cp -r appengine/third-party/blockly/JS-Interpreter/interpreter_compiled.js appengine/

# Ignore the rest.
electron-packager .  --ignore="(NihaoClass|appengine/heroes/js|appengine/js|appengine/accessible/|appengine/third-party/|third-party/)" --overwrite
