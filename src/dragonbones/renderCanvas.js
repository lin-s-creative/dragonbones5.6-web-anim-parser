import { createTransformMatrix, multiplyMatrices } from './transform.js';

export function getDragonBonesDrawItems(project, pose, options = {}) {
  const {
    width,
    height,
    scale = 1,
    offsetX,
    offsetY,
  } = options;

  const centerX = offsetX ?? width / 2;
  const centerY = offsetY ?? height / 2;

  return project.drawItems
    .map((item) => {
      const boneMatrix = pose.worldTransforms.get(item.boneName);

      if (!boneMatrix) {
        return null;
      }

      const displayMatrix = createTransformMatrix(item.transform);
      const finalMatrix = multiplyMatrices(boneMatrix, displayMatrix);
      const alpha = pose.slotAlpha.get(item.slotName) ?? 1;
      const texture = item.texture;

      if (!texture || alpha <= 0.01) {
        return null;
      }

      const drawWidth = texture.frameWidth || texture.width;
      const drawHeight = texture.frameHeight || texture.height;
      const localLeft = -drawWidth / 2 - texture.frameX;
      const localTop = -drawHeight / 2 - texture.frameY;

      return {
        item,
        texture,
        alpha,
        drawWidth,
        drawHeight,
        localLeft,
        localTop,
        matrix: {
          a: finalMatrix.a * scale,
          b: finalMatrix.b * scale,
          c: finalMatrix.c * scale,
          d: finalMatrix.d * scale,
          e: centerX + finalMatrix.e * scale,
          f: centerY + finalMatrix.f * scale,
        },
      };
    })
    .filter(Boolean);
}

export function getDragonBonesHitItem(project, pose, point, options = {}) {
  const drawItems = getDragonBonesDrawItems(project, pose, options);

  for (let index = drawItems.length - 1; index >= 0; index -= 1) {
    const drawItem = drawItems[index];
    const localPoint = invertPoint(drawItem.matrix, point);

    if (!localPoint) {
      continue;
    }

    const isInsideX = localPoint.x >= drawItem.localLeft && localPoint.x <= drawItem.localLeft + drawItem.drawWidth;
    const isInsideY = localPoint.y >= drawItem.localTop && localPoint.y <= drawItem.localTop + drawItem.drawHeight;

    if (isInsideX && isInsideY) {
      return drawItem;
    }
  }

  return null;
}

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

  const drawItems = getDragonBonesDrawItems(project, pose, {
    width,
    height,
    scale,
    offsetX,
    offsetY,
  });

  for (const drawItem of drawItems) {
    const { texture } = drawItem;

    ctx.save();
    ctx.globalAlpha *= drawItem.alpha;
    ctx.transform(
      drawItem.matrix.a,
      drawItem.matrix.b,
      drawItem.matrix.c,
      drawItem.matrix.d,
      drawItem.matrix.e,
      drawItem.matrix.f,
    );

    ctx.drawImage(
      image,
      texture.x,
      texture.y,
      texture.width,
      texture.height,
      drawItem.localLeft,
      drawItem.localTop,
      drawItem.drawWidth,
      drawItem.drawHeight,
    );

    ctx.restore();
  }
}

function invertPoint(matrix, point) {
  const determinant = matrix.a * matrix.d - matrix.b * matrix.c;

  if (Math.abs(determinant) < 0.000001) {
    return null;
  }

  const x = point.x - matrix.e;
  const y = point.y - matrix.f;

  return {
    x: (matrix.d * x - matrix.c * y) / determinant,
    y: (-matrix.b * x + matrix.a * y) / determinant,
  };
}
