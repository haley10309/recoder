import { atom } from "recoil";

export const ticketUrlState = atom({
  key: 'ticketUrlState',
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