"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SectionHeading from "../section-heading";
import {
  fadeUp,
  staggerContainer,
  viewportOnce,
  easeLuxe,
} from "@/lib/animations";
import { useRouter } from "@/lib/router";

// ============================================================
// Legal entity facts — shared across all policy pages.
// Tikocraft is the customer-facing brand. Wenov8 LLC (Wyoming, USA)
// is the legal operating entity. This is the ONLY place we hard-code
// legal facts; the rest of the site uses "Tikocraft" exclusively.
// ============================================================
const LEGAL_ENTITY = "Wenov8 LLC";
const LEGAL_ADDRESS_LINES = [
  "30 N Gould St Ste N",
  "Sheridan, WY 82801",
  "United States",
];
const LEGAL_EMAIL = "contact@wenov8.online";

// Shared policy sections used by multiple policies
const entityCallout = {
  title: "Operating Entity",
  body: `Tikocraft is operated by ${LEGAL_ENTITY}, a Wyoming limited liability company. All references to "Tikocraft," "we," "us," or "our" in these policies refer to ${LEGAL_ENTITY}, doing business as Tikocraft.`,
};

const contactBlock = {
  title: "Contact",
  body: `If you have any questions about these policies or your order, write to us at ${LEGAL_EMAIL}. We aim to respond to every message within two business days.`,
};

const changesBlock = {
  title: "Changes to This Policy",
  body: "We may update this policy from time to time. When we do, the revised version will be posted on this page with a new effective date. Continued use of the site after a change indicates your acceptance of the updated terms.",
};

// ============================================================
// Policy definitions — each slug maps to a title, intro,
// effective date, and ordered list of sections.
// ============================================================
interface PolicySection {
  title: string;
  body: string;
}

interface Policy {
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  effective: string;
  sections: PolicySection[];
}

