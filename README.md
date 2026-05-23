# DragonBones Vue + Vite Canvas demo

Основная часть проекта — парсер, который собирает анимацию из экспорта DragonBones на обычном `canvas`. Vue и Vite добавлены для удобства демонстрации.

## В чём смысл

- Нет ссылок на внешние ресурсы, включая CDN.
- Нет `pixi.js` и DragonBones-плагина.
- Анимация вычисляется из DragonBones JSON: bones, slots, skin displays, `rotateFrame` и `colorFrame`.
- Runtime поддерживает только простой subset формата DragonBones, достаточный для текущего экспорта.

## Компонент

Основной файл: `src/components/DragonBonesCanvas.vue`.

Props:

- `armatureName` — имя armature, по умолчанию `Armature`.
- `animationName` — имя animation, по умолчанию `animtion0`.
- `width` — ширина canvas.
- `height` — высота canvas.
- `scale` — масштаб отрисовки skeleton.
- `offsetX` — сдвиг персонажа по X в пикселях canvas от стандартной позиции. Положительное значение двигает вправо, отрицательное — влево.
- `offsetY` — сдвиг персонажа по Y в пикселях canvas от стандартной позиции. Положительное значение двигает вниз, отрицательное — вверх.
- `autoPlay` — запускать автоматически.
- `backgroundColor` — фон canvas.

Стандартная позиция остаётся по центру X и примерно в нижней части canvas по Y. `offsetX` и `offsetY` прибавляются к этой позиции до применения `scale`, поэтому их удобно задавать как обычные пиксельные дельты canvas.
