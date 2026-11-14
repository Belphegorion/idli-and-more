'use client';

import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export const ReservationModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guests, setGuests] = useState('2');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [outlet, setOutlet] = useState('kolar');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const outletName =
      outlet === 'kolar'
        ? 'Kolar Road Flagship'
        : outlet === 'seven-no'
        ? '7 No. Stop Heritage'
        : 'MP Nagar Express';

    const message = `*New Table Reservation - Idli & More*%0A*Name:* ${name}%0A*Phone:* ${phone}%0A*Guests:* ${guests}%0A*Date:* ${date}%0A*Time:* ${time}%0A*Outlet:* ${outletName}%0A*Notes:* ${notes || 'None'}`;
    const whatsappUrl = `https://wa.me/919893012345?text=${message}`;

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className="relative z-10 bg-[#FFFDF7] w-full max-w-lg rounded-3xl border border-[#E8DCC4] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Book a Table at Idli & More"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#6B5444] hover:text-[#2B1D14] text-xl font-bold p-1 cursor-pointer"
          aria-label="Close modal"
        >
          ✕
        </button>

        {submitted ? (
          <div className="text-center py-12 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-[#2F5D3A] mx-auto animate-bounce" />
            <h3 className="font-serif font-bold text-2xl text-[#2B1D14]">
              Table Request Prepared!
            </h3>
            <p className="text-sm text-[#6B5444]">
              Opening WhatsApp to confirm with the restaurant manager...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-left space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2F5D3A]">
                Reserve Your Seating
              </span>
              <h2 className="font-serif font-bold text-2xl text-[#2B1D14]">
                Book a Table / Family Gathering
              </h2>
              <p className="text-xs text-[#6B5444]">
                Enjoy serene temple-morning calm and fresh hot idlis with your family in Bhopal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
              <div>
                <label className="block text-xs font-semibold text-[#2B1D14] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCC4] bg-[#FAF6EC] text-xs text-[#2B1D14] focus:ring-2 focus:ring-[#2F5D3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B1D14] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98930..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCC4] bg-[#FAF6EC] text-xs text-[#2B1D14] focus:ring-2 focus:ring-[#2F5D3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B1D14] mb-1">
                  Select Outlet
                </label>
                <select
                  value={outlet}
                  onChange={(e) => setOutlet(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCC4] bg-[#FAF6EC] text-xs text-[#2B1D14] focus:ring-2 focus:ring-[#2F5D3A]"
                >
                  <option value="kolar">Kolar Road Flagship</option>
                  <option value="seven-no">7 No. Stop Heritage</option>
                  <option value="mp-nagar">MP Nagar Express</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B1D14] mb-1">
                  Number of Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCC4] bg-[#FAF6EC] text-xs text-[#2B1D14] focus:ring-2 focus:ring-[#2F5D3A]"
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="3">3 People</option>
                  <option value="4">4 People</option>
                  <option value="5-8">5 to 8 (Family table)</option>
                  <option value="8+">8+ (Large gathering)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B1D14] mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCC4] bg-[#FAF6EC] text-xs text-[#2B1D14] focus:ring-2 focus:ring-[#2F5D3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B1D14] mb-1">
                  Preferred Time
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8DCC4] bg-[#FAF6EC] text-xs text-[#2B1D14] focus:ring-2 focus:ring-[#2F5D3A]"
                />
              </div>
            </div>

            <div className="text-left">
              <label className="block text-xs font-semibold text-[#2B1D14] mb-1">
                Special Requests or High-Chair Requirements (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Traditional filter coffee ready on arrival, quiet corner table"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8DCC4] bg-[#FAF6EC] text-xs text-[#2B1D14] focus:ring-2 focus:ring-[#2F5D3A]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#2F5D3A] hover:bg-[#1F3F28] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all btn-gold-glow cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Confirm & Dispatch Reservation</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
