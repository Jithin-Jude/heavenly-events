import sharp from 'sharp';
import { mkdir, access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const output = fileURLToPath(new URL('../public/frames/', import.meta.url));
const force = process.argv.includes('--force');
const width = 1280, height = 720;
const logo = (await readFile(new URL('../public/heavenly-events-logo.png', import.meta.url))).toString('base64');
await mkdir(output, { recursive: true });

// Do not silently replace footage. Generated assets are a stylized spatial
// concept, not a claim that this is a real completed Heavenly Events venue.
for (let i = 1; i <= 100; i++) {
  try {
    await access(path.join(output, `frame_${String(i).padStart(4, '0')}.webp`));
    if (!force) throw new Error('EXISTS');
  } catch (error) {
    if (error.message === 'EXISTS') {
      console.error('Frames already exist. Use --force only to replace them with demo frames.');
      process.exit(1);
    }
    if (error.code !== 'ENOENT') throw error;
  }
}

function scene(frame) {
  const camera = (frame / 99) * 22;
  const focal = 690;
  const project = (x, y, z) => {
    const scale = focal / (z - camera + 5);
    return [width / 2 + x * scale, height * .46 - (y - 2.8) * scale];
  };
  const point = p => p.map(n => n.toFixed(2)).join(',');
  const polygon = (points, fill, stroke = 'none', sw = 1) => `<polygon points="${points.map(point).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const line = (a, b, stroke, sw = 1) => `<path d="M${point(a)}L${point(b)}" stroke="${stroke}" stroke-width="${sw}" fill="none"/>`;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="room"><stop stop-color="#6d5733"/><stop offset=".46" stop-color="#27251c"/><stop offset="1" stop-color="#070d0b"/></radialGradient>
    <linearGradient id="floor" x2="0" y2="1"><stop stop-color="#555044"/><stop offset="1" stop-color="#171d19"/></linearGradient>
    <linearGradient id="aisle" x2="0" y2="1"><stop stop-color="#bbac87"/><stop offset="1" stop-color="#4c5146"/></linearGradient>
    <linearGradient id="gold"><stop stop-color="#69542e"/><stop offset=".4" stop-color="#ead8a4"/><stop offset=".6" stop-color="#b89b58"/><stop offset="1" stop-color="#574322"/></linearGradient>
    <radialGradient id="glow"><stop stop-color="#fff1b4" stop-opacity=".6"/><stop offset="1" stop-color="#eac266" stop-opacity="0"/></radialGradient>
    <linearGradient id="curtain"><stop stop-color="#686448"/><stop offset=".5" stop-color="#c3b68a"/><stop offset="1" stop-color="#4b4e3c"/></linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#room)"/>
  <path d="M0 410L640 330 1280 410V720H0Z" fill="url(#floor)"/>`;
  s += polygon([project(-2, 0, 1 + camera),project(2,0,1 + camera),project(2,0,39),project(-2,0,39)],'url(#aisle)');
  for(let x = -12; x <= 12; x += 2) s += line(project(x,0,camera+1),project(x,0,43),'#b8a77322');
  for(let z = 4; z <= 42; z += 2) if(z > camera + 1) s += line(project(-12,0,z),project(12,0,z),'#c4b58e22');
  // The stage, drapes, steps and sofa converge around a shared vanishing point.
  const stageZ = 38;
  s += polygon([project(-6,0,stageZ),project(6,0,stageZ),project(6,8,stageZ),project(-6,8,stageZ)],'#151d17');
  for(let x=-5.8;x<6;x+=.4) s += polygon([project(x,0,stageZ-.1),project(x+.37,0,stageZ-.1),project(x+.37,7.8,stageZ-.1),project(x,7.8,stageZ-.1)],'url(#curtain)');
  for(let n=0;n<3;n++) s += polygon([project(-6-n*.4,-n*.12,stageZ-1-n),project(6+n*.4,-n*.12,stageZ-1-n),project(6+n*.4,.22-n*.12,stageZ-1-n),project(-6-n*.4,.22-n*.12,stageZ-1-n)],'#baae86','#dfcc94',1);
  const arch = (z, halfWidth, top, color, weight) => {
    const l=project(-halfWidth,0,z), r=project(halfWidth,0,z), a=project(-halfWidth,top*.65,z), b=project(halfWidth,top*.65,z), c=project(0,top*1.35,z);
    return `<path d="M${point(l)}L${point(a)}Q${point(c)} ${point(b)}L${point(r)}" fill="none" stroke="${color}" stroke-width="${weight}"/>`;
  };
  s += arch(37.8,3.7,7,'url(#gold)',12);
  s += arch(37.7,3.35,6.7,'#ddc588',2);
  const sofaA = project(-1.5,.4,36), sofaB=project(1.5,1.4,36);
  s += `<rect x="${sofaA[0]}" y="${sofaB[1]}" width="${sofaB[0]-sofaA[0]}" height="${sofaA[1]-sofaB[1]}" rx="10" fill="#dfd4b7" stroke="#baa164" stroke-width="3"/>`;
  const emblem = project(-3,6.8,37);
  const emblemSize = focal/(42-camera)*6;
  s += `<image x="${emblem[0]}" y="${emblem[1]}" width="${emblemSize}" height="${emblemSize}" href="data:image/png;base64,${logo}"/>`;
  // Render distant architecture before nearby architecture for correct occlusion.
  for(let z=34;z>=2;z-=4) {
    if(z-camera < 1.4) continue;
    const scale=focal/(z-camera+5);
    s += arch(z,5.3,8.7,'url(#gold)',Math.max(3,scale*.1));
    s += arch(z+.1,5.05,8.4,'#a99c6b66',Math.max(1,scale*.025));
    for(const side of [-1,1]) {
      // An abundance of deterministic ivory florals, eucalyptus and candlelight.
      for(let k=0;k<72;k++) {
        const t=k/71, angle=k*2.39996;
        const x=side*(5.18 - Math.sin(t*Math.PI)*.12) + Math.sin(angle)*.22;
        const y=t*7.15;
        const p=project(x,y,z-.12);
        s += `<ellipse cx="${p[0]}" cy="${p[1]}" rx="${scale*(.12+(k%4)*.025)}" ry="${scale*.13}" fill="${['#c9c6a6','#e3dac0','#f1e7cd','#8d9b72','#3a5140'][k%5]}" opacity=".92"/>`;
      }
      const p=project(side*2.55,.65,z), base=project(side*2.55,0,z);
      s+=line(base,p,'#c2a66a',Math.max(2,scale*.035));
      s+=`<ellipse cx="${p[0]}" cy="${p[1]}" rx="${scale*.6}" ry="${scale*.43}" fill="#3f503a"/>`;
      for(let k=0;k<16;k++) {
        const angle=k*2.39996, radius=Math.sqrt(k/16)*.53;
        const q=project(side*2.55+Math.cos(angle)*radius,.8+Math.sin(angle)*radius*.6,z-.12);
        s+=`<circle cx="${q[0]}" cy="${q[1]}" r="${scale*.13}" fill="${['#e9dfc7','#c7c3a0','#f0e5ce'][k%3]}"/>`;
      }
      const candle=project(side*2.1,.35,z-1);
      s+=`<ellipse cx="${candle[0]}" cy="${candle[1]}" rx="${scale*.6}" ry="${scale*.8}" fill="url(#glow)"/><rect x="${candle[0]-scale*.04}" y="${candle[1]}" width="${scale*.08}" height="${scale*.2}" fill="#eee0ac"/><ellipse cx="${candle[0]}" cy="${candle[1]-scale*.035}" rx="${scale*.025}" ry="${scale*.05}" fill="#fff4c6"/>`;
    }
    const ch=project(0,6.3,z+1);
    s+=line(project(0,9,z+1),ch,'#c3a66b',Math.max(1,scale*.025));
    s+=`<ellipse cx="${ch[0]}" cy="${ch[1]}" rx="${scale*1.6}" ry="${scale*1.1}" fill="url(#glow)"/>`;
    for(let k=-5;k<=5;k++) {
      const q=project(k*.2,6.25-Math.cos(k*.25)*.35,z+1);
      s+=line(ch,q,'#cbb47c',Math.max(1,scale*.015));
      s+=line(q,[q[0],q[1]+scale*(.2+(.5-Math.abs(k)*.08))],'#eadfb2',Math.max(1,scale*.025));
      s+=`<circle cx="${q[0]}" cy="${q[1]}" r="${Math.max(1,scale*.035)}" fill="#fff4cd"/>`;
    }
  }
  s += '<rect width="1280" height="720" fill="#101408" opacity=".08"/></svg>';
  return s;
}

for(let index=0;index<100;index++) {
  await sharp(Buffer.from(scene(index))).webp({ quality: 82, effort: 4 }).toFile(path.join(output, `frame_${String(index+1).padStart(4,'0')}.webp`));
  if((index+1)%20===0) console.log(`Generated ${index+1}/100 frames`);
}
console.log('Demo sequence ready. Replace with licensed venue footage before launch.');
