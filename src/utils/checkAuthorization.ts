import ErrorHandler from './ErrorHandler';

export const checkAuthorization = (user: any, arg2: any) => {
  if (user && !user.admin_status && user.id !== arg2) throw new ErrorHandler(401, 'You are not authorized');
};
