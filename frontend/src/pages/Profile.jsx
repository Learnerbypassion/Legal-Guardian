import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Profile = () => {
  const { user, logout, sendEmailOTP, verifyEmailOTP } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profDetails, setProfDetails] = useState({
    education: user?.professionalDetails?.education || '',
    experience: user?.professionalDetails?.experience || '',
    credentials: user?.professionalDetails?.credentials || '',
    profession: user?.professionalDetails?.profession || 'Lawyer',
  });
  const [message, setMessage] = useState('');
  
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

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
      setMessage('success:OTP sent to your email.');
    } catch (err) {
      setMessage('error:' + (err.message || 'Failed to send OTP'));
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
      setMessage('success:Email verified successfully!');
    } catch (err) {
      setMessage('error:' + (err.message || 'Verification failed'));
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
      setMessage('success:Profile updated successfully! Refresh to see changes.');
      setEditing(false);
    } catch (err) {
      setMessage('error:' + (err.response?.data?.error || 'Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F4F5F7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1B2F4E]">Account Profile</h1>
            <p className="text-[#3D4F66] font-medium mt-1">Manage your credentials and security settings.</p>
          </div>
          <div className="flex gap-3">
             <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 border-2 border-[#1B2F4E] text-[#1B2F4E] font-bold rounded-xl hover:bg-white transition shadow-sm"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-md"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {message && (
          <div className={`mb-8 p-4 rounded-xl border-l-4 shadow-sm flex items-center gap-3 ${
            message.startsWith('success') ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'
          }`}>
            <span className="font-bold text-sm">{message.split(':')[1]}</span>
          </div>
        )}

        {/* Identity Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#CBD2DC] overflow-hidden mb-8">
          <div className="h-24 bg-[#1B2F4E]"></div>
          <div className="px-8 pb-8">
            <div className="relative -mt-12 mb-6 flex items-end gap-6">
              <div className="w-24 h-24 rounded-2xl bg-[#FAF3E4] border-4 border-white flex items-center justify-center shadow-lg">
                <span className="text-[#8A6C2A] text-4xl font-bold">{user.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="pb-2">
                <h2 className="text-2xl font-bold text-[#1B2F4E]">{user.name}</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                  Member Since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[#8A6C2A] uppercase tracking-widest mb-1">Email Address</label>
                  <div className="flex flex-col gap-2">
                    <p className="text-[#1B2F4E] font-bold">{user.email}</p>
                    <div className="flex items-center gap-2">
                      {user.isEmailVerified ? (
                        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold border border-green-200 uppercase">Verified</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold border border-yellow-200 uppercase">Pending</span>
                          {!emailVerifying && (
                            <button onClick={handleSendEmailOtp} disabled={loading} className="text-xs font-bold text-[#1B2F4E] underline hover:text-[#8A6C2A]">Verify Now</button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {emailVerifying && !user.isEmailVerified && (
                  <div className="bg-[#FAF3E4] p-4 rounded-xl border border-[#8A6C2A]/20">
                    <label className="block text-xs font-bold text-[#1B2F4E] mb-2 uppercase">Enter OTP</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        placeholder="6-digit code"
                        maxLength="6"
                        className="w-full px-3 py-2 border border-[#CBD2DC] rounded-lg focus:ring-2 focus:ring-[#8A6C2A] outline-none font-mono"
                      />
                      <button onClick={handleVerifyEmail} disabled={loading || emailOtp.length !== 6} className="bg-[#1B2F4E] text-white px-4 py-2 rounded-lg font-bold text-xs">Submit</button>
                    </div>
                    <button onClick={() => setEmailVerifying(false)} className="text-[10px] text-gray-500 mt-2 underline">Cancel</button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[#8A6C2A] uppercase tracking-widest mb-1">Phone Number</label>
                  <p className="text-[#1B2F4E] font-bold">{user.phone}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase ${user.isPhoneVerified ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                    {user.isPhoneVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8A6C2A] uppercase tracking-widest mb-1">Account Role</label>
                  <p className="text-[#1B2F4E] font-bold capitalize">{user.role || 'User'} · {user.userType || 'General'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Details Section */}
        {user.role === 'professional' && (
          <div className="bg-white rounded-2xl shadow-xl border border-[#CBD2DC] p-8 mb-8">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-[#1B2F4E]">Professional Credentials</h3>
              <button
                onClick={() => setEditing(!editing)}
                className="text-sm font-bold text-[#8A6C2A] hover:text-[#1B2F4E] transition uppercase tracking-wider"
              >
                {editing ? '[ Cancel ]' : '[ Edit Details ]'}
              </button>
            </div>

            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-[#1B2F4E] mb-1">Profession</label>
                  <select name="profession" value={profDetails.profession} onChange={handleProfChange} className="w-full px-4 py-2 border border-[#CBD2DC] rounded-xl focus:ring-2 focus:ring-[#8A6C2A] outline-none">
                    <option value="Lawyer">Lawyer</option>
                    <option value="CA">Chartered Accountant (CA)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1B2F4E] mb-1">Education</label>
                  <input type="text" name="education" value={profDetails.education} onChange={handleProfChange} className="w-full px-4 py-2 border border-[#CBD2DC] rounded-xl outline-none focus:ring-2 focus:ring-[#8A6C2A]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#1B2F4E] mb-1">Experience Summary</label>
                  <input type="text" name="experience" value={profDetails.experience} onChange={handleProfChange} className="w-full px-4 py-2 border border-[#CBD2DC] rounded-xl outline-none focus:ring-2 focus:ring-[#8A6C2A]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#1B2F4E] mb-1">License/Credentials</label>
                  <input type="text" name="credentials" value={profDetails.credentials} onChange={handleProfChange} className="w-full px-4 py-2 border border-[#CBD2DC] rounded-xl outline-none focus:ring-2 focus:ring-[#8A6C2A]" />
                </div>
                <button onClick={handleSaveProfile} disabled={loading} className="md:col-span-2 py-3 bg-[#1B2F4E] text-white rounded-xl font-bold shadow-lg hover:bg-[#8A6C2A] transition-all">
                  {loading ? 'Processing...' : 'Save Updated Credentials'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                <DetailItem label="Primary Profession" value={user.professionalDetails?.profession} />
                <DetailItem label="Educational Background" value={user.professionalDetails?.education} />
                <DetailItem label="Expertise & Years" value={user.professionalDetails?.experience} />
                <DetailItem label="Bar/License ID" value={user.professionalDetails?.credentials} />
              </div>
            )}
          </div>
        )}

        {/* Security Info Card */}
        <div className="bg-[#1B2F4E] rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24"></div>
          <h3 className="text-lg font-bold mb-6 text-[#FAF3E4] uppercase tracking-widest flex items-center gap-2">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
             Security & Protection
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium text-blue-100/80">
            <li className="flex items-center gap-3">
              <span className="text-[#8A6C2A]">✦</span> AES-256 Cloud Encryption
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#8A6C2A]">✦</span> JWT Session Management
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#8A6C2A]">✦</span> Secure Password Hashing
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#8A6C2A]">✦</span> Encrypted Transit (SSL/TLS)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Helper Component for cleaner code
const DetailItem = ({ label, value }) => (
  <div>
    <label className="block text-[10px] font-bold text-[#8A6C2A] uppercase tracking-[0.2em] mb-1">{label}</label>
    <p className="text-[#1B2F4E] font-bold text-lg">{value || 'Not Configured'}</p>
  </div>
);