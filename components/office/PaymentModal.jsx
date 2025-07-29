import React from 'react';

export default function PaymentModal({ isOpen, onClose, onPayNow, onPayLater, jobData }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Job #{jobData?.id} Completed</h2>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            The job has been completed and an invoice has been created.
          </p>
          
          {jobData?.client && (
            <div className="bg-gray-50 p-3 rounded mb-4">
              <p className="font-medium">Client: {jobData.client.first_name} {jobData.client.last_name}</p>
              {jobData.vehicle && (
                <p className="text-sm text-gray-600">
                  Vehicle: {jobData.vehicle.licence_plate} - {jobData.vehicle.make} {jobData.vehicle.model}
                </p>
              )}
            </div>
          )}
          
          <p className="text-sm text-gray-600">
            Would you like to process payment now or leave the invoice for later collection?
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onPayNow}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
          >
            💳 Pay Now
          </button>
          <button
            onClick={onPayLater}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
          >
            ⏰ Pay Later
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="mt-3 w-full text-gray-500 hover:text-gray-700 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
} 