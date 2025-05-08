import { atom } from "recoil";

export const ticketUrlState = atom({
  key: "ticketUrlState",
  default: "",
});

export const ticketNumState = atom({
  key: "ticketNumState",
  default: "",
});

export const countryCodeState = atom({
  key: "countryCodeState",
  default: "",
});

// 영문, 비영문 분기 처리
export const isEnglishCountryState = atom({
  key: "isEnglishCountryState",
  default: false,
});

export const textareasState = atom({
  key: "textareasState",
  default: [{ asWasCode: "", toBeCode: "", checked: false, isApplied: null }],
});
