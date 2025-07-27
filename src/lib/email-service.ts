import React, { ReactElement } from "react";
import { Resend } from "resend";

// Initialiser Resend
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Configuration par défaut
const DEFAULT_FROM =
  process.env.FROM_EMAIL || "BioCreme <noreply@biocreme.com>";

/**
 * Fonction d'envoi d'email avec Resend (cohérente avec Better Auth)
 */
async function sendEmail(
  to: string,
  subject: string,
  reactTemplate: ReactElement
): Promise<void> {
  // Vérifier si Resend est configuré
  if (!resend) {
    // Mode développement - afficher dans la console
    console.log(`\n=== EMAIL (MODE DEV) ===`);
    console.log(`À: ${to}`);
    console.log(`Sujet: ${subject}`);
    console.log(`Template React fourni`);
    console.log(`=======================\n`);
    return;
  }

  try {
    // Envoi avec Resend SDK
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [to],
      subject,
      react: reactTemplate,
    });

    if (error) {
      throw new Error(`Erreur Resend: ${JSON.stringify(error)}`);
    }

    console.log(`✅ Email envoyé avec succès à ${to} (ID: ${data?.id})`);
    return;
  } catch (error) {
    console.error("❌ Erreur envoi email:", error);
    // Fallback : afficher dans la console
    console.log(`\n=== EMAIL (FALLBACK) ===`);
    console.log(`À: ${to}`);
    console.log(`Sujet: ${subject}`);
    console.log(`Template React fourni`);
    console.log(`========================\n`);
    // Ne pas faire échouer le processus de commande
  }
}

/**
 * Envoie un email de confirmation de commande
 */
export async function sendOrderConfirmationEmail(
  customerEmail: string,
  orderData: any // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<void> {
  try {
    // Dynamically import the template to avoid SSR issues
    const { default: OrderConfirmationTemplate } = await import(
      "@/components/email-templates/OrderConfirmationTemplate"
    );

    const template = React.createElement(OrderConfirmationTemplate, orderData);

    await sendEmail(
      customerEmail,
      `Confirmation de commande #${orderData.orderNumber}`,
      template
    );

    console.log("✅ Email de confirmation envoyé à:", customerEmail);
  } catch (error) {
    console.error("❌ Erreur envoi email de confirmation:", error);
    // Ne pas faire échouer le processus de commande
  }
}

/**
 * Envoie un email de confirmation d'expédition
 */
export async function sendShippingConfirmationEmail(
  customerEmail: string,
  shippingData: {
    orderNumber: string;
    customerName: string;
    trackingNumber: string;
    carrier: string;
    estimatedDelivery: string;
    shippingAddress: unknown;  
  }
): Promise<void> {
  try {
    const template = React.createElement(
      "div",
      {
        style: {
          fontFamily: "Arial, sans-serif",
          maxWidth: "600px",
          margin: "0 auto",
        },
      },
      React.createElement(
        "h1",
        { style: { color: "#2c5530", textAlign: "center" } },
        "Expédition confirmée"
      ),
      React.createElement("p", null, `Bonjour ${shippingData.customerName},`),
      React.createElement(
        "p",
        null,
        `Votre commande #${shippingData.orderNumber} a été expédiée !`
      ),
      React.createElement(
        "div",
        {
          style: {
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            margin: "20px 0",
          },
        },
        React.createElement(
          "h3",
          { style: { color: "#2c5530", marginTop: "0" } },
          "Informations de suivi"
        ),
        React.createElement("p", null, `Transporteur: ${shippingData.carrier}`),
        React.createElement(
          "p",
          null,
          `Numéro de suivi: ${shippingData.trackingNumber}`
        ),
        React.createElement(
          "p",
          null,
          `Livraison estimée: ${shippingData.estimatedDelivery}`
        )
      ),
      React.createElement(
        "p",
        { style: { textAlign: "center", marginTop: "30px" } },
        "Merci pour votre commande !"
      ),
      React.createElement(
        "p",
        { style: { textAlign: "center", color: "#666", fontSize: "14px" } },
        "© 2024 BioCreme - Tous droits réservés"
      )
    );

    await sendEmail(
      customerEmail,
      `Expédition confirmée - Commande #${shippingData.orderNumber}`,
      template
    );

    console.log("✅ Email d'expédition envoyé à:", customerEmail);
  } catch (error) {
    console.error("❌ Erreur envoi email d'expédition:", error);
  }
}

/**
 * Envoie un email de confirmation de livraison
 */
export async function sendDeliveryConfirmationEmail(
  customerEmail: string,
  deliveryData: {
    orderNumber: string;
    customerName: string;
    deliveryDate: string;
  }
): Promise<void> {
  try {
    const template = React.createElement(
      "div",
      {
        style: {
          fontFamily: "Arial, sans-serif",
          maxWidth: "600px",
          margin: "0 auto",
        },
      },
      React.createElement(
        "h1",
        { style: { color: "#2c5530", textAlign: "center" } },
        "Livraison confirmée"
      ),
      React.createElement("p", null, `Bonjour ${deliveryData.customerName},`),
      React.createElement(
        "p",
        null,
        `Votre commande #${deliveryData.orderNumber} a été livrée le ${deliveryData.deliveryDate}.`
      ),
      React.createElement(
        "div",
        {
          style: {
            backgroundColor: "#d4edda",
            padding: "15px",
            borderRadius: "8px",
            margin: "20px 0",
          },
        },
        React.createElement(
          "p",
          { style: { margin: "5px 0" } },
          "Nous espérons que vous êtes satisfait(e) de votre commande !"
        ),
        React.createElement(
          "p",
          { style: { margin: "5px 0" } },
          "N'hésitez pas à nous laisser un avis sur nos produits."
        )
      ),
      React.createElement(
        "p",
        { style: { textAlign: "center", marginTop: "30px" } },
        "Merci pour votre confiance !"
      ),
      React.createElement(
        "p",
        { style: { textAlign: "center", color: "#666", fontSize: "14px" } },
        "© 2024 BioCreme - Tous droits réservés"
      )
    );

    await sendEmail(
      customerEmail,
      `Livraison confirmée - Commande #${deliveryData.orderNumber}`,
      template
    );

    console.log("✅ Email de livraison envoyé à:", customerEmail);
  } catch (error) {
    console.error("❌ Erreur envoi email de livraison:", error);
  }
}
