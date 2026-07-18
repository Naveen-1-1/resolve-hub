// In-memory user storage (replace with MongoDB later)
let users = [
  {
    id: "1763666945288",
    email: "naveen@example.com",
    passwordHash:
      "$2b$10$Nvh.4Ceur1t3O4i2At6MreGsViVJgu6SWx/GaRrRGrm7OG7gj1YLK",
    name: "Naveen",
  },
];

export const createUser = (user) => {
  const newUser = {
    id: Date.now().toString(),
    ...user,
  };
  users.push(newUser);
  return newUser;
};

export const findUserByEmail = (email) => {
  return users.find((user) => user.email === email);
};

export const findUserById = (id) => {
  return users.find((user) => user.id === id);
};

export const getAllUsers = () => {
  return users;
};
