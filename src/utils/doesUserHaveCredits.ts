interface Credits {
  free: number;
  regular: number;
  sticky: number;
  agent: number;
}

const hasCredits = (credits: Credits): boolean => {
  const propertiesToCheck: Array<keyof Credits> = ['free', 'regular', 'sticky', 'agent'];
  // eslint-disable-next-line security/detect-object-injection
  return propertiesToCheck.some((key) => credits[key] > 0);
};

export default hasCredits;
