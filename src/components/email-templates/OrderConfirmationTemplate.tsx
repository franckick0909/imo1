interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  total: number;
}

interface ShippingInfo {
  method: string;
  carrier: string;
  estimatedDelivery: string;
  cost: number;
  isFree: boolean;
}

interface OrderConfirmationProps {
  orderNumber: string;
  customerName: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  shippingInfo: ShippingInfo;
  paymentMethod: string;
}

export default function OrderConfirmationTemplate({
  orderNumber,
  customerName,
  orderDate,
  items,
  subtotal,
  shippingCost,
  taxAmount,
  total,
  shippingAddress,
  billingAddress,
  shippingInfo,
  paymentMethod,
}: OrderConfirmationProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        lineHeight: "1.6",
        color: "#333",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#059669",
          color: "white",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px" }}>
          Confirmation de commande
        </h1>
        <p style={{ margin: "10px 0 0 0", fontSize: "16px" }}>
          Merci pour votre commande, {customerName} !
        </p>
      </div>

      {/* Main Content */}
      <div style={{ padding: "30px 20px" }}>
        {/* Order Summary */}
        <div style={{ marginBottom: "30px" }}>
          <h2
            style={{ color: "#059669", fontSize: "20px", marginBottom: "15px" }}
          >
            Résumé de votre commande
          </h2>
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "15px",
              borderRadius: "8px",
            }}
          >
            <p style={{ margin: "5px 0" }}>
              <strong>Numéro de commande :</strong> {orderNumber}
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>Date de commande :</strong> {formatDate(orderDate)}
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>Méthode de paiement :</strong> {paymentMethod}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div style={{ marginBottom: "30px" }}>
          <h2
            style={{ color: "#059669", fontSize: "20px", marginBottom: "15px" }}
          >
            Produits commandés
          </h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#f8f9fa",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#e9ecef" }}>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    borderBottom: "1px solid #dee2e6",
                  }}
                >
                  Produit
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    borderBottom: "1px solid #dee2e6",
                  }}
                >
                  Quantité
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    borderBottom: "1px solid #dee2e6",
                  }}
                >
                  Prix unitaire
                </th>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "right",
                    borderBottom: "1px solid #dee2e6",
                  }}
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td
                    style={{
                      padding: "12px",
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "4px",
                          marginRight: "10px",
                        }}
                      />
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "center",
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    {item.quantity}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    {formatPrice(item.price)}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    {formatPrice(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Total */}
        <div style={{ marginBottom: "30px" }}>
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <table style={{ width: "100%", fontSize: "16px" }}>
              <tr>
                <td style={{ padding: "5px 0", textAlign: "right" }}>
                  Sous-total :
                </td>
                <td
                  style={{
                    padding: "5px 0",
                    textAlign: "right",
                    width: "120px",
                  }}
                >
                  {formatPrice(subtotal)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "5px 0", textAlign: "right" }}>
                  Frais de port ({shippingInfo.method}) :
                </td>
                <td
                  style={{
                    padding: "5px 0",
                    textAlign: "right",
                    color: shippingInfo.isFree ? "#059669" : "#333",
                  }}
                >
                  {shippingInfo.isFree ? "Gratuit" : formatPrice(shippingCost)}
                </td>
              </tr>
              {taxAmount > 0 && (
                <tr>
                  <td style={{ padding: "5px 0", textAlign: "right" }}>
                    TVA :
                  </td>
                  <td style={{ padding: "5px 0", textAlign: "right" }}>
                    {formatPrice(taxAmount)}
                  </td>
                </tr>
              )}
              <tr
                style={{
                  borderTop: "2px solid #059669",
                  fontWeight: "bold",
                  fontSize: "18px",
                }}
              >
                <td style={{ padding: "10px 0", textAlign: "right" }}>
                  Total :
                </td>
                <td
                  style={{
                    padding: "10px 0",
                    textAlign: "right",
                    color: "#059669",
                  }}
                >
                  {formatPrice(total)}
                </td>
              </tr>
            </table>
          </div>
        </div>

        {/* Shipping Info */}
        <div style={{ marginBottom: "30px" }}>
          <h2
            style={{ color: "#059669", fontSize: "20px", marginBottom: "15px" }}
          >
            Informations de livraison
          </h2>
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "15px",
              borderRadius: "8px",
            }}
          >
            <p style={{ margin: "5px 0" }}>
              <strong>Méthode :</strong> {shippingInfo.method} (
              {shippingInfo.carrier})
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>Livraison estimée :</strong>{" "}
              {shippingInfo.estimatedDelivery}
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>Adresse de livraison :</strong>
            </p>
            <div style={{ marginLeft: "20px" }}>
              <p style={{ margin: "2px 0" }}>
                {shippingAddress.firstName} {shippingAddress.lastName}
              </p>
              <p style={{ margin: "2px 0" }}>{shippingAddress.street}</p>
              <p style={{ margin: "2px 0" }}>
                {shippingAddress.postalCode} {shippingAddress.city}
              </p>
              <p style={{ margin: "2px 0" }}>{shippingAddress.country}</p>
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div style={{ marginBottom: "30px" }}>
          <h2
            style={{ color: "#059669", fontSize: "20px", marginBottom: "15px" }}
          >
            Adresse de facturation
          </h2>
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "15px",
              borderRadius: "8px",
            }}
          >
            <p style={{ margin: "2px 0" }}>
              {billingAddress.firstName} {billingAddress.lastName}
            </p>
            <p style={{ margin: "2px 0" }}>{billingAddress.street}</p>
            <p style={{ margin: "2px 0" }}>
              {billingAddress.postalCode} {billingAddress.city}
            </p>
            <p style={{ margin: "2px 0" }}>{billingAddress.country}</p>
          </div>
        </div>

        {/* Next Steps */}
        <div style={{ marginBottom: "30px" }}>
          <h2
            style={{ color: "#059669", fontSize: "20px", marginBottom: "15px" }}
          >
            Prochaines étapes
          </h2>
          <div
            style={{
              backgroundColor: "#e3f2fd",
              padding: "15px",
              borderRadius: "8px",
              borderLeft: "4px solid #2196f3",
            }}
          >
            <p style={{ margin: "5px 0" }}>
              • Votre commande va être préparée dans les plus brefs délais
            </p>
            <p style={{ margin: "5px 0" }}>
              • Vous recevrez un email de confirmation d&apos;expédition avec le
              numéro de suivi
            </p>
            <p style={{ margin: "5px 0" }}>
              • Vous pouvez suivre l&apos;état de votre commande dans votre
              espace client
            </p>
          </div>
        </div>

        {/* Customer Service */}
        <div style={{ marginBottom: "30px" }}>
          <h2
            style={{ color: "#059669", fontSize: "20px", marginBottom: "15px" }}
          >
            Besoin d&apos;aide ?
          </h2>
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "15px",
              borderRadius: "8px",
            }}
          >
            <p style={{ margin: "5px 0" }}>
              Notre équipe est à votre disposition pour toute question :
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>Email :</strong> support@biocreme.com
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>Téléphone :</strong> 01 23 45 67 89
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>Horaires :</strong> Du lundi au vendredi, 9h-18h
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          textAlign: "center",
          fontSize: "14px",
          color: "#666",
        }}
      >
        <p style={{ margin: "5px 0" }}>
          Merci de votre confiance et à bientôt sur BioCreme !
        </p>
        <p style={{ margin: "5px 0" }}>
          © 2024 BioCreme - Tous droits réservés
        </p>
        <p style={{ margin: "5px 0" }}>
          <a href="#" style={{ color: "#059669", textDecoration: "none" }}>
            Politique de confidentialité
          </a>
          {" | "}
          <a href="#" style={{ color: "#059669", textDecoration: "none" }}>
            Conditions d&apos;utilisation
          </a>
          {" | "}
          <a href="#" style={{ color: "#059669", textDecoration: "none" }}>
            Se désabonner
          </a>
        </p>
      </div>
    </div>
  );
}
