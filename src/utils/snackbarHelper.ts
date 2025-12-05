import { enqueueSnackbar, OptionsObject } from "notistack";

export const toast = (
  message: string,
  options?: OptionsObject
): void => {
  enqueueSnackbar(message, options);
};

