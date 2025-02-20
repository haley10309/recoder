import { atom } from "recoil";

export const productNameState = atom({
  key: 'productNameState',
  default: '',
});

export const countryCodeState = atom({
  key: 'countryCodeState',
  default: '',
});

export const tobeResultState = atom({
    key: 'tobeResultState',
    default: {
      id: '',
      pptNo: '',
      asWasCode:'',
      toBecode:'',
      setToBeCode:'',
      changed:[],
      isApplied:'',
      onCheckedChange:{},
      checked:'',
      filter:'',
      country_code:'',
      matchedPart:''      
    },
  });