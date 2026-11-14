#!/bin/sh
# 把 src/ 組成單一 index.html（GitHub Pages 直接用）
set -e
cd "$(dirname "$0")"
PAIR=$(cat src/pair.txt)
{
cat src/head.html
cat <<HTML
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
<script>window.__FB_CONFIG=$(cat src/firebase-config.json);</script>
<script>
const PAIR='$PAIR';
// @@DATA_START
HTML
cat src/data.js
cat src/qbank.js
cat src/qbank2.js
cat src/gen.js
cat src/coop.js
echo "// @@DATA_END"
cat src/app.js
echo "</script>"
echo "</body>"
echo "</html>"
} > index.html
echo "built index.html ($(wc -c < index.html) bytes)"
