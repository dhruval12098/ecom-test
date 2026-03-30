"use client";

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface MobileProfileHeaderProps {
  user: User;
}

export default function MobileProfileHeader({ user }: MobileProfileHeaderProps) {
  return (
    <div className="bg-white border border-black rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full border-2 border-black bg-gray-100 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-700">
            {(user.name || "U").trim().charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{user.name}</h3>
          <p className="text-gray-600 text-sm">{user.email}</p>
        </div>
      </div>
    </div>
  );
}
