import { useRecoilState } from "recoil";

import { nameEnState, userEmailState } from "@/recoil/atoms/state";

export const useAuth = () => {
  const [nameEn, setNameEn] = useRecoilState(nameEnState);
  const [userEmail, setUserEmail] = useRecoilState(userEmailState);

  return {
    nameEn,
    setNameEn,
    userEmail,
    setUserEmail,
  };
};