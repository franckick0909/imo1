import { Tailwind } from "@react-email/tailwind";
import * as React from "react";

interface ResetPasswordTemplateProps {
  userName: string;
  resetUrl: string;
  token: string;
}

export const ResetPasswordTemplate: React.FC<
  Readonly<ResetPasswordTemplateProps>
> = ({ userName, resetUrl, token }) => (
  <Tailwind>
    <div className="font-sans max-w-2xl mx-auto p-6">
      <h2 className="text-gray-800 text-2xl font-semibold mb-4">
        Réinitialisation de mot de passe
      </h2>
      <p className="mb-4">Bonjour {userName},</p>
      <p className="mb-6">
        Vous avez demandé la réinitialisation de votre mot de passe sur Immo1.
      </p>

      <div className="text-center my-8">
        <a
          href={resetUrl}
          className="bg-indigo-600 text-white px-6 py-3 no-underline rounded-lg inline-block font-semibold hover:bg-indigo-700 transition-colors"
        >
          Réinitialiser mon mot de passe
        </a>
      </div>

      <p className="mb-2">Ce lien expire dans 1 heure.</p>
      <p className="mb-6">
        Si vous n&apos;avez pas demandé cette réinitialisation, ignorez cet
        email.
      </p>

      <hr className="border-gray-200 my-6" />

      <div className="text-xs text-gray-600 bg-gray-50 p-4 rounded border">
        <p className="font-semibold mb-2 text-gray-700">
          Pour le développement :
        </p>
        <p className="mb-1 font-mono break-all">Token: {token}</p>
        <p className="font-mono text-xs break-all">URL: {resetUrl}</p>
      </div>

      <p className="text-xs text-gray-500 mt-8 text-center">
        Cet email a été envoyé par Immo1. Si vous avez des questions, contactez
        notre support.
      </p>
    </div>
  </Tailwind>
);
