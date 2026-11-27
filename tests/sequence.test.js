import test from 'node:test';
import assert from 'node:assert/strict';
import { coverRect, nearestFrame } from '../src/modules/canvasSequence.js';
import { frameUrl } from '../src/modules/preloader.js';
import { validPhone } from '../src/modules/formHandler.js';

test('cover fills portrait, landscape and ultrawide without stretching', () => {
  for (const [w,h] of [[390,844],[1920,1080],[2560,1080],[844,390]]) {
    const rect=coverRect(1920,1080,w,h);
    assert.ok(rect.width>=w && rect.height>=h);
    assert.ok(Math.abs(rect.width/rect.height-16/9)<1e-10);
    assert.ok(Math.abs(rect.x*2+rect.width-w)<1e-10);
    assert.ok(Math.abs(rect.y*2+rect.height-h)<1e-10);
  }
});
test('missing frames use the nearest available frame in either direction', () => {
  const a={},b={};
  assert.equal(nearestFrame([a,null,null,b],2),b);
  assert.equal(nearestFrame([a,null,null,b],1),a);
  assert.equal(nearestFrame([null,null,b],0),b);
  assert.equal(nearestFrame([a,null],999),a);
  assert.equal(nearestFrame([null,null],0),null);
});
test('frame paths work under a GitHub Pages project prefix', () => {
  assert.equal(frameUrl(0,'/heavenly-events/'),'/heavenly-events/frames/frame_0001.webp');
  assert.equal(frameUrl(99,'./'),'./frames/frame_0100.webp');
});
test('phone validation accepts international formatting but rejects punctuation-only and excess digits', () => {
  assert.equal(validPhone('+91 98765 43210'),true);
  assert.equal(validPhone('(212) 555-0199'),true);
  for(const value of ['-------','1234','1234567890123456','hello1234567']) assert.equal(validPhone(value),false);
});
