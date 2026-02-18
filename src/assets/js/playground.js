/* VeriCorp — Invoice Playground */
(function () {
  var SAMPLES = {};
  var currentSample = null;

  function loadSamples() {
    var files = {
      pt: '/assets/samples/invoice-pt.json',
      es: '/assets/samples/invoice-es.json',
      de: '/assets/samples/invoice-de.json'
    };
    Object.keys(files).forEach(function (key) {
      fetch(files[key]).then(function (r) { return r.json(); }).then(function (data) {
        SAMPLES[key] = data;
        if (!currentSample) selectSample('pt');
      }).catch(function () {});
    });
  }

  function syntaxHighlight(json) {
    var str = JSON.stringify(json, null, 2);
    return str.replace(/("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
      var cls = 'json-num';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
          return '<span class="' + cls + '">' + match.slice(0, -1) + '</span>:';
        }
        // Check for validation fields
        if (match === '"true"' || match === 'true') cls = 'json-valid';
        else cls = 'json-str';
      } else if (/true/.test(match)) {
        cls = 'json-valid';
      } else if (/false/.test(match)) {
        cls = 'json-invalid';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  }

  function selectSample(key) {
    currentSample = key;
    document.querySelectorAll('.playground-sample').forEach(function (s) {
      s.classList.toggle('active', s.getAttribute('data-sample') === key);
    });
    var data = SAMPLES[key];
    if (!data) return;
    renderOutput(data);
  }

  function renderOutput(data) {
    var output = document.querySelector('.playground-json');
    if (!output) return;

    // Animate: show loading, then render
    output.innerHTML = '<span style="color:var(--muted)">Extracting...</span>';
    setTimeout(function () {
      output.innerHTML = syntaxHighlight(data);
    }, 400);

    // Update meta bar
    var meta = document.querySelector('.playground-meta');
    if (meta && data.metadata) {
      meta.innerHTML =
        '<div class="playground-meta-item"><strong>' + (data.metadata.processing_time_ms || 0) + 'ms</strong> processing</div>' +
        '<div class="playground-meta-item"><strong>' + (data.metadata.pages || 1) + '</strong> page' + ((data.metadata.pages || 1) > 1 ? 's' : '') + '</div>' +
        '<div class="playground-meta-item"><strong>' + (data.metadata.neurons_used || 0) + '</strong> neurons</div>' +
        '<div class="playground-meta-item playground-confidence">' +
          'Confidence <strong>' + ((data.confidence || 0) * 100).toFixed(0) + '%</strong>' +
          '<div class="confidence-bar"><div class="confidence-fill ' + confidenceClass(data.confidence) + '" style="width:' + ((data.confidence || 0) * 100) + '%"></div></div>' +
        '</div>';
    }
  }

  function confidenceClass(c) {
    if (c >= 0.9) return 'confidence-high';
    if (c >= 0.7) return 'confidence-medium';
    return 'confidence-low';
  }

  // Init
  document.addEventListener('DOMContentLoaded', function () {
    loadSamples();

    document.querySelectorAll('.playground-sample').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectSample(btn.getAttribute('data-sample'));
      });
    });
  });

  window.playgroundSelectSample = selectSample;
})();
