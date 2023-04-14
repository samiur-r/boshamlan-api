const parseTimestamp = (timestamp: Date) => {
  const dateObj = new Date(timestamp);

  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear().toString().slice(-2);

  const hour = dateObj.getHours().toString().padStart(2, '0');
  const minute = dateObj.getMinutes().toString().padStart(2, '0');
  const second = dateObj.getSeconds().toString().padStart(2, '0');

  const parsedDate = `${day}-${month}-${year}`;
  const parsedTime = `${hour}:${minute}:${second}`;

  return { parsedDate, parsedTime };
};

export { parseTimestamp };
