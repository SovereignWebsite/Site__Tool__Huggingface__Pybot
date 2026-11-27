// Runs PyBot in this visitor's browser. Pyodide (CPython compiled to WebAssembly) and PyBot's unmodified bot/ package are
// both served from this site; nothing is sent anywhere. Unofficial: not made or endorsed by Hugging Face.
importScripts('pyodide/pyodide.js');
var py, say;
async function boot() {
  var t0 = performance.now();
  postMessage({ type: 'status', text: 'Starting Python (Pyodide)...' });
  py = await loadPyodide({ indexURL: 'pyodide/' });
  postMessage({ type: 'status', text: 'Downloading PyBot (about 13 MB)...' });
  var buf = await (await fetch('bot.zip')).arrayBuffer();
  postMessage({ type: 'status', text: 'Loading about 640,000 lines of Python...' });
  py.unpackArchive(buf, 'zip', { extractDir: '/home/pyodide' });
  py.runPython([
    'import sys, random',
    "sys.path.insert(0, '/home/pyodide')",
    'from bot import runtime',
    'memory = {}',
    'def say(text):',
    '    result = runtime.turn(text, memory)',
    '    return [" ".join(str(result["reply"]).split()) or "Hello!", str(result.get("module"))]',
    'def reset():',
    '    memory.clear()'
  ].join('\n'));
  say = py.globals.get('say');
  postMessage({ type: 'ready', ms: Math.round(performance.now() - t0) });
}
onmessage = function (e) {
  var m = e.data;
  try {
    if (m.type === 'say') {
      var t = performance.now(), r = say(m.text).toJs();
      postMessage({ type: 'reply', reply: r[0], module: r[1], ms: Math.round(performance.now() - t) });
    } else if (m.type === 'reset') py.globals.get('reset')();
  } catch (err) { postMessage({ type: 'error', error: String(err) }); }
};
boot().catch(function (err) { postMessage({ type: 'error', error: String(err) }); });
