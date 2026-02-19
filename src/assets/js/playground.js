/* VeriCorp — Invoice Playground (live API calls) */
(function () {
  var API_URL = 'https://vericorp-invoice-api.vericorptest.workers.dev/v1/playground';
  var RAPIDAPI_URL = 'https://rapidapi.com/vericorptestcollab/api/vericorp-invoice-data-extract';
  var SAMPLES = {};
  var SAMPLE_FILES = {};
  var currentSample = null;
  var isLoading = false;

  // === Sample loading ===

  function loadSamples() {
    var files = {
      pt: { json: '/assets/samples/invoice-pt.json', pdf: '/assets/samples/invoice-pt.pdf' },
      es: { json: '/assets/samples/invoice-es.json', pdf: '/assets/samples/invoice-es.pdf' },
      de: { json: '/assets/samples/invoice-de.json', pdf: '/assets/samples/invoice-de.pdf' }
    };
    Object.keys(files).forEach(function (key) {
      fetch(files[key].json).then(function (r) { return r.json(); }).then(function (data) {
        SAMPLES[key] = data;
        if (!currentSample) selectSample('pt');
      }).catch(function () {});
    });
  }

  // === API call ===

  function callApi(file) {
    if (isLoading) return;
    isLoading = true;

    var output = document.querySelector('.playground-json');
    var meta = document.querySelector('.playground-meta');
    if (output) output.innerHTML =
      '<div class="playground-loader">' +
        '<div class="playground-spinner"></div>' +
        '<div class="playground-loader-text">Extracting invoice data\u2026</div>' +
        '<div class="playground-loader-sub">AI processing \u2014 may take 10-30 seconds</div>' +
      '</div>';
    if (meta) meta.innerHTML = '';

    var formData = new FormData();
    formData.append('file', file);

    fetch(API_URL, { method: 'POST', body: formData })
      .then(function (r) {
        if (r.status === 429) {
          showRateLimitMessage();
          throw new Error('rate_limited');
        }
        if (r.status === 503) {
          showMessage('AI service temporarily busy. Please try again in a few seconds.', 'warning');
          throw new Error('ai_unavailable');
        }
        if (!r.ok) throw new Error('API error: ' + r.status);
        return r.json();
      })
      .then(function (data) {
        isLoading = false;
        renderOutput(data);
      })
      .catch(function (err) {
        isLoading = false;
        if (err.message === 'rate_limited' || err.message === 'ai_unavailable') return;
        // Fallback to cached sample if available
        if (currentSample && SAMPLES[currentSample]) {
          renderOutput(SAMPLES[currentSample]);
          showMessage('Live extraction failed — showing cached sample.', 'warning');
        } else {
          showMessage('Extraction failed. Try again or use a sample below.', 'error');
        }
      });
  }

  function showRateLimitMessage() {
    var output = document.querySelector('.playground-json');
    if (output) {
      output.innerHTML =
        '<div style="text-align:center;padding:3rem 1rem">' +
          '<p style="font-size:1.2rem;margin-bottom:.75rem;color:var(--muted)">You\'ve used all free playground extractions for this hour.</p>' +
          '<p style="margin-bottom:1.5rem;color:var(--muted)">Get a free API key on RapidAPI for <strong>25 extractions/month</strong> — no credit card required.</p>' +
          '<a href="' + RAPIDAPI_URL + '" class="btn btn-primary" target="_blank" style="display:inline-block;padding:.75rem 1.5rem;background:var(--accent);color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Get Free API Key &rarr;</a>' +
        '</div>';
    }
  }

  function showMessage(text, type) {
    var meta = document.querySelector('.playground-meta');
    if (meta) {
      var color = type === 'error' ? '#ef4444' : '#f59e0b';
      meta.innerHTML = '<div style="color:' + color + ';font-size:.85rem;padding:.5rem">' + text + '</div>';
    }
  }

  // === Sample selection ===

  function selectSample(key) {
    currentSample = key;
    document.querySelectorAll('.playground-sample').forEach(function (s) {
      s.classList.toggle('active', s.getAttribute('data-sample') === key);
    });
    // Use pre-computed cached results for samples (doesn't spend API quota)
    var data = SAMPLES[key];
    if (data) renderOutput(data);
  }

  // === File drop/upload ===

  function setupDropZone() {
    var zone = document.querySelector('.playground-upload');
    if (!zone) return;

    zone.addEventListener('dragover', function (e) {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', function () {
      zone.classList.remove('drag-over');
    });
    zone.addEventListener('drop', function (e) {
      e.preventDefault();
      zone.classList.remove('drag-over');
      var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) {
        currentSample = null;
        document.querySelectorAll('.playground-sample').forEach(function (s) { s.classList.remove('active'); });
        callApi(file);
      }
    });

    // Click to select file
    zone.addEventListener('click', function () {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.png,.jpg,.jpeg,.tiff,.tif';
      input.onchange = function () {
        if (input.files && input.files[0]) {
          currentSample = null;
          document.querySelectorAll('.playground-sample').forEach(function (s) { s.classList.remove('active'); });
          callApi(input.files[0]);
        }
      };
      input.click();
    });
  }

  // === Rendering ===

  function syntaxHighlight(json) {
    var str = JSON.stringify(json, null, 2);
    return str.replace(/("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
      var cls = 'json-num';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
          return '<span class="' + cls + '">' + match.slice(0, -1) + '</span>:';
        }
        cls = 'json-str';
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

  function renderOutput(data) {
    var output = document.querySelector('.playground-json');
    if (!output) return;

    output.innerHTML = syntaxHighlight(data);

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

  // === Init ===

  document.addEventListener('DOMContentLoaded', function () {
    loadSamples();
    setupDropZone();

    document.querySelectorAll('.playground-sample').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectSample(btn.getAttribute('data-sample'));
      });
    });
  });

  window.playgroundSelectSample = selectSample;
})();
