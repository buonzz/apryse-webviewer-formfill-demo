//---------------------------------------------------------------------------------------
// Copyright (c) 2001-2023 by Apryse Software Inc. All Rights Reserved.
// Consult legal.txt regarding legal and license information.
//---------------------------------------------------------------------------------------

(exports => {
  // @link PDFNet: https://docs.apryse.com/api/web/Core.PDFNet.html
  // @link PDFNet.PDFDoc: https://docs.apryse.com/api/web/Core.PDFNet.PDFDoc.html
  // @link PDFNet.Rect: https://docs.apryse.com/api/web/Core.PDFNet.Rect.html

  exports.runRectTest = () => {
    const PDFNet = exports.Core.PDFNet;

    const main = async () => {
      let ret = 0;
      try {
        console.log('Beginning Rect Test. This test will take the rect box of an image and move/translate it');

        const inputPath = '../TestFiles/';
        const doc = await PDFNet.PDFDoc.createFromURL(inputPath + 'tiger.pdf');
        doc.initSecurityHandler();
        doc.lock();
        console.log('PDF document initialized and locked');

        const pgItr1 = await doc.getPageIterator();
        const mediaBox = await (await pgItr1.current()).getMediaBox();
        mediaBox.x1 -= 200; // translate page 200 units left(1 uint = 1/72 inch)
        mediaBox.x2 -= 200;

        await mediaBox.update();

        const docbuf = await doc.saveMemoryBuffer(PDFNet.SDFDoc.SaveOptions.e_linearized);
        saveBufferAsPDFDoc(docbuf, 'tiger_shift.pdf');
        console.log('Done.');
      } catch (err) {
        console.log(err);
        ret = 1;
      }
      return ret;
    };
    // add your own license key as the second parameter, e.g. PDFNet.runWithCleanup(main, 'YOUR_LICENSE_KEY')
    PDFNet.runWithCleanup(main);
  };
})(window);
// eslint-disable-next-line spaced-comment
//# sourceURL=AnnotationTest.js
