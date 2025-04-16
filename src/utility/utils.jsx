// utils.js

export const toUpperCaseName = (name) => name.toUpperCase();

export const parseDate = (dobRaw) => {
  const parsedDate = new Date(dobRaw);
  return !isNaN(parsedDate) ? Timestamp.fromDate(parsedDate) : null;
};

export const parseFullName = (fullName) => {
  const [lastNamePart, firstAndMiddle] = fullName.split(",");
  if (!firstAndMiddle) return null;

  const lastname = toUpperCaseName(lastNamePart.trim());
  const nameParts = firstAndMiddle.trim().split(" ");
  const middleInitial = nameParts.pop()?.replace(".", "") || "";
  const firstname = toUpperCaseName(nameParts.join(" ").trim());

  return { firstname, middleInitial, lastname };
};
