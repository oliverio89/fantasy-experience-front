export const publicConfig = {
  web3FormsAccessKey: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "",
  legalOwner:
    import.meta.env.VITE_LEGAL_OWNER ||
    "PENDIENTE: identidad del titular de Fantasy Experience",
  legalTaxId: import.meta.env.VITE_LEGAL_TAX_ID || "PENDIENTE",
  legalAddress: import.meta.env.VITE_LEGAL_ADDRESS || "PENDIENTE",
  legalEmail:
    import.meta.env.VITE_LEGAL_EMAIL || "contacto@fantasyexperience.com",
} as const;
