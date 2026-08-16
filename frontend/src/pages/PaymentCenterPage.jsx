import { useState } from "react";
import { CreditCard, Wallet, FileText, CheckCircle, RefreshCw, Send, ArrowRight, Star, AlertTriangle, ShieldCheck } from "lucide-react";
import useSeo from "../hooks/useSeo";

export default function PaymentCenterPage() {
  useSeo("Payment Center | Yatri.in");

  const [activeSubTab, setActiveSubTab] = useState("wallet"); // wallet, history, payouts, checkout
  const [walletBalance, setWalletBalance] = useState(4500);
  const [topUpAmount, setTopUpAmount] = useState("2000");
  const [walletLedger, setWalletLedger] = useState([
    { id: "tx_101", desc: "Refund - Hotel Booking Cancellation", amount: "+ Rs. 3,500", type: "credit", date: "July 28, 2026" },
    { id: "tx_102", desc: "Payment - Heritage Tour Walk", amount: "- Rs. 1,800", type: "debit", date: "July 25, 2026" }
  ]);

  const [paymentHistory, setPaymentHistory] = useState([
    { id: "REF-2201", item: "Hotel Grand Horizon stay", gateway: "Stripe", date: "July 28, 2026", status: "Success", amount: 10500 },
    { id: "REF-2209", item: "Amber Fort Photo Walk", gateway: "Razorpay", date: "July 25, 2026", status: "Success", amount: 1800 },
    { id: "REF-2300", item: "Desert Camping Experience", gateway: "Wallet Balance", date: "July 22, 2026", status: "Refunded", amount: 3500 }
  ]);

  // Payout requests (for hotel owners and tour guides)
  const [earnings, setEarnings] = useState({ total: 38400, pending: 8200 });
  const [payoutsList, setPayoutsList] = useState([
    { id: "PO-7780", bank: "State Bank of India (***3241)", amount: 12000, date: "July 20, 2026", status: "Completed" }
  ]);
  const [payoutForm, setPayoutForm] = useState({ amount: "5000", bank: "State Bank of India (***3241)" });

  // Checkout simulator
  const [checkoutGateway, setCheckoutGateway] = useState("stripe"); // stripe, razorpay
  const [checkoutStep, setCheckoutStep] = useState("inputs"); // inputs, loading, success
  const [cardName, setCardName] = useState("Vikram Malhotra");
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");

  const handleTopUp = (e) => {
    e.preventDefault();
    const parsed = Number(topUpAmount);
    if (!parsed || parsed <= 0) return;
    setWalletBalance(prev => prev + parsed);
    setWalletLedger([
      { id: "tx_" + Date.now(), desc: "Wallet Deposit (Stripe Top-up)", amount: `+ Rs. ${parsed.toLocaleString()}`, type: "credit", date: "Today" },
      ...walletLedger
    ]);
    setTopUpAmount("");
    alert("Wallet balance successfully topped up!");
  };

  const handlePayoutRequest = (e) => {
    e.preventDefault();
    const amt = Number(payoutForm.amount);
    if (!amt || amt <= 0 || amt > earnings.total) {
      alert("Invalid payout amount");
      return;
    }
    setEarnings(prev => ({ ...prev, total: prev.total - amt, pending: prev.pending + amt }));
    setPayoutsList([
      { id: "PO-" + Math.floor(Math.random() * 9000 + 1000), bank: payoutForm.bank, amount: amt, date: "Just Now", status: "Pending Approval" },
      ...payoutsList
    ]);
    setPayoutForm({ ...payoutForm, amount: "" });
    alert("Withdrawal payout request submitted successfully!");
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    setCheckoutStep("loading");
    setTimeout(() => {
      setCheckoutStep("success");
    }, 2000);
  };

  const triggerDownloadInvoice = (item) => {
    const headers = "InvoiceID,Description,PaidVia,TotalAmount,Taxes\n";
    const data = `INV-8802,${item.item},${item.gateway},Rs. ${item.amount},GST Included (18%)`;
    const blob = new Blob([headers + data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `invoice_${item.id}.csv`);
    a.click();
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header bar */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-900 via-slate-900 to-slate-900 p-6 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Secure Payments Desk</span>
          <h1 className="text-3xl font-extrabold mt-1">Payment Gateway & Financial Dashboard</h1>
          <p className="text-sm text-slate-300 mt-1">Manage wallet deposits, download tax invoices, and request owner payouts.</p>
        </div>
        <div className="flex gap-2">
          {["wallet", "history", "payouts", "checkout"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold capitalize transition shadow ${
                activeSubTab === tab ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {tab === "wallet" ? "My Wallet" : tab === "payouts" ? "Payouts Desk" : tab === "history" ? "Payment Ledger" : "Simulate Checkout"}
            </button>
          ))}
        </div>
      </div>

      {/* Wallet Tab */}
      {activeSubTab === "wallet" && (
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-fit">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Internal Wallet Balance</h3>
            <div className="p-5 bg-sky-50 dark:bg-slate-950 border border-sky-100 dark:border-slate-850 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Available Funds</span>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                Rs. {walletBalance.toLocaleString()}
              </p>
            </div>
            <form onSubmit={handleTopUp} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Top-up amount (Rs)</label>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                  required
                />
              </div>
              <button className="w-full rounded-xl bg-emerald-500 py-2.5 text-white font-bold hover:bg-emerald-600 transition">
                Load Money via Stripe
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Wallet Activity Ledger</h3>
            <div className="space-y-3">
              {walletLedger.map((w) => (
                <div key={w.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white">{w.desc}</span>
                    <p className="text-[10px] text-slate-450 mt-0.5">{w.date} • TransID: {w.id}</p>
                  </div>
                  <span className={`font-black text-sm ${w.type === "credit" ? "text-emerald-600" : "text-rose-600"}`}>
                    {w.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment Ledger Tab */}
      {activeSubTab === "history" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Payment Ledger & Receipts</h3>
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <th className="pb-3">Reference ID</th>
                <th className="pb-3">Booked Item</th>
                <th className="pb-3">Payment Channel</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Invoices</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paymentHistory.map((item) => (
                <tr key={item.id} className="text-slate-700 dark:text-slate-300">
                  <td className="py-3 font-mono font-bold text-sky-500">#{item.id}</td>
                  <td className="py-3 font-bold">{item.item}</td>
                  <td className="py-3">{item.gateway}</td>
                  <td className="py-3 font-black">Rs. {item.amount.toLocaleString()}</td>
                  <td className="py-3 font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${item.status === "Success" ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-sky-800"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => triggerDownloadInvoice(item)}
                      className="rounded border border-slate-300 px-2 py-1 font-bold dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-950"
                    >
                      Download CSV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payouts Tab */}
      {activeSubTab === "payouts" && (
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm h-fit">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 font-bold">Earnings & Payout Requests</h3>
            <div className="grid grid-cols-2 gap-3 text-center mb-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400">Total Earnings</span>
                <p className="text-xl font-black text-slate-800 dark:text-white">Rs. {earnings.total.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400">Pending Payouts</span>
                <p className="text-xl font-black text-amber-500">Rs. {earnings.pending.toLocaleString()}</p>
              </div>
            </div>
            <form onSubmit={handlePayoutRequest} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Withdrawal Amount (Rs)</label>
                <input
                  type="number"
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                  required
                />
              </div>
              <button className="w-full rounded-xl bg-sky-500 py-2.5 text-white font-bold hover:bg-sky-600 transition">
                Request Payout
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Payout Ledger Logs</h3>
            <div className="space-y-3">
              {payoutsList.map((p) => (
                <div key={p.id} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white">{p.bank}</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{p.date} • Reference: {p.id}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-800 dark:text-white">Rs. {p.amount.toLocaleString()}</span>
                    <span className={`block text-[10px] font-bold ${p.status === "Completed" ? "text-emerald-600" : "text-amber-500"}`}>{p.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Simulator Tab */}
      {activeSubTab === "checkout" && (
        <div className="max-w-xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b pb-2 mb-4">Simulate Payment Checkout Gateway</h3>

          {checkoutStep === "inputs" && (
            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-center font-bold">
                {["stripe", "razorpay"].map((gw) => (
                  <button
                    key={gw}
                    type="button"
                    onClick={() => setCheckoutGateway(gw)}
                    className={`rounded-xl py-3 border capitalize transition ${checkoutGateway === gw ? "bg-sky-500 text-white border-sky-500" : "bg-slate-50 text-slate-500 border-slate-200"}`}
                  >
                    {gw} Payment
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Cardholder Name</label>
                <input
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Card details (Signature simulation enabled)</label>
                <input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none dark:border-slate-700 dark:bg-slate-950"
                  required
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl flex justify-between font-bold">
                <span className="text-slate-500">Checkout Price Due:</span>
                <span className="text-slate-900 dark:text-white">Rs. 10,500</span>
              </div>

              <button className="w-full rounded-xl bg-emerald-500 py-3 text-white font-extrabold hover:bg-emerald-600 transition flex items-center justify-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5" /> Authorize & Pay via {checkoutGateway === "stripe" ? "Stripe Direct" : "Razorpay API"}
              </button>
            </form>
          )}

          {checkoutStep === "loading" && (
            <div className="py-12 text-center text-slate-500 text-base font-bold flex flex-col items-center gap-3">
              <RefreshCw className="h-10 w-10 text-sky-500 animate-spin" />
              <p>Verifying secure transaction signature credentials...</p>
            </div>
          )}

          {checkoutStep === "success" && (
            <div className="py-12 text-center text-slate-500 text-base font-bold flex flex-col items-center gap-3">
              <CheckCircle className="h-12 w-12 text-emerald-500" />
              <p className="text-slate-900 dark:text-white">Payment successful!</p>
              <p className="text-xs text-slate-400">Razorpay transaction signature matched and ledger is updated.</p>
              <button
                onClick={() => setCheckoutStep("inputs")}
                className="mt-4 rounded-xl bg-sky-500 text-white px-4 py-2 font-bold text-xs"
              >
                Back to Simulator
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
