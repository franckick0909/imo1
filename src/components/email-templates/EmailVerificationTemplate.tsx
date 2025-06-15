import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface EmailVerificationTemplateProps {
  userName: string;
  verificationUrl: string;
  token: string;
}

export function EmailVerificationTemplate({
  userName,
  verificationUrl,
  token,
}: EmailVerificationTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>Vérifiez votre adresse email pour Immo1</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Vérifiez votre adresse email</Heading>
          <Text style={text}>Bonjour {userName},</Text>
          <Text style={text}>
            Merci de vous être inscrit sur Immo1 ! Pour finaliser votre
            inscription et accéder à votre compte, veuillez vérifier votre
            adresse email en cliquant sur le bouton ci-dessous.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={verificationUrl}>
              Vérifier mon email
            </Button>
          </Section>
          <Text style={text}>
            Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien
            dans votre navigateur :
          </Text>
          <Text style={link}>{verificationUrl}</Text>
          <Text style={text}>
            Ce lien expirera dans 24 heures pour des raisons de sécurité.
          </Text>
          <Text style={text}>
            Si vous n'avez pas créé de compte sur Immo1, vous pouvez ignorer cet
            email.
          </Text>
          <Text style={footer}>
            Cordialement,
            <br />
            L'équipe Immo1
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 8px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#059669",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
  margin: "0 auto",
};

const link = {
  color: "#059669",
  fontSize: "14px",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
  margin: "16px 8px",
};

const footer = {
  color: "#666",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "32px 8px 0",
};
