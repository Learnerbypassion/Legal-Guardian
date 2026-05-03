import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Profile = () => {
  const { user, logout, sendEmailOTP, verifyEmailOTP } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [profDetails, setProfDetails] = React.useState({
    education: user?.professionalDetails?.education || '',
    experience: user?.professionalDetails?.experience || '',
    credentials: user?.professionalDetails?.credentials || '',
    profession: user?.professionalDetails?.profession || 'Lawyer',
  });
  const [message, setMessage] = React.useState('');
  
  const [emailVerifying, setEmailVerifying] = React.useState(false);
  const [emailOtp, setEmailOtp] = React.useState('');
  const [otpSent, setOtpSent] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSendEmailOtp = async () => {
    try {
      setLoading(true);
      setMessage('');
      await sendEmailOTP();
      setOtpSent(true);
      setEmailVerifying(true);
      setMessage('OTP sent to your email.');
    } catch (err) {
      setMessage(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      setLoading(true);
      setMessage('');
      await verifyEmailOTP(emailOtp);
      setEmailVerifying(false);
      setOtpSent(false);
      setEmailOtp('');
      setMessage('Email verified successfully!');
    } catch (err) {
      setMessage(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProfChange = (e) => {
    setProfDetails({ ...profDetails, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setMessage('');
      const { updateProfile } = await import('../services/api');
      await updateProfile(profDetails);
      setMessage('Profile updated successfully! Refresh to see changes.');
      setEditing(false);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Profile
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Messages */}
        {message && !editing && (
          <div className={`p-4 mb-6 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
            {message}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-6 mb-8">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Basic Info */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-500">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* User Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email Verification</label>
                <div className="flex items-center gap-2">
                  {user.isEmailVerified ? (
                    <>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <p className="text-green-600 font-medium">Verified</p>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <p className="text-yellow-600 font-medium">Pending</p>
                      {!emailVerifying && (
                        <button
                          onClick={handleSendEmailOtp}
                          disabled={loading}
                          className="ml-4 text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200 transition font-semibold"
                        >
                          Verify Now
                        </button>
                      )}
                    </>
                  )}
                </div>
                {emailVerifying && !user.isEmailVerified && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                      maxLength="6"
                      className="px-3 py-1 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm w-40"
                    />
                    <button
                      onClick={handleVerifyEmail}
                      disabled={loading || emailOtp.length !== 6}
                      className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => { setEmailVerifying(false); setOtpSent(false); setMessage(''); }}
                      className="text-xs text-gray-500 hover:text-gray-700 ml-1"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                <p className="text-gray-900 font-medium">{user.phone}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone Verification</label>
                <div className="flex items-center gap-2">
                  {user.isPhoneVerified ? (
                    <>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <p className="text-green-600 font-medium">Verified</p>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <p className="text-yellow-600 font-medium">Pending</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">User Type</label>
                <p className="text-gray-900 font-medium capitalize">{user.userType || 'General'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Preferred Language</label>
                <p className="text-gray-900 font-medium">{user.preferredLanguage || 'English'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                <p className="text-gray-900 font-medium capitalize">{user.role || 'User'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Member ID</label>
                <p className="text-gray-900 font-mono text-sm">{user._id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Details Section */}
        {user.role === 'professional' && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Professional Details</h3>
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 text-indigo-600 font-medium border border-indigo-600 rounded-lg hover:bg-indigo-50 transition"
              >
                {editing ? 'Cancel' : 'Edit Details'}
              </button>
            </div>

            {message && (
              <div className={`p-4 mb-4 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profession Type</label>
                  <select
                    name="profession"
                    value={profDetails.profession}
                    onChange={handleProfChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Lawyer">Lawyer</option>
                    <option value="CA">Chartered Accountant (CA)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                  <input
                    type="text"
                    name="education"
                    value={profDetails.education}
                    onChange={handleProfChange}
                    placeholder="e.g. LLB, LLM, CA"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <input
                    type="text"
                    name="experience"
                    value={profDetails.experience}
                    onChange={handleProfChange}
                    placeholder="e.g. 5 years in Corporate Law"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credentials/License</label>
                  <input
                    type="text"
                    name="credentials"
                    value={profDetails.credentials}
                    onChange={handleProfChange}
                    placeholder="e.g. Bar Council Number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  {loading ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Profession</label>
                  <p className="text-gray-900">{user.professionalDetails?.profession || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Education</label>
                  <p className="text-gray-900">{user.professionalDetails?.education || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Experience</label>
                  <p className="text-gray-900">{user.professionalDetails?.experience || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Credentials</label>
                  <p className="text-gray-900">{user.professionalDetails?.credentials || 'Not set'}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Account Actions */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Account Actions</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Back to Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <h4 className="font-semibold text-blue-900 mb-2">Security Information</h4>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>✓ Your password is securely hashed</li>
            <li>✓ Your phone number is verified via SMS</li>
            <li>✓ All data is encrypted in transit</li>
            <li>✓ Your account is protected by JWT authentication</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
