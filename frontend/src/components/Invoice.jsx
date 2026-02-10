import { jsPDF } from "jspdf";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Invoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [invoiceData, setInvoiceData] = useState(null);

  const company = {
    name: "SHOE STORE",
    address: "Shop No. 123, Vytilla Road",
    city: "Ernakulam, Kerala - 682019",
    phone: "+91-9876543210",
    email: "info@shoestore.com",
    gst: "27AABCT1234A1Z0",
    pan: "AABCT1234A"
  };

  const generatePDF = (data) => {
    if (!data) return;
    const { order, customer, totals, invoiceId } = data;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 10;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("SHOE STORE", 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    yPos += 5;
    doc.text(company.address, 14, yPos);
    yPos += 4;
    doc.text(company.city, 14, yPos);
    yPos += 4;
    doc.text(`Phone: ${company.phone} | Email: ${company.email}`, 14, yPos);
    yPos += 4;
    doc.text(`GST: ${company.gst} | PAN: ${company.pan}`, 14, yPos);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("TAX INVOICE", pageWidth / 2, yPos + 5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("(ORIGINAL FOR RECIPIENT)", pageWidth / 2, yPos + 10, { align: "center" });

    yPos += 15;
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 5;

    // Invoice Info
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Invoice No.:", 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(invoiceId, 50, yPos);

    doc.setFont("helvetica", "bold");
    doc.text("Date:", pageWidth / 2 + 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(data.timestamp).toLocaleDateString(), pageWidth / 2 + 40, yPos);

    yPos += 7;
    doc.setFont("helvetica", "bold");
    doc.text("Invoice Date:", 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(data.timestamp).toLocaleDateString(), 50, yPos);

    doc.setFont("helvetica", "bold");
    doc.text("Mode/Terms:", pageWidth / 2 + 20, yPos);
    doc.setFont("helvetica", "normal");
    doc.text("Cash/Online", pageWidth / 2 + 40, yPos);

    yPos += 10;

    // Billing Address
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 14, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 5;
    doc.text(customer.name, 14, yPos);
    yPos += 4;
    doc.text(customer.address, 14, yPos, { maxWidth: pageWidth / 2 - 20 });
    yPos += 8;

    // Shipping Address
    doc.setFont("helvetica", "bold");
    doc.text("Ship To:", pageWidth / 2 + 20, yPos - 8);
    doc.setFont("helvetica", "normal");
    doc.text(customer.name, pageWidth / 2 + 20, yPos - 3);
    doc.text(customer.address, pageWidth / 2 + 20, yPos + 1, { maxWidth: pageWidth / 2 - 20 });

    yPos += 10;
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 5;

    // Table Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("S.No", 14, yPos);
    doc.text("Item Description", 25, yPos);
    doc.text("HSN/SAC", 85, yPos);
    doc.text("Qty", 110, yPos);
    doc.text("Unit", 125, yPos);
    doc.text("Rate", 145, yPos);
    doc.text("Amount", 170, yPos);

    yPos += 4;
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 4;

    // Table Items
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    let sNo = 1;
    let totalTax = 0;
    let subtotal = 0;

    order.forEach((item) => {
      const amount = item.price * item.quantity;
      subtotal += amount;
      
      doc.text(sNo.toString(), 14, yPos);
      doc.text(`${item.name} (${item.size})`, 25, yPos);
      doc.text("6204", 85, yPos);
      doc.text(item.quantity.toString(), 110, yPos);
      doc.text("Pcs", 125, yPos);
      doc.text(item.price.toString(), 145, yPos);
      doc.text(amount.toFixed(2), 170, yPos);
      
      yPos += 5;
      sNo++;
    });

    yPos += 2;
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 4;

    // Totals Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);

    const taxableAmount = subtotal;
    const cgstRate = 9;
    const sgstRate = 9;
    const cgstAmount = (taxableAmount * cgstRate) / 100;
    const sgstAmount = (taxableAmount * sgstRate) / 100;
    const totalTaxAmount = cgstAmount + sgstAmount;
    const finalTotal = taxableAmount + totalTaxAmount;

    // Right align totals
    const rightCol = 145;
    const amountCol = 170;

    doc.text("Sub Total:", rightCol, yPos);
    doc.text(subtotal.toFixed(2), amountCol, yPos);

    yPos += 5;
    doc.text("CGST (9%):", rightCol, yPos);
    doc.text(cgstAmount.toFixed(2), amountCol, yPos);

    yPos += 5;
    doc.text("SGST (9%):", rightCol, yPos);
    doc.text(sgstAmount.toFixed(2), amountCol, yPos);

    yPos += 5;
    doc.line(145, yPos, pageWidth - 14, yPos);
    yPos += 4;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Total Amount:", rightCol, yPos);
    doc.text(`₹ ${finalTotal.toFixed(2)}`, amountCol, yPos);

    yPos += 10;
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 5;

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Amount Chargeable (in words):", 14, yPos);
    yPos += 4;
    doc.text(`INR ${finalTotal.toFixed(2)} Only`, 14, yPos);

    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.text("For Shoe Store", pageWidth - 40, yPos);

    yPos += 15;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("This is a Computer Generated Invoice", 14, pageHeight - 15);
    doc.text("Authorized Signatory", pageWidth - 40, pageHeight - 15);

    doc.save(`Invoice_${invoiceId}.pdf`);
  };

  useEffect(() => {
    let data = location.state;
    if (!data || !data.order) {
      const saved = localStorage.getItem("lastInvoice");
      if (saved) data = JSON.parse(saved);
    }

    if (data && data.order) {
      if (!data.invoiceId) {
        const prefix = "SS";
        const dateStr = Date.now().toString().slice(-6);
        const randomStr = Math.random().toString(36).toUpperCase().substring(2, 5);
        data.invoiceId = `${prefix}-${dateStr}-${randomStr}`;
      }
      
      setInvoiceData(data);
      localStorage.setItem("lastInvoice", JSON.stringify(data));

      if (location.state?.autoDownload) {
        setTimeout(() => generatePDF(data), 1200);
      }
    }
  }, [location.state]);

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <p className="text-neutral-400 mb-4">No invoice data available</p>
          <button 
            onClick={() => navigate("/")}
            className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-neutral-200 transition"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-black px-6 py-12 flex flex-col items-center">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Invoice Header */}
        <div className="p-8 border-b-2 border-gray-300">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight mb-2">{company.name}</h1>
              <p className="text-sm text-gray-700">{company.address}</p>
              <p className="text-sm text-gray-700">{company.city}</p>
              <p className="text-xs text-gray-600 mt-2">GST: {company.gst} | PAN: {company.pan}</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-black text-gray-800">TAX INVOICE</h2>
              <p className="text-[10px] text-gray-600 italic">(ORIGINAL FOR RECIPIENT)</p>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="p-8 grid grid-cols-2 gap-8 border-b-2 border-gray-300">
          <div>
            <p className="text-xs font-bold text-gray-600 uppercase mb-1">Invoice No.</p>
            <p className="text-lg font-bold text-gray-800">#{invoiceData.invoiceId}</p>
            
            <p className="text-xs font-bold text-gray-600 uppercase mt-4 mb-1">Invoice Date</p>
            <p className="text-sm text-gray-800">{new Date(invoiceData.timestamp).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-600 uppercase mb-1">Mode/Terms</p>
            <p className="text-sm text-gray-800">Cash/Online</p>
            
            <p className="text-xs font-bold text-gray-600 uppercase mt-4 mb-1">Reference</p>
            <p className="text-sm text-gray-800">Order Placed</p>
          </div>
        </div>

        {/* Addresses */}
        <div className="p-8 grid grid-cols-2 gap-12 border-b-2 border-gray-300">
          <div>
            <p className="text-xs font-black text-gray-800 uppercase mb-3">Bill To:</p>
            <p className="text-sm font-bold text-gray-800">{invoiceData.customer.name}</p>
            <p className="text-sm text-gray-700 leading-relaxed mt-2">{invoiceData.customer.address}</p>
          </div>
          <div>
            <p className="text-xs font-black text-gray-800 uppercase mb-3">Ship To:</p>
            <p className="text-sm font-bold text-gray-800">{invoiceData.customer.name}</p>
            <p className="text-sm text-gray-700 leading-relaxed mt-2">{invoiceData.customer.address}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-8 border-b-2 border-gray-300">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 font-black text-xs uppercase">
              <tr className="border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left">S.No</th>
                <th className="px-4 py-3 text-left">Item Description</th>
                <th className="px-4 py-3 text-center">HSN/SAC</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-center">Unit</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="font-semibold">
              {invoiceData.order.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="px-4 py-3">{idx + 1}</td>
                  <td className="px-4 py-3">{item.name} ({item.size})</td>
                  <td className="px-4 py-3 text-center">6204</td>
                  <td className="px-4 py-3 text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-center">Pcs</td>
                  <td className="px-4 py-3 text-right">₹{item.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tax Calculations */}
        <div className="p-8">
          <div className="flex justify-end mb-4">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b-2 border-gray-300 font-bold">
                <span>Sub Total:</span>
                <span>₹{invoiceData.totals.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm">CGST (9%):</span>
                <span>₹{(invoiceData.totals.subtotal * 0.09).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b-2 border-gray-300 font-bold">
                <span className="text-sm">SGST (9%):</span>
                <span>₹{(invoiceData.totals.subtotal * 0.09).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between py-3 text-lg font-black text-gray-900">
                <span>Total Amount:</span>
                <span>₹{(invoiceData.totals.subtotal + (invoiceData.totals.subtotal * 0.18)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t-2 border-gray-300">
            <p className="text-xs font-bold text-gray-700 mb-2">AMOUNT CHARGEABLE (In Words):</p>
            <p className="text-sm font-semibold text-gray-800">
              INR {(invoiceData.totals.subtotal + (invoiceData.totals.subtotal * 0.18)).toFixed(2)} Only
            </p>
          </div>

          {/* Download Button */}
          <div className="mt-8 flex gap-4">
            <button 
              onClick={() => generatePDF(invoiceData)}
              className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition active:scale-95"
            >
              Download PDF
            </button>
            <button 
              onClick={() => window.print()}
              className="bg-gray-200 text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition active:scale-95"
            >
              Print Invoice
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-50 border-t-2 border-gray-300 text-xs text-gray-600">
          <div className="flex justify-between">
            <div>
              <p className="font-bold text-gray-700 mb-2">Company Details:</p>
              <p>{company.phone}</p>
              <p>{company.email}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-700 mb-2">Authorized By:</p>
              <p className="mt-6">_________________</p>
              <p className="text-[10px]">Authorized Signatory</p>
            </div>
          </div>
          <p className="text-center mt-4 text-gray-600 italic">This is a Computer Generated Invoice</p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;