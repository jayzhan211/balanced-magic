# 魔法是可以配平的

兩人非同步的化學城鎮遊戲。單一 `index.html`，GitHub Pages 直接部署。

- `src/`：原始碼（`data.js` 化學資料、`app.js` 遊戲邏輯、`head.html` 樣式）
- `./build.sh`：把 `src/` 組成 `index.html`
- `node test/check.js index.html`：驗證所有方程式原子守恆、係數唯一、各章材料可取得
- `firestore.rules`：Firestore 安全規則
