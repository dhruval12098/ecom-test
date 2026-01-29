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
        <div className="w-16 h-16 rounded-full border-2 border-black overflow-hidden">
          <img 
            src={user.avatar} 
            alt="Profile" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg width="64" height="64" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="32" cy="32" r="32" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" font-size="24" text-anchor="middle" dy=".3em" fill="%236b7280"%3E' + user.name.charAt(0) + '%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{user.name}</h3>
          <p className="text-gray-600 text-sm">{user.email}</p>
        </div>
      </div>
    </div>
  );
}