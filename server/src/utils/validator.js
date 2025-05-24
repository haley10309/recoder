export const isValidEmail = (email) => {
  const parts = email.split('@');
  const [local, domain] = parts;
  return (
    domain === 'cheilpengtai.com' &&
    local.includes('.') &&
    /^[a-zA-Z0-9._%+-]+$/.test(local)
  );
};