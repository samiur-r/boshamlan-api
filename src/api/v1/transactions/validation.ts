import * as yup from 'yup';

const transactionSchema = yup.object().shape({
  trackId: yup.number().required(),
  packageId: yup.number().required(),
  amount: yup.number().required(),
  packageTitle: yup.string().required(),
  status: yup.string().required(),
});

const transactionUpdateSchema = yup.object().shape({
  trackId: yup.number().required(),
  referenceId: yup.number().required(),
  tranId: yup.number().required(),
  status: yup.string().required(),
});

const transactionUpdateStatusSchema = yup.object().shape({
  trackId: yup.number().required(),
  status: yup.string().required(),
});

export { transactionSchema, transactionUpdateSchema, transactionUpdateStatusSchema };
