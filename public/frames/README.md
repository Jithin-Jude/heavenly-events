# Walkthrough frames

The included 100 WebP images are a generated architectural concept for testing. They are not photography of a real venue.

Generate them with `npm run frames:generate`. Existing frames are protected; explicitly use `npm run frames:generate -- --force` to replace them with the demo.

For real footage, capture a smooth, stabilized five-second forward move from entrance to aisle to stage. Keep the stage centered for mobile cover cropping. Use footage you own or have licensed.

With FFmpeg installed, run from the project root:

```sh
ffmpeg -i walkthrough.mp4 -t 5 -vf "fps=20,scale=1600:-2" -frames:v 100 -c:v libwebp -quality 80 -start_number 1 public/frames/frame_%04d.webp
```

FFmpeg prompts before overwriting. Confirm the source spans at least five seconds and verify exactly 100 images, named frame_0001.webp through frame_0100.webp. A 24 fps source is resampled to 20 fps for the fixed 100-frame budget. Aim for 50–150 KB per frame; compare visual quality and transfer size. Avoid scene cuts. Preserve equal frame dimensions.

Replace all demo frames before production and remove the “Illustrative venue concept” label in index.html only when the sequence shows real work. Rebuild after replacing images.
