import React from 'react';
import { useParams } from 'react-router-dom';

const TicketConfirmation = () => {
  const { ticketId } = useParams();

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-green-400">Purchase Successful!</h2>
      <div className="space-y-4">
        <p className="text-gray-300">Your Ticket ID:</p>
        <div className="p-4 bg-gray-700 rounded-lg break-words font-mono">
          {ticketId}
        </div>
        <div className="space-y-2">
          <button 
            onClick={() => navigator.clipboard.writeText(ticketId)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded"
          >
            Copy Ticket ID
          </button>
          <button 
            onClick={() => window.print()}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 px-4 rounded"
          >
            Print Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketConfirmation;