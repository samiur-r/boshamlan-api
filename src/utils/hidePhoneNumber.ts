const hidePhoneNumber = (description: string) => {
  const pattern = /[\d\u0660-\u0669\u06F0-\u06F9]{8}/g;

  return description.replace(pattern, '********');
};

export default hidePhoneNumber;
