export const removeNullFieldsFromObject = (input: object) =>
  Object.fromEntries(
    Object.entries(input).filter(
      ([_, v]) =>
        v != null &&
        v !== undefined &&
        typeof v === "object" &&
        Object.keys(v).length > 0
    )
  );
