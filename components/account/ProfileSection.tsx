"use client";

import { useState } from "react";
import { User } from "lucide-react";

interface User {
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

interface ProfileSectionProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

export default function ProfileSection({ user, onUserUpdate }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-black rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">Profile Information</h3>
        
        <div className="flex flex-col md:flex-row items-start md:items-center mb-8 pb-8 border-b border-gray-200">
          <div className="w-24 h-24 rounded-full border-2 border-black overflow-hidden mb-4 md:mb-0 md:mr-6">
            <img 
              src={user.avatar} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg width="96" height="96" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="48" cy="48" r="48" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" font-size="36" text-anchor="middle" dy=".3em" fill="%236b7280"%3E' + user.name.charAt(0) + '%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
          <div>
            <button className="bg-white border border-black text-gray-900 py-2 px-6 rounded-xl font-semibold hover:border-[#266000] hover:text-[#266000] transition-colors mb-2">
              Change Photo
            </button>
            <p className="text-sm text-gray-600">JPG, PNG or GIF. Maximum file size 5MB</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
            <input
              type="text"
              value={isEditing ? editedUser.name : user.name}
              onChange={(e) => isEditing && setEditedUser({...editedUser, name: e.target.value})}
              disabled={!isEditing}
              className={`w-full bg-white px-4 py-3 border border-black rounded-xl focus:outline-none transition-colors ${
                isEditing 
                  ? "focus:border-[#266000]" 
                  : "bg-gray-100 cursor-not-allowed"
              }`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
            <input
              type="email"
              value={isEditing ? editedUser.email : user.email}
              onChange={(e) => isEditing && setEditedUser({...editedUser, email: e.target.value})}
              disabled={!isEditing}
              className={`w-full bg-white px-4 py-3 border border-black rounded-xl focus:outline-none transition-colors ${
                isEditing 
                  ? "focus:border-[#266000]" 
                  : "bg-gray-100 cursor-not-allowed"
              }`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number</label>
            <input
              type="tel"
              value={isEditing ? editedUser.phone : user.phone}
              onChange={(e) => isEditing && setEditedUser({...editedUser, phone: e.target.value})}
              disabled={!isEditing}
              className={`w-full bg-white px-4 py-3 border border-black rounded-xl focus:outline-none transition-colors ${
                isEditing 
                  ? "focus:border-[#266000]" 
                  : "bg-gray-100 cursor-not-allowed"
              }`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Password</label>
            <input
              type="password"
              value="••••••••"
              readOnly
              disabled={!isEditing}
              className={`w-full bg-white px-4 py-3 border border-black rounded-xl text-gray-500 ${
                isEditing ? "" : "bg-gray-100 cursor-not-allowed"
              }`}
            />
            <button className="mt-2 text-[#266000] text-sm font-semibold hover:underline">
              Change Password
            </button>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditedUser({
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                  });
                }}
                className="bg-white border border-black text-gray-900 py-3 px-8 rounded-xl font-bold hover:border-[#266000] hover:text-[#266000] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onUserUpdate({...editedUser, avatar: user.avatar});
                  setIsEditing(false);
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-8 rounded-xl font-bold transition-colors"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button 
              onClick={() => {
                setEditedUser({
                  name: user.name,
                  email: user.email,
                  phone: user.phone
                });
                setIsEditing(true);
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-8 rounded-xl font-bold transition-colors"
            >
              Edit Info
            </button>
          )}
        </div>
      </div>
    </div>
  );
}