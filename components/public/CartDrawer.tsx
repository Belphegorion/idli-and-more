'use client';

import React, { useEffect } from 'react';
import { VegIcon } from '../CulturalMotifs';
import { Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { CartItem } from '@/lib/types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onClearCart: () => void;
  tableLabel?: string;
  onPlaceTableOrder?: () => void;
  isTableOrderLoading?: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onClearCart,
  tableLabel,
  onPlaceTableOrder,
  isTableOrderLoading = false,
}) => {
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

  const totalAmount = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  const gst = Math.round(totalAmount * 0.05); // 5% GST
  const grandTotal = totalAmount + gst;

  const handleWhatsAppCheckout = () => {
    const orderList = cart
      .map((ci) => `• ${ci.item.name} x ${ci.quantity} = ₹${ci.item.price * ci.quantity}`)
      .join('%0A');

    const message = `*Idli & More - New Food Order*%0A%0A${orderList}%0A%0A*Subtotal:* ₹${totalAmount}%0A*GST (5%):* ₹${gst}%0A*Total Amount:* ₹${grandTotal}%0A%0A_Please confirm order and estimated preparation time._`;
    const whatsappUrl = `https://wa.me/919893012345?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="relative z-10 w-full max-w-md bg-[#FFFDF7] h-full shadow-2xl flex flex-col justify-between border-l border-[#E8DCC4] animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="Your Order Tray"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8DCC4] flex items-center justify-between bg-[#FAF6EC]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#2F5D3A]" />
            <h2 className="font-serif font-bold text-lg text-[#2B1D14]">
              {tableLabel ? `Order Tray · ${tableLabel}` : 'Your Order Tray'}
            </h2>
            <span className="text-xs text-[#6B5444]">({cart.length} items)</span>
          </div>
          <button
            onClick={onClose}
            className="text-sm font-bold text-[#6B5444] hover:text-[#2B1D14] p-1 cursor-pointer"
            aria-label="Close Order Tray"
          >
            ✕ Close
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#FAF6EC] flex items-center justify-center mx-auto text-[#6B5444]">
                <ShoppingBag className="w-8 h-8 opacity-40" />
              </div>
              <p className="font-serif text-lg font-bold text-[#2B1D14]">Your tray is empty</p>
              <p className="text-xs text-[#6B5444] max-w-xs mx-auto">
                Add hot steamed Thatte Idli, Podi Vada, or Filter Coffee to begin.
              </p>
            </div>
          ) : (
            cart.map(({ item, quantity }) => {
              const itemId = item._id || item.id || item.slug;
              return (
                <div
                  key={itemId}
                  className="bg-[#FAF6EC] p-3 rounded-xl border border-[#E8DCC4] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <VegIcon className="shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-[#2B1D14] truncate">{item.name}</p>
                      <p className="text-[#6B5444]">₹{item.price} each</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[#FFFDF7] rounded-lg border border-[#E8DCC4] p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(itemId, -1)}
                        className="p-1 hover:bg-[#FAF6EC] rounded text-[#6B5444] cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-bold text-xs text-[#2B1D14]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(itemId, 1)}
                        className="p-1 hover:bg-[#FAF6EC] rounded text-[#6B5444] cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="font-bold text-sm text-[#2B1D14] w-14 text-right">
                      ₹{item.price * quantity}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#E8DCC4] bg-[#FAF6EC] space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#6B5444]">
                <span>Item Subtotal</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-[#6B5444]">
                <span>GST (5%)</span>
                <span>₹{gst}</span>
              </div>
              <div className="flex justify-between font-serif font-bold text-base text-[#2B1D14] pt-2 border-t border-[#E8DCC4]">
                <span>Grand Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            {onPlaceTableOrder ? (
              <button
                onClick={onPlaceTableOrder}
                disabled={isTableOrderLoading}
                className="w-full py-3.5 rounded-xl bg-[#2F5D3A] hover:bg-[#1F3F28] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{isTableOrderLoading ? 'Sending to Kitchen...' : `Send Order to Kitchen (₹${grandTotal})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleWhatsAppCheckout}
                className="w-full py-3.5 rounded-xl bg-[#2F5D3A] hover:bg-[#1F3F28] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all btn-gold-glow cursor-pointer"
              >
                <span>Send Order via WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClearCart}
              className="w-full text-center text-xs text-[#B3261E] hover:underline pt-1 cursor-pointer"
            >
              Clear entire tray
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