const POLICIES: Record<string, Policy> = {
  terms: {
    slug: "terms",
    eyebrow: "Legal",
    title: "Terms & Conditions",
    intro:
      "These terms govern your use of the Tikocraft website and your purchase of any product listed on it. Please read them carefully before placing an order.",
    effective: "August 2026",
    sections: [
      {
        title: "Acceptance of Terms",
        body: "By accessing or using tikocraft.com, you agree to be bound by these Terms & Conditions and any policies referenced within them. If you do not agree to any part of these terms, please do not use the site or place an order.",
      },
      entityCallout,
      {
        title: "Use of the Site",
        body: "You may browse, view, and place orders through the site for personal, non-commercial use. You agree not to: (a) reproduce, redistribute, or resell any part of the site's content without written permission; (b) attempt to gain unauthorized access to any portion of the site, its servers, or its databases; (c) use automated scripts to scrape or harvest content; or (d) interfere with the proper functioning of the site.",
      },
      {
        title: "Products & Orders",
        body: "Product images, descriptions, dimensions, and prices are presented in good faith. We make every effort to display them accurately, but colors may vary by monitor and small dimensional variances may occur in manufactured goods. Placing an order constitutes an offer to purchase, which we may accept or decline at our discretion. We reserve the right to refuse or cancel any order at any time, including in cases of pricing errors, suspected fraud, or stock shortages.",
      },
      {
        title: "Pricing & Payment",
        body: "All prices are listed in USD and may be displayed in other currencies for reference only; the final charge is settled in USD through our payment processor. Taxes, duties, and shipping are calculated at checkout. We accept major credit cards and other methods shown at checkout. Payment is captured when the order is confirmed.",
      },
      {
        title: "Intellectual Property",
        body: "All site content — including the Tikocraft name, logo, product photography, illustrations, copy, and design — is the property of Wenov8 LLC or its licensors and is protected by applicable intellectual property laws. You may not use any of it commercially without prior written consent.",
      },
      {
        title: "Limitation of Liability",
        body: "To the fullest extent permitted by law, Wenov8 LLC shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the site or any product purchased through it. Our total liability for any claim related to a single order shall not exceed the amount you paid for that order.",
      },
      {
        title: "Governing Law",
        body: "These terms are governed by the laws of the State of Wyoming, United States, without regard to conflict-of-law principles. Any dispute arising out of or relating to these terms or your use of the site shall be brought exclusively in the state or federal courts located in Wyoming.",
      },
      changesBlock,
      contactBlock,
    ],
  },

  privacy: {
    slug: "privacy",
    eyebrow: "Legal",
    title: "Privacy Policy",
    intro:
      "This policy explains what information we collect, how we use it, and the choices you have. Tikocraft is operated by Wenov8 LLC, which is the data controller responsible for your personal information.",
    effective: "August 2026",
    sections: [
      {
        title: "Information We Collect",
        body: "When you place an order or contact us, we collect: (a) the name, email, shipping address, and phone number you provide at checkout; (b) order details including items, totals, and shipping method; (c) any message you send via our contact form or email. We also receive limited technical data automatically, such as browser type, approximate location (region level), and pages viewed, through standard analytics tools.",
      },
      {
        title: "How We Use Your Information",
        body: "We use the information we collect to: (a) process and ship your orders; (b) respond to your enquiries; (c) detect and prevent fraud or abuse; (d) improve the site, our products, and our service. We do not sell your personal information. We may send occasional updates about new collections or promotions only if you have explicitly opted in; you can unsubscribe at any time.",
      },
      {
        title: "Cookies & Analytics",
        body: "The site uses cookies and similar technologies to remember your cart, currency preference, and to understand how visitors use the site. You can disable cookies in your browser; the site will still function, but some preferences (such as cart contents) may not persist across sessions.",
      },
      {
        title: "Data Sharing",
        body: "We share your information only with the parties needed to fulfill your order: our payment processor (for secure payment handling), the carrier that ships your order (name and shipping address only), and our analytics provider (aggregated, non-identifying data). We may also disclose information when required by law or to protect our rights.",
      },
      entityCallout,
      {
        title: "Data Security",
        body: "We use industry-standard measures to protect your information, including encrypted transmission (HTTPS) for all checkout traffic and secure storage of payment tokens by our payment processor. No method of transmission or storage is fully secure, but we work to keep your data safe.",
      },
      {
        title: "Your Rights",
        body: "Depending on your location, you may have the right to access, correct, or delete your personal information, or to object to certain processing. To exercise any of these rights, write to us at the contact email below and we will respond within a reasonable timeframe.",
      },
      {
        title: "Children's Privacy",
        body: "The site is intended for general audiences. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with information, please contact us and we will delete it.",
      },
      changesBlock,
      contactBlock,
    ],
  },

  refund: {
    slug: "refund",
    eyebrow: "Legal",
    title: "Refund & Return Policy",
    intro:
      "We want you to be happy with what you receive. If something isn't right, this policy explains how to return it and what to expect.",
    effective: "August 2026",
    sections: [
      {
        title: "Return Window",
        body: "You may request a return within 30 days of receiving your order. Items must be unused, in their original packaging, and accompanied by proof of purchase (the order number from your confirmation email is sufficient).",
      },
      {
        title: "Non-Returnable Items",
        body: "Custom Clay Figures are made to order based on a personal photo and cannot be returned or refunded once production has begun, unless the item arrives damaged or significantly different from the agreed specification. Book Nook Kits that have been opened or assembled are also non-returnable, as we cannot resell used components.",
      },
      {
        title: "How to Initiate a Return",
        body: `To start a return, write to ${LEGAL_EMAIL} with your order number and a short note about the issue. We will reply with a return authorization and the shipping address for your item. Please do not send anything back without first receiving this authorization — unauthorized returns may be refused at the door.`,
      },
      {
        title: "Refund Processing",
        body: "Once we receive and inspect the returned item, we will issue a refund to the original payment method within 5 business days. Depending on your bank, the refund may take a further 3 to 10 days to appear on your statement. Shipping costs are non-refundable except in cases where the return is the result of our error (wrong item, defective product).",
      },
      {
        title: "Damaged or Defective Items",
        body: `If your order arrives damaged or defective, please write to ${LEGAL_EMAIL} within 7 days of delivery, attaching a clear photo of the damage and the packaging. We will arrange a replacement or a full refund (including original shipping) at no cost to you.`,
      },
      {
        title: "Order Cancellations",
        body: "Orders can be cancelled free of charge within 24 hours of placement. After that window, the order may have already been dispatched from our fulfillment partner and cancellation is no longer possible — in that case, please follow the return process above once the item arrives.",
      },
      entityCallout,
      changesBlock,
      contactBlock,
    ],
  },

  shipping: {
    slug: "shipping",
    eyebrow: "Legal",
    title: "Shipping Policy",
    intro:
      "This policy explains how orders are processed, shipped, and delivered. Tikocraft ships directly to customers worldwide.",
    effective: "August 2026",
    sections: [
      {
        title: "Order Processing Time",
        body: "Orders are processed within 1 to 3 business days of being placed. During peak periods or new collection launches, processing may take up to 5 business days. You will receive a confirmation email with tracking as soon as the order leaves our fulfillment partner.",
      },
      {
        title: "Shipping Methods & Destinations",
        body: "We ship internationally to most countries. Available shipping methods and rates are displayed at checkout based on your destination. Standard shipping typically takes 7 to 21 business days for international orders; expedited options, when available, take 3 to 7 business days. Delivery times are estimates and not guaranteed.",
      },
      {
        title: "Shipping Costs",
        body: "Shipping is calculated at checkout based on the destination and the weight of the parcel. Free shipping promotions, when offered, apply only to the standard shipping option and are limited to the regions specified in the promotion.",
      },
      {
        title: "Tracking",
        body: "As soon as your order ships, you will receive an email containing the tracking number and a link to the carrier's site. Please allow up to 48 hours for the first scan to appear in the carrier's system.",
      },
      {
        title: "Customs, Duties & Taxes",
        body: "For international orders, the recipient is responsible for any customs duties, taxes, or fees imposed by the destination country. We are unable to mark packages as gifts or to under-declare their value. Please check with your local customs office if you are unsure what charges may apply.",
      },
      {
        title: "Delays & Lost Packages",
        body: `Shipping times are estimates. Carriers occasionally experience delays due to weather, customs, or volume. If your tracking has not updated for 10 business days (domestic) or 30 business days (international) after shipment, write to ${LEGAL_EMAIL} and we will open an investigation with the carrier. If a package is confirmed lost, we will arrange a replacement or refund at no cost to you.`,
      },
      {
        title: "Incorrect Address",
        body: "Please review your shipping address carefully before completing checkout. We are not responsible for orders sent to an address provided in error by the customer. If a package is returned to us due to an incorrect or incomplete address, we will contact you to arrange re-shipment; additional shipping fees may apply.",
      },
      entityCallout,
      changesBlock,
      contactBlock,
    ],
  },
};

