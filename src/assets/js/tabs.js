/* VeriCorp — Code Tabs */
function showTab(group, id) {
  var container = typeof group === 'string'
    ? document.getElementById(group)
    : group.closest('.code-section');
  if (!container) return;
  container.querySelectorAll('.code-tab').forEach(function (t) { t.classList.remove('active'); });
  container.querySelectorAll('.code-block').forEach(function (b) { b.classList.remove('active'); });
  var block = container.querySelector('#tab-' + id);
  if (block) block.classList.add('active');
  container.querySelectorAll('.code-tab').forEach(function (t) {
    if (t.getAttribute('data-tab') === id) t.classList.add('active');
  });
}

/* Copy code to clipboard */
function copyCode(btn) {
  var block = btn.closest('.code-block');
  if (!block) return;
  var pre = block.querySelector('pre');
  if (!pre) return;
  navigator.clipboard.writeText(pre.textContent).then(function () {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(function () {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 2000);
  });
}
