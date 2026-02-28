export const getIO = () => {
  if (typeof global !== "undefined" && global.io) {
    return global.io;
  }
  console.warn("⚠️ [SOCKET] global.io is UNDEFINED. Socket emission will fail.");
  return null;
};