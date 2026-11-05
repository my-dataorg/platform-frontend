export type ContactInput = {
  contactName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
};

export const emptyContact: ContactInput = {
  contactName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
};

export function contactReady(contact: ContactInput, options?: { requireState?: boolean }) {
  const base =
    contact.contactName.trim().length >= 2 &&
    contact.phone.replace(/\D/g, "").length >= 7 &&
    contact.address.trim().length >= 2 &&
    contact.city.trim().length >= 2;
  if (options?.requireState) {
    return base && contact.state.trim().length >= 2;
  }
  return base;
}
