import React from "react";
import QRCode from "qrcode.react";
import jsPDF from "jspdf";

const TicketPage = ({ orderId, ticketId, eventName, attendeeName }) => {
  const ticketData = {
    orderId: orderId || "ORDER12345",
    ticketId: ticketId || "TICKET67890",
    eventName: eventName || "Event Name",
    attendeeName: attendeeName || "John Doe",
    date: "October 15, 2023",
    time: "10:00 AM",
    location: "123 Main Street",
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Order ID: ${ticketData.orderId}`, 10, 10);
    doc.text(`Ticket ID: ${ticketData.ticketId}`, 10, 20);
    doc.text(`Event: ${ticketData.eventName}`, 10, 30);
    doc.text(`Attendee: ${ticketData.attendeeName}`, 10, 40);
    doc.text(`Date: ${ticketData.date}`, 10, 50);
    doc.text(`Time: ${ticketData.time}`, 10, 60);
    doc.text(`Location: ${ticketData.location}`, 10, 70);
    // Using QRCode's toCanvas method to capture the QR code as an image for the PDF
    const qrCodeImage = new QRCode({
      value: `Order ID: ${ticketData.orderId}\nTicket ID: ${ticketData.ticketId}`,
      size: 100,
    });
    qrCodeImage.toCanvas((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      doc.addImage(imgData, "PNG", 10, 80, 50, 50);
      doc.save("ticket.pdf");
    });
  };

  return (
    <div
      className="relative ticket-page p-8 rounded-lg max-w-md mx-auto overflow-hidden"
      style={{ backgroundColor: "#000" }}
    >
      {/* Gradient Overlays (ensure these classes are defined in your global CSS) */}
      <div className="absolute z-0 w-[40%] h-[35%] top-0 left-0 pink__gradient" />
      <div
        className="absolute z-0 w-[80%] h-[80%] rounded-full white__gradient"
        style={{ bottom: "20%", left: "10%" }}
      />
      <div className="absolute z-0 w-[50%] h-[50%] right-0 bottom-0 blue__gradient" />

      {/* Ticket Content */}
      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-white mb-4">Your Ticket</h2>

        {/* QR Code Section with a Radial Gradient Background */}
        <div
          className="flex justify-center mb-6 p-4"
          style={{
            background: "radial-gradient(circle, #FFDEE9, #B5FFFC)",
            borderRadius: "50%",
          }}
        >
          <QRCode
            value={`Order ID: ${ticketData.orderId}\nTicket ID: ${ticketData.ticketId}`}
            size={128}
          />
        </div>

        {/* Ticket Details */}
        <div className="text-white space-y-2">
          <p>Order ID: {ticketData.orderId}</p>
          <p>Ticket ID: {ticketData.ticketId}</p>
          <p>Event: {ticketData.eventName}</p>
          <p>Attendee: {ticketData.attendeeName}</p>
          <p>Date: {ticketData.date}</p>
          <p>Time: {ticketData.time}</p>
          <p>Location: {ticketData.location}</p>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownloadPDF}
          className="w-full py-4 bg-secondary rounded-lg font-medium text-black hover:bg-green-500 transition-colors duration-300 mt-6"
        >
          Download Ticket
        </button>
      </div>
    </div>
  );
};

export default TicketPage;
