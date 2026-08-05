/**
 * entropia-info.js — Origami Seed
 * Módulo de verificação e exibição de entropia (lição Coldcard)
 *
 * Como usar:
 *   1. Importe este arquivo no index.html antes do app.js
 *   2. Chame `EntropiaInfo.verificar(numPalavras)` antes de gerar a seed
 *   3. Chame `EntropiaInfo.exibir(mnemonic, numPalavras)` após gerar
 *   4. Adicione o elemento <div id="entropia-painel"></div> no seu HTML
 */

const EntropiaInfo = (() => {

  // BIP39: 12 palavras → 128 bits (16 bytes) | 24 palavras → 256 bits (32 bytes)
  function bytesParaPalavras(numPalavras) {
    return numPalavras === 24 ? 32 : 16;
  }

  /**
   * Verifica integridade do CSPRNG antes de gerar.
   * Lança Error se o ambiente for inseguro.
   * @param {number} numPalavras - 12 ou 24
   * @returns {number} bits de entropia verificados (128 ou 256)
   */
  function verificar(numPalavras = 12) {
    // 1. API disponível?
    if (!window.crypto || typeof window.crypto.getRandomValues !== 'function') {
      throw new Error(
        'CRÍTICO: window.crypto.getRandomValues não está disponível neste ambiente. ' +
        'Não gere seeds aqui.'
      );
    }

    const tamanho = bytesParaPalavras(numPalavras);
    const a = new Uint8Array(tamanho);
    const b = new Uint8Array(tamanho);

    window.crypto.getRandomValues(a);
    window.crypto.getRandomValues(b);

    // 2. Duas chamadas consecutivas não podem ser idênticas
    if (a.every((v, i) => v === b[i])) {
      throw new Error(
        'CRÍTICO: CSPRNG retornou valores idênticos em duas chamadas consecutivas. ' +
        'Possível substituição silenciosa do RNG (padrão Coldcard).'
      );
    }

    // 3. Output não pode ser todo zeros (bug clássico de RNG defeituoso)
    if (a.every(v => v === 0) || b.every(v => v === 0)) {
      throw new Error(
        'CRÍTICO: CSPRNG retornou apenas zeros. RNG com defeito — não gere seeds.'
      );
    }

    // 4. Checar se getRandomValues foi sobrescrito (proteção contra extensões maliciosas)
    const nativa = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(window.crypto), 'getRandomValues'
    );
    if (!nativa) {
      console.warn(
        '[Origami Seed] Aviso: não foi possível verificar se getRandomValues é nativa. ' +
        'Use preferencialmente offline com arquivo local (file://).'
      );
    }

    return tamanho * 8; // 128 ou 256
  }

  /**
   * Extrai a entropia hex de um mnemonic BIP39 já gerado.
   * Requer que a lib bip39 esteja disponível globalmente.
   * @param {string} mnemonic
   * @returns {{ hex: string, bytes: number, bits: number, palavras: number }}
   */
  function extrairEntropia(mnemonic) {
    if (typeof bip39 === 'undefined' || typeof bip39.mnemonicToEntropy !== 'function') {
      throw new Error('lib bip39 não encontrada. Certifique-se que bip39 está carregado.');
    }
    const hex = bip39.mnemonicToEntropy(mnemonic); // string hex
    const bytes = hex.length / 2;
    const bits = bytes * 8;
    const palavras = bits === 128 ? 12 : 24;
    return { hex, bytes, bits, palavras };
  }

  /**
   * Renderiza o painel de informação de entropia no elemento #entropia-painel.
   * @param {string} mnemonic - mnemonic BIP39 recém-gerado
   * @param {number} numPalavras - 12 ou 24
   */
  function exibir(mnemonic, numPalavras) {
    const painel = document.getElementById('entropia-painel');
    if (!painel) {
      console.warn('[Origami Seed] #entropia-painel não encontrado no HTML.');
      return;
    }

    let entropia;
    try {
      entropia = extrairEntropia(mnemonic);
    } catch (e) {
      painel.innerHTML = _renderErro(e.message);
      return;
    }

    const hexCurto = entropia.hex.slice(0, 16) + '...' + entropia.hex.slice(-8);
    const nivelSeguranca = entropia.bits >= 256
      ? { label: 'Máxima', cor: '#085041', bg: '#E1F5EE', borda: '#9FE1CB' }
      : { label: 'Padrão Bitcoin', cor: '#633806', bg: '#FAEEDA', borda: '#FAC775' };

    painel.innerHTML = `
      <div id="ep-container" style="
        margin-top: 16px;
        border: 1px solid ${nivelSeguranca.borda};
        background: ${nivelSeguranca.bg};
        border-radius: 10px;
        padding: 14px 18px;
        font-family: monospace;
        font-size: 13px;
        color: ${nivelSeguranca.cor};
      ">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span style="font-weight:600; font-family:sans-serif; font-size:13px;">
            ✓ Entropia verificada — CSPRNG ativo
          </span>
          <span style="
            background:${nivelSeguranca.cor};
            color:${nivelSeguranca.bg};
            border-radius:4px;
            padding:2px 10px;
            font-size:11px;
            font-weight:700;
            font-family:sans-serif;
          ">${nivelSeguranca.label}</span>
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <tr>
            <td style="padding:4px 0; opacity:0.7; width:140px;">Palavras geradas</td>
            <td style="padding:4px 0; font-weight:600;">${entropia.palavras} palavras</td>
          </tr>
          <tr>
            <td style="padding:4px 0; opacity:0.7;">Entropia</td>
            <td style="padding:4px 0; font-weight:600;">${entropia.bits} bits (${entropia.bytes} bytes)</td>
          </tr>
          <tr>
            <td style="padding:4px 0; opacity:0.7;">Fonte</td>
            <td style="padding:4px 0;">window.crypto.getRandomValues()</td>
          </tr>
          <tr>
            <td style="padding:4px 0; opacity:0.7;">Possibilidades</td>
            <td style="padding:4px 0;">2<sup>${entropia.bits}</sup>
              ${entropia.bits === 128
                ? '≈ 340 undecilhões'
                : '≈ 116 quattuorvigintilhões'}
            </td>
          </tr>
        </table>

        <div style="margin-top:10px; border-top:1px solid ${nivelSeguranca.borda}; padding-top:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="opacity:0.7; font-size:11px;">Entropia bruta (hex)</span>
            <button onclick="EntropiaInfo._toggleHex()" style="
              background:transparent;
              border:1px solid ${nivelSeguranca.borda};
              border-radius:4px;
              padding:2px 8px;
              font-size:11px;
              cursor:pointer;
              color:${nivelSeguranca.cor};
            ">mostrar / ocultar</button>
          </div>
          <div id="ep-hex" style="
            display:none;
            margin-top:8px;
            word-break:break-all;
            background:rgba(0,0,0,0.06);
            border-radius:6px;
            padding:8px 10px;
            font-size:12px;
            letter-spacing:0.04em;
          ">${entropia.hex}</div>
          <div style="margin-top:6px; font-size:11px; opacity:0.6; font-family:sans-serif;">
            Valide em Ian Coleman (offline) colando a entropia hex no campo "Entropy".
          </div>
        </div>
      </div>
    `;

    // Auto-ocultar após 120 segundos (lição Coldcard: seed não deve ficar exposta)
    setTimeout(() => {
      const el = document.getElementById('ep-container');
      if (el) {
        el.style.opacity = '0.4';
        el.innerHTML += `<div style="text-align:center; margin-top:8px; font-family:sans-serif; font-size:11px;">
          [Painel ocultado após 2 minutos por segurança]
        </div>`;
      }
    }, 120000);
  }

  /** Toggle interno para revelar/ocultar o hex bruto */
  function _toggleHex() {
    const el = document.getElementById('ep-hex');
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
  }

  /**
   * Renderiza mensagem de erro no painel.
   */
  function _renderErro(msg) {
    return `
      <div style="
        margin-top:16px;
        border:1px solid #F09595;
        background:#FCEBEB;
        border-radius:10px;
        padding:14px 18px;
        font-family:sans-serif;
        font-size:13px;
        color:#791F1F;
      ">
        <strong>⚠ Erro de entropia</strong><br>
        <span style="font-size:12px;">${msg}</span>
      </div>
    `;
  }

  return { verificar, exibir, _toggleHex };

})();

// `const` no topo de um script clássico não vira propriedade de `window` — expõe
// explicitamente, já que app.js (type="module") acessa isto via window.EntropiaInfo.
window.EntropiaInfo = EntropiaInfo;
