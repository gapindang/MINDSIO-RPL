console.log("🧪 Test 1: Health Check");
fetch("http://localhost:5000/api/health")
  .then((res) => res.json())
  .then((data) => console.log("✅ Backend OK:", data))
  .catch((err) => console.error("❌ Backend Error:", err));

console.log("\n🧪 Test 2: Test Login");
const loginData = {
  username: "siswa_adi",
  password: "mindsio123",
};

fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(loginData),
})
  .then((res) => res.json())
  .then((data) => {
    if (data.token) {
      console.log("✅ Login Successful!");
      console.log("User:", data.user);
      console.log("Token:", data.token);
      // Simpan token untuk test berikutnya
      localStorage.setItem("token", data.token);
    } else {
      console.error("❌ Login Failed:", data.message);
    }
  })
  .catch((err) => console.error("❌ Login Error:", err));

// Test 3: Protected Route - Get Profile
console.log("\n🧪 Test 3: Get Profile (Protected Route)");
setTimeout(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("❌ No token found. Please run Test 2 first.");
    return;
  }

  fetch("http://localhost:5000/api/auth/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("✅ Profile Fetched:", data);
    })
    .catch((err) => console.error("❌ Profile Error:", err));
}, 1500);

console.log("\n📝 Tunggu ~2 detik untuk semua test selesai...");
