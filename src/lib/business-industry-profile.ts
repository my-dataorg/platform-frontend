export type BusinessIndustryProfileInput = {
  manufacturingLine: string;
  district: string;
  udyamRegistration: string;
  gstin: string;
  pan: string;
};

export const emptyBusinessIndustryProfile: BusinessIndustryProfileInput = {
  manufacturingLine: "",
  district: "",
  udyamRegistration: "",
  gstin: "",
  pan: "",
};

export function businessIndustryProfileReady(profile: BusinessIndustryProfileInput) {
  return profile.manufacturingLine.trim().length >= 2;
}
