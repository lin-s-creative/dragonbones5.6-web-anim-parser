export function parseDragonBonesProject(skeletonData, atlasData, armatureName) {
  const armature = selectArmature(skeletonData, armatureName);
  const textureRegions = indexTextureRegions(atlasData);
  const bones = (armature.bone || []).map((bone) => ({
    name: bone.name,
    parent: bone.parent || null,
    length: numberOrZero(bone.length),
    transform: normalizeTransform(bone.transform),
  }));

  const boneByName = new Map(bones.map((bone) => [bone.name, bone]));
  const drawItems = buildDrawItems(armature, textureRegions, boneByName);
  const animations = new Map((armature.animation || []).map((animation) => [
    animation.name,
    normalizeAnimation(animation, skeletonData.frameRate || armature.frameRate || 24),
  ]));

  return {
    name: skeletonData.name || armature.name,
    armature,
    frameRate: skeletonData.frameRate || armature.frameRate || 24,
    canvas: armature.canvas || skeletonData.canvas || null,
    aabb: armature.aabb || null,
    bones,
    boneByName,
    drawItems,
    animations,
    defaultAnimationName: getDefaultAnimationName(armature),
  };
}

function selectArmature(skeletonData, armatureName) {
  const armatures = skeletonData.armature || [];
  const armature = armatures.find((item) => item.name === armatureName) || armatures[0];

  if (!armature) {
    throw new Error('DragonBones skeleton does not contain armature data.');
  }

  return armature;
}

function indexTextureRegions(atlasData) {
  const map = new Map();

  for (const region of atlasData.SubTexture || []) {
    map.set(region.name, {
      name: region.name,
      x: numberOrZero(region.x),
      y: numberOrZero(region.y),
      width: numberOrZero(region.width),
      height: numberOrZero(region.height),
      frameX: numberOrZero(region.frameX),
      frameY: numberOrZero(region.frameY),
      frameWidth: numberOrZero(region.frameWidth || region.width),
      frameHeight: numberOrZero(region.frameHeight || region.height),
      rotated: Boolean(region.rotated),
    });
  }

  return map;
}

function buildDrawItems(armature, textureRegions, boneByName) {
  const slotByName = new Map((armature.slot || []).map((slot, index) => [slot.name, { ...slot, zIndex: index }]));
  const defaultSkin = (armature.skin || [])[0];

  if (!defaultSkin) {
    return [];
  }

  const drawItems = [];

  for (const skinSlot of defaultSkin.slot || []) {
    const slot = slotByName.get(skinSlot.name);
    const display = (skinSlot.display || [])[0];

    if (!slot || !display) {
      continue;
    }

    const texture = textureRegions.get(display.name);
    const parentBone = boneByName.get(slot.parent);

    if (!texture || !parentBone) {
      continue;
    }

    drawItems.push({
      slotName: slot.name,
      boneName: slot.parent,
      displayName: display.name,
      transform: normalizeTransform(display.transform),
      texture,
      zIndex: slot.zIndex,
    });
  }

  return drawItems.sort((a, b) => a.zIndex - b.zIndex);
}

function normalizeAnimation(animation, frameRate) {
  const durationFrames = numberOrZero(animation.duration);
  const duration = durationFrames / frameRate;

  return {
    name: animation.name,
    frameRate,
    durationFrames,
    duration,
    playTimes: animation.playTimes ?? 1,
    boneTimelines: new Map((animation.bone || []).map((timeline) => [
      timeline.name,
      normalizeRotateFrames(timeline.rotateFrame || [], frameRate),
    ])),
    slotTimelines: new Map((animation.slot || []).map((timeline) => [
      timeline.name,
      normalizeColorFrames(timeline.colorFrame || [], frameRate),
    ])),
  };
}

function normalizeRotateFrames(frames, frameRate) {
  let cursorFrames = 0;

  return frames.map((frame) => {
    const startFrame = cursorFrames;
    const durationFrames = numberOrZero(frame.duration);
    cursorFrames += durationFrames;

    return {
      startFrame,
      durationFrames,
      startTime: startFrame / frameRate,
      duration: durationFrames / frameRate,
      rotate: numberOrZero(frame.rotate),
      curve: frame.curve || null,
      tweenEasing: frame.tweenEasing,
    };
  });
}

function normalizeColorFrames(frames, frameRate) {
  let cursorFrames = 0;

  return frames.map((frame) => {
    const startFrame = cursorFrames;
    const durationFrames = numberOrZero(frame.duration);
    cursorFrames += durationFrames;

    return {
      startFrame,
      durationFrames,
      startTime: startFrame / frameRate,
      duration: durationFrames / frameRate,
      alphaMultiplier: (frame.value?.aM ?? 100) / 100,
      curve: frame.curve || null,
      tweenEasing: frame.tweenEasing,
    };
  });
}

function normalizeTransform(transform = {}) {
  return {
    x: numberOrZero(transform.x),
    y: numberOrZero(transform.y),
    skewX: numberOrZero(transform.skX),
    skewY: numberOrZero(transform.skY),
    scaleX: transform.scX ?? 1,
    scaleY: transform.scY ?? 1,
  };
}

function getDefaultAnimationName(armature) {
  const action = (armature.defaultActions || [])[0];
  return action?.gotoAndPlay || (armature.animation || [])[0]?.name || '';
}

function numberOrZero(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}
