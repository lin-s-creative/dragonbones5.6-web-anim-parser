import { createTransformMatrix, multiplyMatrices } from './transform.js';

export function renderDragonBonesCanvas(ctx, project, pose, image, options = {}) {
  const {
    width,
    height,
    scale = 1,
    backgroundColor = 'transparent',
    offsetX,
    offsetY,
  } = options;

  ctx.clearRect(0, 0, width, height);

  if (backgroundColor && backgroundColor !== 'transparent') {
    ctx.save();
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  const centerX = offsetX ?? width / 2;
  const centerY = offsetY ?? height / 2;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);

  for (const item of project.drawItems) {
    const boneMatrix = pose.worldTransforms.get(item.boneName);

    if (!boneMatrix) {
      continue;
    }

    const displayMatrix = createTransformMatrix(item.transform);
    const finalMatrix = multiplyMatrices(boneMatrix, displayMatrix);
    const alpha = pose.slotAlpha.get(item.slotName) ?? 1;

    drawTexturePart(ctx, image, item.texture, finalMatrix, alpha);
  }

  ctx.restore();
}

function drawTexturePart(ctx, image, texture, matrix, alpha) {
  const drawWidth = texture.frameWidth || texture.width;
  const drawHeight = texture.frameHeight || texture.height;

  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);

  if (texture.rotated) {
    ctx.rotate(-Math.PI / 2);
    ctx.drawImage(
      image,
      texture.x,
      texture.y,
      texture.height,
      texture.width,
      -drawHeight / 2 - texture.frameY,
      -drawWidth / 2 - texture.frameX,
      drawHeight,
      drawWidth,
    );
  } else {
    ctx.drawImage(
      image,
      texture.x,
      texture.y,
      texture.width,
      texture.height,
      -drawWidth / 2 - texture.frameX,
      -drawHeight / 2 - texture.frameY,
      drawWidth,
      drawHeight,
    );
  }

  ctx.restore();
}
