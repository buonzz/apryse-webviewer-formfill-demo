//---------------------------------------------------------------------------------------
// Copyright (c) 2001-2023 by Apryse Software Inc. All Rights Reserved.
// Consult legal.txt regarding legal and license information.
//---------------------------------------------------------------------------------------

(exports => {
  // @link PDFNet: https://docs.apryse.com/api/web/Core.PDFNet.html
  // @link PDFNet.TextSearch: https://docs.apryse.com/api/web/Core.PDFNet.TextSearch.html
  // @link PDFNet.PDFDoc: https://docs.apryse.com/api/web/Core.PDFNet.PDFDoc.html
  // @link PDFNet.LinkAnnot: https://docs.apryse.com/api/web/Core.PDFNet.LinkAnnot.html
  // @link Highlights: https://docs.apryse.com/api/web/Core.PDFNet.Highlights.html

  exports.runTextSearchTest = () => {
    const PDFNet = exports.Core.PDFNet;

    const main = async () => {
      // Relative path to the folder containing test files.
      const inputURL = '../TestFiles/';
      const inputFilename = 'credit card numbers.pdf'; // addimage.pdf, newsletter.pdf

      try {
        const doc = await PDFNet.PDFDoc.createFromURL(inputURL + inputFilename);
        doc.initSecurityHandler();
        doc.lock();

        const txtSearch = await PDFNet.TextSearch.create();
        let mode = PDFNet.TextSearch.Mode.e_whole_word + PDFNet.TextSearch.Mode.e_page_stop; // Uses both whole word and page stop
        let pattern = 'joHn sMiTh';

        txtSearch.begin(doc, pattern, mode); // searches for the "pattern" in the document while following the inputted modes.

        let step = 0;

        // call Run() iteratively to find all matching instances of the word 'joHn sMiTh'
        /* eslint-disable-next-line no-constant-condition */
        while (true) {
          const result = await txtSearch.run();
          let hlts;
          if (result.code === PDFNet.TextSearch.ResultCode.e_found) {
            if (step === 0) {
              // Step 0: found "John Smith"
              // note that, here, 'ambient_str' and 'highlights' are not written to,
              // as 'e_ambient_string' and 'e_highlight' are not set.
              console.log(result.out_str + "'s credit card number is: ");

              // now switch to using regular expressions to find John's credit card number
              mode = await txtSearch.getMode();
              mode += PDFNet.TextSearch.Mode.e_reg_expression + PDFNet.TextSearch.Mode.e_highlight;
              txtSearch.setMode(mode);
              pattern = '\\d{4}-\\d{4}-\\d{4}-\\d{4}'; // or "(\\d{4}-){3}\\d{4}"
              txtSearch.setPattern(pattern);

              ++step;
            } else if (step === 1) {
              // step 1: found John's credit card number
              console.log('  ' + result.out_str);
              // note that, here, 'hlts' is written to, as 'e_highlight' has been set.
              // output the highlight info of the credit card number.
              hlts = result.highlights;
              hlts.begin(doc);
              while (await hlts.hasNext()) {
                const highlightPageNum = await hlts.getCurrentPageNumber();
                console.log('The current highlight is from page: ' + highlightPageNum);
                await hlts.next();
              }
              // see if there is an AMEX card number
              pattern = '\\d{4}-\\d{6}-\\d{5}';
              txtSearch.setPattern(pattern);

              ++step;
            } else if (step === 2) {
              // found an AMEX card number
              console.log('\nThere is an AMEX card number:\n  ' + result.out_str);

              // change mode to find the owner of the credit card; supposedly, the owner's
              // name proceeds the number
              mode = await txtSearch.getMode();
              mode += PDFNet.TextSearch.Mode.e_search_up;
              txtSearch.setMode(mode);
              pattern = '[A-z]++ [A-z]++';
              txtSearch.setPattern(pattern);

              ++step;
            } else if (step === 3) {
              // found the owner's name of the AMEX card
              console.log("Is the owner's name:\n  " + result.out_str + '?');

              // add a link annotation based on the location of the found instance
              hlts = result.highlights;
              await hlts.begin(doc); // is await needed?
              while (await hlts.hasNext()) {
                const curPage = await doc.getPage(await hlts.getCurrentPageNumber());
                const quadArr = await hlts.getCurrentQuads();
                for (let i = 0; i < quadArr.length; ++i) {
                  const currQuad = quadArr[i];
                  const x1 = Math.min(Math.min(Math.min(currQuad.p1x, currQuad.p2x), currQuad.p3x), currQuad.p4x);
                  const x2 = Math.max(Math.max(Math.max(currQuad.p1x, currQuad.p2x), currQuad.p3x), currQuad.p4x);
                  const y1 = Math.min(Math.min(Math.min(currQuad.p1y, currQuad.p2y), currQuad.p3y), currQuad.p4y);
                  const y2 = Math.max(Math.max(Math.max(currQuad.p1y, currQuad.p2y), currQuad.p3y), currQuad.p4y);

                  const hyperLink = await PDFNet.LinkAnnot.create(doc, await PDFNet.Rect.init(x1, y1, x2, y2));
                  await hyperLink.setAction(await PDFNet.Action.createURI(doc, 'http://www.apryse.com'));
                  await curPage.annotPushBack(hyperLink);
                }
                hlts.next();
              }
              const docBuffer = await doc.saveMemoryBuffer(PDFNet.SDFDoc.SaveOptions.e_linearized);
              saveBufferAsPDFDoc(docBuffer, 'credit card numbers_linked.pdf');
              break;
            }
          } else if (result.code === PDFNet.TextSearch.ResultCode.e_page) {
            // you can update your UI here, if needed
            console.log('page end');
          } else if (result.code === PDFNet.TextSearch.ResultCode.e_done) {
            break;
          }
        }
      } catch (err) {
        console.log(err);
      }
    };
    // add your own license key as the second parameter, e.g. PDFNet.runWithCleanup(main, 'YOUR_LICENSE_KEY')
    PDFNet.runWithCleanup(main);
  };
})(window);
// eslint-disable-next-line spaced-comment
//# sourceURL=TextSearchTest.js
