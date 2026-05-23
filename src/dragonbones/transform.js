const DEG_TO_RAD = Math.PI / 180;

export function buildPose(project, animationName, timeSeconds) {
  const animation = project.animations.get(animationName) || project.animations.get(project.defaultAnimationName);
  const animationTime = normalizeAnimationTime(animation, timeSeconds);
  const localTransforms = new Map();

  for (const bone of project.bones) {
    const animatedRotation = animation ? sampleBoneRotation(animation, bone.name, animationTime) : 0;
    localTransforms.set(bone.name, {
      ...bone.transform,
      skewX: bone.transform.skewX + animatedRotation,
      skewY: bone.transform.skewY + animatedRotation,
    });
  }

  const worldTransforms = new Map();

  for (const bone of project.bones) {
    computeWorldTransform(bone, project.boneByName, localTransforms, worldTransforms);
  }

  const slotAlpha = new Map();

  if (animation) {
    for (const [slotName, frames] of animation.slotTimelines.entries()) {
      slotAlpha.set(slotName, sampleSlotAlpha(frames, animationTime));
    }
  }

  return {
    animation,
    animationTime,
    worldTransforms,
    slotAlpha,
  };
}

export function createTransformMatrix(transform) {
  const xRad = transform.skewX * DEG_TO_RAD;
  const yRad = transform.skewY * DEG_TO_RAD;

  return {
    a: Math.cos(yRad) * transform.scaleX,
    b: Math.sin(yRad) * transform.scaleX,
    c: -Math.sin(xRad) * transform.scaleY,
    d: Math.cos(xRad) * transform.scaleY,
    e: transform.x,
    f: transform.y,
  };
}

export function multiplyMatrices(parent, child) {
  return {
    a: parent.a * child.a + parent.c * child.b,
    b: parent.b * child.a + parent.d * child.b,
    c: parent.a * child.c + parent.c * child.d,
    d: parent.b * child.c + parent.d * child.d,
    e: parent.a * child.e + parent.c * child.f + parent.e,
    f: parent.b * child.e + parent.d * child.f + parent.f,
  };
}

export function transformPoint(matrix, x, y) {
  return {
    x: matrix.a * x + matrix.c * y + matrix.e,
    y: matrix.b * x + matrix.d * y + matrix.f,
  };
}

function computeWorldTransform(bone, boneByName, localTransforms, worldTransforms) {
  if (worldTransforms.has(bone.name)) {
    return worldTransforms.get(bone.name);
  }

  const localMatrix = createTransformMatrix(localTransforms.get(bone.name));
  let worldMatrix = localMatrix;

  if (bone.parent) {
    const parentBone = boneByName.get(bone.parent);

    if (parentBone) {
      const parentMatrix = computeWorldTransform(parentBone, boneByName, localTransforms, worldTransforms);
      worldMatrix = multiplyMatrices(parentMatrix, localMatrix);
    }
  }

  worldTransforms.set(bone.name, worldMatrix);
  return worldMatrix;
}

function normalizeAnimationTime(animation, timeSeconds) {
  if (!animation || animation.duration <= 0) {
    return 0;
  }

  if (animation.playTimes === 0) {
    return positiveModulo(timeSeconds, animation.duration);
  }

  return Math.min(timeSeconds, animation.duration * animation.playTimes);
}

function sampleBoneRotation(animation, boneName, timeSeconds) {
  const frames = animation.boneTimelines.get(boneName);

  if (!frames || frames.length === 0) {
    return 0;
  }

  const current = findFrame(frames, timeSeconds);
  const next = findNextFrame(frames, current);

  if (!next || current.duration <= 0) {
    return current.rotate;
  }

  const progress = clamp((timeSeconds - current.startTime) / current.duration, 0, 1);
  const eased = applyFrameEasing(progress, current);

  return lerpAngle(current.rotate, next.rotate, eased);
}

function sampleSlotAlpha(frames, timeSeconds) {
  if (!frames || frames.length === 0) {
    return 1;
  }

  const current = findFrame(frames, timeSeconds);
  const next = findNextFrame(frames, current);

  if (!next || current.duration <= 0) {
    return current.alphaMultiplier;
  }

  const progress = clamp((timeSeconds - current.startTime) / current.duration, 0, 1);
  const eased = applyFrameEasing(progress, current);

  return lerp(current.alphaMultiplier, next.alphaMultiplier, eased);
}

function findFrame(frames, timeSeconds) {
  let selected = frames[0];

  for (const frame of frames) {
    if (frame.startTime <= timeSeconds) {
      selected = frame;
    } else {
      break;
    }
  }

  return selected;
}

function findNextFrame(frames, current) {
  const index = frames.indexOf(current);
  return frames[index + 1] || frames[0];
}

function applyFrameEasing(progress, frame) {
  if (frame.curve && frame.curve.length === 4) {
    return cubicBezierY(progress, frame.curve[0], frame.curve[1], frame.curve[2], frame.curve[3]);
  }

  if (typeof frame.tweenEasing === 'number') {
    if (frame.tweenEasing === 0) {
      return progress;
    }

    if (frame.tweenEasing > 0) {
      return Math.pow(progress, 1 + frame.tweenEasing);
    }

    return 1 - Math.pow(1 - progress, 1 - frame.tweenEasing);
  }

  return progress;
}

function cubicBezierY(x, x1, y1, x2, y2) {
  let low = 0;
  let high = 1;
  let t = x;

  for (let i = 0; i < 12; i += 1) {
    t = (low + high) / 2;
    const estimate = cubicBezier(t, 0, x1, x2, 1);

    if (estimate < x) {
      low = t;
    } else {
      high = t;
    }
  }

  return cubicBezier(t, 0, y1, y2, 1);
}

function cubicBezier(t, p0, p1, p2, p3) {
  const inv = 1 - t;
  return inv * inv * inv * p0 + 3 * inv * inv * t * p1 + 3 * inv * t * t * p2 + t * t * t * p3;
}

function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

function lerpAngle(start, end, progress) {
  let delta = end - start;

  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;

  return start + delta * progress;
}

function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
