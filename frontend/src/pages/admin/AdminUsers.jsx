// pages/admin/AdminUsers.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
} from "../../redux/actions/userAction";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  UserGroupIcon,
  EnvelopeIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const dispatch = useDispatch();
  const {
    users,
    loading,
    totalUsers,
    user: currentUser,
  } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ role: "", isActive: false });

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleUpdateStatus = async (userId, currentStatus) => {
    if (
      window.confirm(
        `Are you sure you want to ${currentStatus ? "deactivate" : "activate"} this user?`,
      )
    ) {
      await dispatch(
        updateUserStatus({ id: userId, isActive: !currentStatus }),
      );
      dispatch(getAllUsers());
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    if (
      window.confirm(
        `Are you sure you want to change this user's role to ${newRole}?`,
      )
    ) {
      await dispatch(updateUserRole({ id: userId, role: newRole }));
      dispatch(getAllUsers());
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (
      window.confirm(
        `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
      )
    ) {
      await dispatch(deleteUser(userId));
      dispatch(getAllUsers());
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({ role: user.role, isActive: user.isActive });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    setEditForm({ role: "", isActive: false });
  };

  const saveUserChanges = async () => {
    if (editingUser) {
      if (editForm.role !== editingUser.role) {
        await dispatch(
          updateUserRole({ id: editingUser._id, role: editForm.role }),
        );
      }
      if (editForm.isActive !== editingUser.isActive) {
        await dispatch(
          updateUserStatus({
            id: editingUser._id,
            isActive: editForm.isActive,
          }),
        );
      }
      dispatch(getAllUsers());
      closeEditModal();
      toast.success("User updated successfully");
    }
  };

  const filteredUsers = users?.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Calculate statistics
  const activeUsers = users?.filter((u) => u.isActive).length || 0;
  const adminUsers = users?.filter((u) => u.role === "admin").length || 0;
  const restaurantOwners =
    users?.filter((u) => u.role === "restaurant_owner").length || 0;
  const regularUsers = users?.filter((u) => u.role === "user").length || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-500 mt-1">
            View and manage all user accounts
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalUsers || 0}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Active Users</p>
            <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Restaurant Owners</p>
            <p className="text-2xl font-bold text-blue-600">
              {restaurantOwners}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Admin Users</p>
            <p className="text-2xl font-bold text-purple-600">{adminUsers}</p>
          </div>
          <div className="bg-orange-50 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Regular Users</p>
            <p className="text-2xl font-bold text-orange-600">{regularUsers}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers?.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleUpdateRole(user._id, e.target.value)
                        }
                        className="text-sm rounded-lg border-gray-300 focus:ring-orange-500 focus:border-orange-500 px-2 py-1"
                      >
                        <option value="user">User</option>
                        <option value="restaurant_owner">
                          Restaurant Owner
                        </option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() =>
                          handleUpdateStatus(user._id, user.isActive)
                        }
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        } transition-colors`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-orange-600 hover:text-orange-800"
                          title="Edit User"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        {user._id !== currentUser?._id && (
                          <button
                            onClick={() =>
                              handleDeleteUser(user._id, user.name)
                            }
                            className="text-red-600 hover:text-red-800"
                            title="Delete User"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {(!filteredUsers || filteredUsers.length === 0) && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {searchTerm
                        ? "No users matching your search"
                        : "No users found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Edit User</h2>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <p className="text-gray-900">{editingUser.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-900">{editingUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="user">User</option>
                  <option value="restaurant_owner">Restaurant Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setEditForm({ ...editForm, isActive: true })}
                    className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
                      editForm.isActive
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <CheckIcon className="w-4 h-4" />
                    Active
                  </button>
                  <button
                    onClick={() =>
                      setEditForm({ ...editForm, isActive: false })
                    }
                    className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
                      !editForm.isActive
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Inactive
                  </button>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveUserChanges}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
