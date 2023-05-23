const hidePhoneNumber = (description: string) => {
  const regex = /\b(\d{8})\b/g;

  const replacedString = description.replace(regex, (match, number) => {
    return '*'.repeat(number.length);
  });

  return replacedString;
};

export default hidePhoneNumber;
