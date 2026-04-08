"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { formatPhone } from "@/app/checkout/utils/phoneValidation";

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
    phone: formatPhone(user.phone || "", "BE")
  });
  const displayPhone = formatPhone(user.phone || "", "BE");

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white border border-black rounded-2xl p-4 sm:p-6 lg:p-8">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8">Profile Information</h3>
        
        <div className="flex items-center gap-4 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-black bg-gray-100 flex items-center justify-center">
            <span className="text-2xl sm:text-3xl font-bold text-gray-700">
              {(user.name || "U").trim().charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2">Full Name</label>
            <input
              type="text"
              value={isEditing ? editedUser.name : user.name}
              onChange={(e) => isEditing && setEditedUser({...editedUser, name: e.target.value})}
              disabled={!isEditing}
              className={`w-full bg-white px-3 sm:px-4 py-2.5 sm:py-3 border border-black rounded-xl focus:outline-none transition-colors text-sm ${
                isEditing 
                  ? "focus:border-[#266000]" 
                  : "bg-gray-100 cursor-not-allowed text-gray-900"
              }`}
              placeholder="Your name"
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2">Email Address</label>
            <input
              type="email"
              value={isEditing ? editedUser.email : user.email}
              onChange={(e) => isEditing && setEditedUser({...editedUser, email: e.target.value})}
              disabled={!isEditing}
              className={`w-full bg-white px-3 sm:px-4 py-2.5 sm:py-3 border border-black rounded-xl focus:outline-none transition-colors text-sm ${
                isEditing 
                  ? "focus:border-[#266000]" 
                  : "bg-gray-100 cursor-not-allowed"
              }`}
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2">Phone Number</label>
            <input
              type="tel"
              value={isEditing ? editedUser.phone : displayPhone}
              onChange={(e) =>
                isEditing && setEditedUser({ ...editedUser, phone: formatPhone(e.target.value, "BE") })
              }
              disabled={!isEditing}
              className={`w-full bg-white px-3 sm:px-4 py-2.5 sm:py-3 border border-black rounded-xl focus:outline-none transition-colors text-sm ${
                isEditing 
                  ? "focus:border-[#266000]" 
                  : "bg-gray-100 cursor-not-allowed"
              }`}
              placeholder="+32 323-333-3333"
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-2">Password</label>
            <input
              type="password"
              value="••••••••"
              readOnly
              disabled={!isEditing}
              className={`w-full bg-white px-3 sm:px-4 py-2.5 sm:py-3 border border-black rounded-xl text-gray-500 text-sm ${
                isEditing ? "" : "bg-gray-100 cursor-not-allowed"
              }`}
            />
            <button className="mt-2 text-[#266000] text-xs sm:text-sm font-semibold hover:underline">
              Change Password
            </button>
          </div>
        </div>
        
        <div className="mt-6 sm:mt-8 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => {
                setIsEditing(false);
                setEditedUser({
                  name: user.name,
                  email: user.email,
                  phone: formatPhone(user.phone || "", "BE")
                });
              }}
                className="bg-white border border-black text-gray-900 py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl font-bold text-sm sm:text-base hover:border-[#266000] hover:text-[#266000] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onUserUpdate({...editedUser, avatar: user.avatar});
                  setIsEditing(false);
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl font-bold text-sm sm:text-base transition-colors"
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
                  phone: formatPhone(user.phone || "", "BE")
                });
                setIsEditing(true);
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl font-bold text-sm sm:text-base transition-colors"
            >
              Edit Info
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
