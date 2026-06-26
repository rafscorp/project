const { Jimp } = require('jimp');

async function removeWhite(fileIn, fileOut) {
  try {
    const image = await Jimp.read(fileIn);
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // If pixel is close to white
      if (red > 200 && green > 200 && blue > 200) {
        this.bitmap.data[idx + 3] = 0; // Alpha to 0
      }
    });

    await image.write(fileOut);
    console.log(`Processed ${fileOut}`);
  } catch(e) {
    console.error(e);
  }
}

async function run() {
  await removeWhite('./public/images/logo-conectaparts.jpg', './public/images/logo-conectaparts-transparent.png');
  await removeWhite('./public/images/icon-conectaparts.png', './public/images/icon-conectaparts-transparent.png');
}
run();
