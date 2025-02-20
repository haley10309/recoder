import { atom } from "recoil";

export const productNameState = atom({
  key: 'productNameState',
  default: '',
});

export const countryCodeState = atom({
  key: 'countryCodeState',
  default: '',
});

export const textareasState = atom({
  key: "textareasState", 
  default: [
    { asWasCode: "", toBeCode: "", checked: false, isApplied: null }
  ]
});