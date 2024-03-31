const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');

function createBill(employeeName, order, detailsOrder) {
    const fileName = 'bill.pdf'
    const outputPath = path.join(__dirname, '..', 'public', 'Bill', fileName);
    const stream = fs.createWriteStream(outputPath, { encoding: 'utf8' });
    stream.write('\uFEFF', 'utf8');

    const doc = new PDFDocument();

    doc.pipe(stream);

    doc.text(`------------Recent Order------------`);
    doc.text(`====================================`);
    doc.text(`Customer's Phone: ${order.customerPhone}`);
    doc.text(`Customer's Name: ${order.customerName}`);
    doc.text(`Customer's Address: ${order.customerAddress}`);
    doc.text(`Quantity of products: ${order.totalQuantity}`);
    doc.text(`Total price: $${order.totalPrice}`);
    doc.text(`Received: $${order.received}`);
    doc.text(`Refunds: $${order.refunds}`);
    doc.text(`Date creation: ${order.creation_date}`);
    doc.text(`====================================`);
    doc.text(`List products:`);
    doc.text(`Barcode - Name - Quantity - Total price`);

    detailsOrder.forEach(detail => {
        doc.text(`${detail.productBarcode} - ${detail.productName} - ${detail.quantity} - $${detail.totalPrice}`);
    })

    doc.end();

    stream.on('finish', () => {
        console.log('Create bill success');
        return outputPath
    });
}

module.exports = createBill