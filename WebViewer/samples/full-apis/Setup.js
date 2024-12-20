/* eslint-disable @typescript-eslint/no-unused-vars */
Core.setWorkerPath('../../../lib/core');

function saveBuffer(buf, name, mimetype) {
  const blob = new Blob([buf], {
    type: mimetype,
  });
  saveAs(blob, name);
}

function saveBufferAsPDFDoc(buf, name) {
  saveBuffer(buf, name, 'application/pdf');
}

function saveBufferAsPNG(buf, name) {
  saveBuffer(buf, name, 'image/png');
}

function saveBufferAsXOD(buf, name) {
  saveBuffer(buf, name, 'application/vnd.ms-xpsdocument');
}
