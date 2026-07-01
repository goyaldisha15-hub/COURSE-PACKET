import Layout from "../../components/layout/Layout";

const users = [
  { id: 1, name: "Aman", email: "aman@gmail.com", role: "faculty" },
  { id: 2, name: "Riya", email: "riya@gmail.com", role: "student" },
  { id: 3, name: "Karan", email: "karan@gmail.com", role: "student" },
  { id: 4, name: "Neha", email: "neha@gmail.com", role: "admin" },
];

export default function Users() {
  const handleLogout = () => {
    console.log("logout");
  };

  return (
    <Layout
      title="Users"
      subtitle="Manage admin, faculty and student users"
      onLogout={handleLogout}
    >
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">User List</h3>
          <button className="btn-primary">Add User</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-slate-50">
                  <td className="p-3">{user.id}</td>
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3 capitalize">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}