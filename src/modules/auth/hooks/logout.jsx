export const handleLogout = (setUsername) => {
  setUsername(null);
  localStorage.removeItem("kickUsername");
};
