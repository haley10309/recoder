import { atom } from "recoil";

export const tobeAppliedState = atom({
    key: 'tobeAppliedState',
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