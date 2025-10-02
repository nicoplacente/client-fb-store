export const handleLogin = (user, setUsername) => {
  localStorage.setItem("kickUsername", user);
  setUsername(user);
};
