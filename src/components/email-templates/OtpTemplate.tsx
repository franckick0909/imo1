import { Tailwind } from "@react-email/tailwind";
import * as React from "react";

interface OtpTemplateProps {
  email: string;
  otp: string;
  type: string;
}

export const OtpTemplate: React.FC<Readonly<OtpTemplateProps>> = ({
  email,
  otp,
  type,
}) => (
  <Tailwind>
    <div className="font-sans max-w-2xl mx-auto p-6">
      <h2 className="text-gray-800 text-2xl font-semibold mb-4">
        Code de vérification
      </h2>
      <p className="mb-4">Bonjour,</p>
      <p className="mb-6">Voici votre code de vérification pour {email} :</p>

      <div className="bg-gray-100 p-6 rounded-lg text-center my-8 border">
        <span className="text-4xl font-bold tracking-widest text-indigo-600 font-mono">
          {otp}
        </span>
      </div>

      <p className="mb-4">
        Ce code expire dans <strong className="text-red-600">5 minutes</strong>.
      </p>
      <p className="mb-6">
        Si vous n&apos;avez pas demandé ce code, ignorez cet email.
      </p>

      <hr className="border-gray-200 my-6" />

      <div className="text-xs text-gray-600 bg-gray-50 p-4 rounded border">
        <p className="mb-2">
          <span className="font-semibold">Type de vérification:</span> {type}
        </p>
      </div>

      <p className="text-xs text-gray-500 mt-8 text-center">
        Cet email a été envoyé par <strong>Immo1</strong>. Ne partagez jamais ce
        code avec personne.
      </p>
    </div>
  </Tailwind>
);
