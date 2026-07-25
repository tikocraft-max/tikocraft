"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import { useRouter } from "@/lib/router";
import { toast } from "sonner";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalUSD,
    getTotalItems,
  } = useCart();
  const { formatPrice } = useCurrency();
  const { navigate } = useRouter();

  const totalUSD = getTotalUSD();
  const totalItems = getTotalItems();

  const handleCheckout = () => {
    if (items.length === 0) return;
    // For now, redirect to contact page with a note about the order
    // (Stripe integration would go here — see ADMIN.md)
    toast.success("Preparing your order… We'll be in touch shortly.");
    closeCart();
    navigate("contact");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 z-[70] bg-brown-900/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[71] w-full max-w-md bg-cream flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-beige">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-brown-800" strokeWidth={1.4} />
                <div>
                  <h2 className="font-display text-xl text-brown-900 leading-none">
                    Your Cart
                  </h2>
                  <span className="font-body text-[10px] tracking-luxe-sm uppercase text-brown-500">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </span>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-brown-600 hover:bg-brown-100 transition-colors"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <ShoppingBag className="h-12 w-12 text-brown-300 mb-4" strokeWidth={1} />
                <h3 className="font-display text-2xl text-brown-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="font-body text-sm text-brown-600 mb-8 font-light">
                  Browse our collections and add your favourite pieces.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    navigate("products");
                  }}
                  className="group inline-flex items-center gap-3 bg-brown-800 text-cream px-7 py-3.5 font-body text-xs tracking-luxe-sm uppercase transition-all duration-500 hover:bg-brown-900"
                >
                  Browse Products
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
                </button>
              </div>
            ) : (
              <>
                {/* Items list */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <motion.div
                        key={item.slug}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="flex gap-4 py-4 border-b border-beige/60"
                      >
                        {/* Image */}
                        <button
                          onClick={() => {
                            closeCart();
                            navigate("product", item.slug);
                          }}
                          className="shrink-0 w-20 h-20 bg-beige-light overflow-hidden"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </button>

                        {/* Info + quantity */}
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => {
                              closeCart();
                              navigate("product", item.slug);
                            }}
                            className="font-display text-base text-brown-900 leading-tight text-left hover:text-brown-600 transition-colors"
                          >
                            {item.name}
                          </button>
                          <div className="font-body text-xs text-brown-500 mt-1">
                            <span className="price-num">{formatPrice(item.priceUSD)}</span> each
                          </div>

                          {/* Quantity controls */}
                          <div className="flex items-center gap-3 mt-3">
                            <div className="inline-flex items-center border border-brown-300">
                              <button
                                onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                                className="p-1.5 text-brown-700 hover:bg-brown-50 transition-colors"
                                aria-label="Decrease"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="font-display text-sm text-brown-900 w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                                className="p-1.5 text-brown-700 hover:bg-brown-50 transition-colors"
                                aria-label="Increase"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => {
                                removeItem(item.slug);
                                toast.success(`${item.name} removed`);
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                              aria-label="Remove"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Line total */}
                        <div className="price-num text-base text-brown-800 shrink-0">
                          {formatPrice(item.priceUSD * item.quantity)}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Clear cart */}
                  <button
                    onClick={() => {
                      if (confirm("Clear all items from your cart?")) {
                        clearCart();
                        toast.success("Cart cleared");
                      }
                    }}
                    className="mt-4 font-body text-[11px] tracking-luxe-sm uppercase text-brown-500 hover:text-red-700 transition-colors"
                  >
                    Clear cart
                  </button>
                </div>

                {/* Footer / checkout */}
                <div className="border-t border-beige px-6 py-5 bg-brown-50/50">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-body text-[11px] tracking-luxe-sm uppercase text-brown-600">
                      Subtotal
                    </span>
                    <span className="price-num text-2xl text-brown-900">
                      {formatPrice(totalUSD)}
                    </span>
                  </div>
                  <p className="font-body text-[10px] text-brown-500 mb-4 font-light">
                    Shipping + taxes calculated at checkout. No account required.
                  </p>

                  {/* Checkout button */}
                  <button
                    onClick={handleCheckout}
                    className="group inline-flex w-full items-center justify-center gap-3 bg-brown-800 text-cream px-8 py-4 font-body text-xs tracking-luxe-sm uppercase transition-all duration-500 hover:bg-brown-900"
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
                  </button>

                  {/* Continue shopping */}
                  <button
                    onClick={() => {
                      closeCart();
                      navigate("products");
                    }}
                    className="w-full mt-3 inline-flex items-center justify-center gap-2 font-body text-[11px] tracking-luxe-sm uppercase text-brown-600 hover:text-brown-900 transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Continue Shopping
                  </button>

                  <p className="font-body text-[10px] text-brown-500 text-center mt-4 font-light leading-relaxed">
                    Your cart is saved automatically — even if you close the browser.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
