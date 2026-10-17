(() => {
  'use strict';
  const form = document.getElementById('inquiry-form');
  if (!form) return;
  const output = document.getElementById('inquiry-message');
  const status = document.getElementById('inquiry-status');
  const copy = document.getElementById('copy-inquiry');
  const field = name => form.elements.namedItem(name).value.trim();
  function update() {
    const lines = [
      '制作について相談したく、ご連絡しました。', '',
      '【つくりたいもの】' + field('type'),
      '【使う場所・目的】' + (field('use') || '相談しながら整理したいです。'),
      '【希望時期】' + (field('date') || '未定・相談希望'),
      '【予算の目安】' + (field('budget') || '未定・相談希望'),
      '【伝えたいこと・素材の状況】' + (field('details') || '相談しながら確認したいです。'), '',
      '制作範囲や進め方について、ご相談できれば幸いです。'
    ];
    output.value = lines.join('\n');
    status.textContent = 'このページからは送信されません。文章をコピーして、LancersまたはFiverrのメッセージに貼り付けて送ってください。';
  }
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  copy.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Manual copy');
      await navigator.clipboard.writeText(output.value);
      status.textContent = 'コピーしました。まだ送信されていません。相談窓口のメッセージに貼り付けて送ってください。';
    } catch (_) {
      output.focus();
      output.select();
      status.textContent = '文章を選択しました。端末のコピー操作でコピーしてください。';
    }
  });
  update();
})();
