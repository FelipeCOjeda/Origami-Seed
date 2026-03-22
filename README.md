# 🦢 Origami Seed

> Gere, valide e guarde sua seed Bitcoin com estilo — 100% offline, zero backend, zero telemetria.

![Bitcoin](https://img.shields.io/badge/Bitcoin-BIP39%20%7C%20BIP84-f7c948?style=flat-square&logo=bitcoin&logoColor=black)
![Offline](https://img.shields.io/badge/Roda-100%25%20Offline-3ddc97?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-white?style=flat-square)

---

## O que é?

**Origami Seed** é uma ferramenta local em HTML/JS puro para:

- Gerar mnemonics BIP39 (12 ou 24 palavras) com CSPRNG do browser
- Validar seeds existentes
- Derivar xpub, zpub e endereços SegWit nativos (BIP84)
- Montar e imprimir um template numerado para backup físico

O nome vem da ideia de dobrar o papel após imprimir — como um origami — escondendo as palavras.

---

## 🎬 Vídeos

| Ep. | Título | Link |
|-----|--------|------|
| 1 | Derivando Endereços Taproot e Testando Carteiras no Ian Coleman | [Assistir](https://www.youtube.com/watch?v=RgJDp-K2VPg) |
| 2 | Projeto GitHub Ganha Interface Gráfica Incrível! | [Assistir](https://www.youtube.com/watch?v=t-raIv8JH3E) |

---

## 🚀 Como usar

### ⚠️ Recomendação de segurança

Requisitos: dê o comando "pip install -r requirements.txt" no terminal com o pc online para atualizar os pacotes.

Antes de gerar uma seed real, **desconecte da internet** (modo avião). Isso garante que nenhum dado trafegue pela rede.

---

### Linux / macOS 

**Opção 1 — Script automático (recomendado):**
```bash
chmod +x start.sh
./start.sh
```

**Opção 2 — Manual:**
```bash
python3 -m http.server 8080
``` 
Depois abra `http://localhost:8080` no browser.

Ou abrir iniciar.sh 
Terminal comando: chmod +x start.sh && ./start.sh
---

### Windows

**Opção 1 — Script automático (recomendado):**

Clique duas vezes em `start.bat`

**Opção 2 — Manual:**

Abra o `Prompt de Comando` na pasta do projeto e rode:
```cmd
python -m http.server 8080
```
Depois abra `http://localhost:8080` no browser.

> **Python não instalado?** Baixe em [python.org](https://www.python.org/downloads/) — marque "Add to PATH" durante a instalação.

---

### Alternativa sem Python (qualquer OS)

Se preferir, abra o `index.html` diretamente no browser clicando duas vezes no arquivo. A maioria das funcionalidades funciona normalmente, exceto em alguns browsers que restringem módulos ES via `file://`.

---

## 📁 Estrutura

```
Origami-Seed/
├── index.html       # Interface principal
├── styles.css       # Estilos
├── app.js           # Lógica BIP39 / BIP84
├── start.sh         # Inicializador Linux/macOS
├── start.bat        # Inicializador Windows
└── README.md
```

---

## 🔐 Segurança & Filosofia

- **Zero backend** — nenhum servidor recebe seus dados
- **Zero telemetria** — nenhum analytics, nenhum tracker
- **Código auditável** — HTML/JS puro, leia antes de usar
- **Libs via CDN** — bip39, bitcoinjs-lib, tiny-secp256k1, bip32 (verifique os hashes se preferir máxima paranoia)
- **Máscara de seed** — oculte as palavras na tela com um clique
- **Aviso de conexão** — banner vermelho se você estiver online ao gerar

> Este projeto **não é uma carteira**. É uma ferramenta de geração e backup de seed. Para usar seus bitcoins, importe a seed em uma carteira como [Sparrow](https://sparrowwallet.com/), [BlueWallet](https://bluewallet.io/) ou [Electrum](https://electrum.org/).

---

## 📜 Licença

MIT — use, modifique, distribua. Sem garantias.

---

<p align="center">
  Feito com ₿ e dobras de papel 🦢
</p>
