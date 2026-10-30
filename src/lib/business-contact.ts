export type BusinessContactInput = {
  contactName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
};

export const emptyBusinessContact: BusinessContactInput = {
  contactName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
};

export function businessContactReady(contact: BusinessContactInput, options?: { requireState?: boolean }) {
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
