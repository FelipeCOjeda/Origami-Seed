#!/usr/bin/env bash
# ─────────────────────────────────────────
#  Origami Seed — Inicializador Linux/macOS
# ─────────────────────────────────────────

PORT=8080
URL="http://localhost:$PORT"

echo ""
echo "🦢  Origami Seed"
echo "──────────────────────────────"

# Verifica se Python está disponível
if command -v python3 &>/dev/null; then
  PY="python3"
elif command -v python &>/dev/null; then
  PY="python"
else
  echo "❌  Python não encontrado."
  echo "    Instale via: sudo apt install python3  (Linux)"
  echo "                 brew install python3      (macOS)"
  echo ""
  echo "    Ou abra o index.html diretamente no browser."
  exit 1
fi

echo "✓   Python encontrado: $($PY --version)"
echo "✓   Iniciando servidor em $URL"
echo ""
echo "⚠   Dica: ative o modo avião antes de gerar seeds reais."
echo ""
echo "    Pressione Ctrl+C para encerrar."
echo "──────────────────────────────"
echo ""

# Abre o browser automaticamente
sleep 0.8
if command -v xdg-open &>/dev/null; then
  xdg-open "$URL" &       # Linux
elif command -v open &>/dev/null; then
  open "$URL" &           # macOS
fi

# Inicia o servidor (bloqueia até Ctrl+C)
$PY -m http.server $PORT
