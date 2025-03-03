import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase";

const PaymentSetup = () => {
  const { user } = useAuth();
  const [paystackPublicKey, setPaystackPublicKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null); // { message: string, type: "success" | "error" }

  // Utility to show custom popup alert for 3 seconds
  const showPopup = (message, type = "success") => {
    setPopup({ message, type });
    setTimeout(() => setPopup(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation: ensure the key starts with "pk_test_"
    if (!paystackPublicKey.startsWith("pk_test_")) {
      showPopup("Please enter a valid test public key", "error");
      setLoading(false);
      return;
    }

    // Extra check: ensure the user is authenticated
    if (!user || !user.uid) {
      showPopup("User not authenticated", "error");
      setLoading(false);
      return;
    }

    try {
      // Write the payment information to the 'creators' collection
      await setDoc(doc(db, "creators", user.uid), {
        paystackPublicKey,
        createdAt: new Date().toISOString(),
      });
      showPopup("Payment information configured successfully!", "success");
    } catch (error) {
      console.error("Error saving payment information:", error);
      showPopup("Failed to configure payment information", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg relative">
      {/* Custom Popup Alert */}
      {popup && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black px-6 py-3 rounded shadow-lg flex items-center gap-2">
          {popup.type === "success" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
          <span
            className={`text-sm ${
              popup.type === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {popup.message}
          </span>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 text-purple-400">
        Configure Payment Information
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Paystack Public Key
            <span className="text-xs text-gray-500 block mt-1">
              (Enter your test public key beginning with "pk_test_")
            </span>
          </label>
          <input
            type="text"
            value={paystackPublicKey}
            onChange={(e) => setPaystackPublicKey(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded text-white"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? "Configuring..." : "Configure Payment Information"}
        </button>
      </form>

      <div className="mt-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-lg font-bold mb-2 text-purple-300">
          How to Set Up Your Paystack Account:
        </h3>
        <ol className="list-decimal list-inside text-sm space-y-2">
          <li>
            Go to{" "}
            <a
              href="https://paystack.com"
              className="text-blue-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              paystack.com
            </a>{" "}
            and sign up for an account.
          </li>
          <li>
            Complete any required identity or business verification steps as
            guided by Paystack.
          </li>
          <li>
            Once your account is active, navigate to{" "}
            <strong>Settings → API Keys & Webhooks</strong>.
          </li>
          <li>
            Enable Test Mode (this allows you to simulate payments without
            processing real money).
          </li>
          <li>
            Copy your <strong>"Test Public Key"</strong> (it should begin with
            "pk_test_") and paste it into the field above.
          </li>
          <li>
            Click the "Configure Payment Information" button to save your
            payment settings.
          </li>
        </ol>
      </div>
    </div>
  );
};

export default PaymentSetup;
