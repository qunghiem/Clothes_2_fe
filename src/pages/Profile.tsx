import React, { useState, FormEvent, ChangeEvent } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, updateProfile } from '../store/slices/authSlice';
import { ProfileFormData } from '../types';
import Title from "../components/Title";

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    dispatch(updateProfile(formData));
    setIsEditing(false);
  };

  const handleCancel = (): void => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="border-t pt-16">
        <div className="text-center py-20">
          <p className="text-gray-500">Please log in to view your personal information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-16">
      <div className="text-2xl mb-8">
        <Title text1={"PERSONAL"} text2={"INFORMATION"} />
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
          <img 
            src={user.avatar} 
            className="w-20 h-20 rounded-full object-cover" 
            alt="Profile" 
          />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500">
              Member since: {new Date(user.createdAt).toLocaleDateString('en-US')}
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isEditing}
              className={`w-full px-3 py-2 border rounded-md ${
                isEditing 
                  ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-black' 
                  : 'border-gray-200 bg-gray-50'
              }`}
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-md ${
                isEditing 
                  ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-black' 
                  : 'border-gray-200 bg-gray-50'
              }`}
              required
            />
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={isEditing}
              placeholder="Enter phone number"
              className={`w-full px-3 py-2 border rounded-md ${
                isEditing 
                  ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-black' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            />
          </div>

          {/* Address Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              disabled={isEditing}
              placeholder="Enter address"
              rows={3}
              className={`w-full px-3 py-2 border rounded-md ${
                isEditing 
                  ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-black' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                Edit Information
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;