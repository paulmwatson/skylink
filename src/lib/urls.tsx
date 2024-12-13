// hostnames are case insenstivie but paths are not
export const urlLowercaseHostname = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    parsedUrl.hostname = parsedUrl.hostname.toLowerCase();
    return parsedUrl.toString();
  } catch (error) {
    return url;
  }
};
