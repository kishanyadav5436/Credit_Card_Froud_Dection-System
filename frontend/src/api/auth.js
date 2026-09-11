const DEMO_USER = {
  email: "admin@fraudguard.com",
  password: "admin123",
  name: "Kishan Kumar",
  role: "Fraud Analyst",
};

export async function login(email, password) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (
    email !== DEMO_USER.email ||
    password !== DEMO_USER.password
  ) {
    throw new Error("Invalid email or password");
  }

  const user = {
    name: DEMO_USER.name,
    email: DEMO_USER.email,
    role: DEMO_USER.role,
  };

  localStorage.setItem("fraudguard-user", JSON.stringify(user));

  return user;
}

export function getCurrentUser() {
  const savedUser = localStorage.getItem("fraudguard-user");

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem("fraudguard-user");
    return null;
  }
}

export function logout() {
  localStorage.removeItem("fraudguard-user");
}