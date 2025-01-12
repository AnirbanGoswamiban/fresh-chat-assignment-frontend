const UserList = ({ users = [], activeUser, setActiveUser }) => {
  return (
    <div className="w-1/4  bg-white shadow-md">
      <h2 className="text-lg font-bold p-4 border-b">Users</h2>
      <ul className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-64px)]">
        {users.map((user,index) => (
          <li
            key={index}
            className={`p-2 rounded-md cursor-pointer ${
              activeUser && activeUser.userId === user.userId
                ? "bg-primary text-white"
                : "hover:bg-gray-200"
            }`}
            onClick={() => setActiveUser(user)}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{user.userId.name}</span>
              <span
                className={`text-sm ${
                  user.status === "online"
                    ? "text-green-500"
                    : "text-gray-500"
                }`}
              >
                {user.status === "online" ? "Online" : "Offline"}
              </span>
            </div>
            {user.lastMessage && (
              <span className="text-sm text-gray-500">
                Last message: {user.lastMessage}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