export default function LegalPage({ slug }: { slug: string }) {
  const policy = POLICIES[slug] || POLICIES.terms;
  const { navigate } = useRouter();

  return (
    <div className="bg-cream min-h-screen">
      {/* Page header */}
      <section className="pt-32 md:pt-40 px-6 lg:px-12 pb-16 md:pb-20">
        <div className="mx-auto max-w-4xl">
          <motion.div
            variants={staggerContainer(0.15, 0.1)}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-brown-400" />
              <span className="font-body text-[11px] tracking-luxe uppercase text-brown-500">
                {policy.eyebrow}
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl sm:text-6xl md:text-7xl text-brown-900 leading-[1.02] mb-6 text-balance"
            >
              {policy.title}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="font-body text-base sm:text-lg text-brown-700/80 leading-relaxed font-light max-w-2xl"
            >
              {policy.intro}
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="mt-6 font-body text-[11px] tracking-luxe-sm uppercase text-brown-500"
            >
              Effective {policy.effective}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Entity callout — keeps the Wenov8 LLC legal entity visible
          at the top of every policy page */}
      <section className="px-6 lg:px-12 pb-12 md:pb-16">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.8, ease: easeLuxe }}
            className="bg-brown-50 border border-beige p-6 md:p-8"
          >
            <div className="font-body text-[10px] tracking-luxe uppercase text-brown-500 mb-3">
              Legal Business Information
            </div>
            <div className="font-display text-2xl text-brown-900 mb-1">
              Tikocraft is operated by {LEGAL_ENTITY}.
            </div>
            <div className="font-body text-sm text-brown-700/80 leading-relaxed">
              {LEGAL_ADDRESS_LINES.join(" · ")}
              <br />
              Email:{" "}
              <a
                href={`mailto:${LEGAL_EMAIL}`}
                className="underline underline-offset-2 hover:text-brown-900 transition-colors"
              >
                {LEGAL_EMAIL}
              </a>
            </div>
            <div className="mt-4 font-body text-[11px] text-brown-500 leading-relaxed">
              This is a registered business address — not a retail store, showroom,
              warehouse, or pickup location.
            </div>
          </motion.div>
        </div>
      </section>

      {/* Policy sections */}
      <section className="px-6 lg:px-12 pb-24 md:pb-32">
        <div className="mx-auto max-w-4xl">
          <motion.ol
            variants={staggerContainer(0.1, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="space-y-10"
          >
            {policy.sections.map((section, i) => (
              <motion.li
                key={`${policy.slug}-${section.title}-${i}`}
                variants={fadeUp}
                className="border-t border-beige pt-8"
              >
                <div className="flex items-baseline gap-4 mb-3">
                  <span className="font-display text-sm text-brown-400 tracking-luxe shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl text-brown-900 leading-tight">
                    {section.title}
                  </h2>
                </div>
                <p className="font-body text-base text-brown-700/80 leading-relaxed font-light pl-8">
                  {section.body}
                </p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* Other policies cross-link */}
      <section className="px-6 lg:px-12 pb-24 md:pb-32 bg-brown-50">
        <div className="mx-auto max-w-4xl">
          <motion.div
            variants={staggerContainer(0.12, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <motion.div variants={fadeUp} className="mb-8 flex items-center gap-3">
              <span className="h-px w-8 bg-brown-400" />
              <span className="font-body text-[11px] tracking-luxe uppercase text-brown-500">
                Other Policies
              </span>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {Object.values(POLICIES)
                .filter((p) => p.slug !== policy.slug)
                .map((p) => (
                  <button
                    key={p.slug}
                    onClick={() => navigate("legal", p.slug)}
                    className="group text-left bg-cream border border-beige p-6 hover:border-brown-300 transition-colors duration-500"
                  >
                    <div className="font-display text-xl text-brown-900 mb-2">
                      {p.title}
                    </div>
                    <div className="flex items-center gap-2 font-body text-[10px] tracking-luxe-sm uppercase text-brown-500">
                      <span>Read</span>
                      <ArrowRight className="h-3 w-3 transition-transform duration-500 group-hover:translate-x-1" />
                    </div>
                  </button>
                ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
