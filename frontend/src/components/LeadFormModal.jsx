import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const initialForm = {
  fullName: '',
  email: '',
  countryCode: '+91',
  phone: '',
  companyName: '',
  industry: 'SaaS / IT',
  location: '',
  leadSource: 'Website',
  leadStatus: 'New',
  followUpDate: '',
  followUpCompleted: false,
  notes: '',
};

const countryCodes = [
  { code: '+91', label: '+91 (IN)' },
  { code: '+1', label: '+1 (US/CA)' },
  { code: '+44', label: '+44 (UK)' },
  { code: '+49', label: '+49 (DE)' },
  { code: '+971', label: '+971 (AE)' },
  { code: '+65', label: '+65 (SG)' },
  { code: '+61', label: '+61 (AU)' },
];

export default function LeadFormModal({
  isOpen,
  onClose,
  onSave,
  editingLead,
  serverError,
}) {
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const minDate = editingLead?.createdDate
    ? new Date(editingLead.createdDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  useEffect(() => {
    setFormError('');
    setSaving(false);
    if (editingLead) {
      setFormData({
        ...initialForm,
        ...editingLead,
        countryCode: editingLead.countryCode || '+91',
        followUpDate: editingLead.followUpDate
          ? new Date(editingLead.followUpDate).toISOString().split('T')[0]
          : '',
        followUpCompleted: Boolean(editingLead.followUpCompleted),
      });
    } else {
      setFormData(initialForm);
    }
  }, [editingLead, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Reject letters or invalid characters immediately on the frontend
    if (!/^[\d\s()-]{6,15}$/.test(formData.phone.trim())) {
      setFormError('Please enter a valid phone number (6-15 digits, numbers only).');
      return;
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 6 || phoneDigits.length > 15) {
      setFormError('Please enter a valid phone number containing 6 to 15 digits.');
      return;
    }

    if (formData.followUpDate && formData.followUpDate < minDate) {
      setFormError(`Follow-up date cannot be earlier than ${minDate}.`);
      return;
    }

    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  const activeError = formError || serverError;

  return (
    <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 my-auto">
        <div className="flex justify-between items-center pb-4 mb-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingLead ? 'Update Lead Details' : 'Add New Lead'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Capture company profile, location, status, and follow-up schedule
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {activeError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-600">
            {activeError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Jane Doe"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1908A6]"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                placeholder="Company Name"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1908A6]"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="jane.doe@company.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1908A6]"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Code & Phone Number *
              </label>
              <div className="flex gap-2">
                <select
                  className="w-28 shrink-0 px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1908A6]"
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                >
                  {countryCodes.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  required
                  placeholder="98230 11223"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1908A6]"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Company Type / Industry
              </label>
              <select
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1908A6]"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              >
                <option value="SaaS / IT">SaaS / IT</option>
                <option value="FinTech">FinTech</option>
                <option value="E-Commerce">E-Commerce</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Marketing / Agency">Marketing / Agency</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Office Location (Optional)
              </label>
              <input
                type="text"
                placeholder="City, Country"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1908A6]"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Lead Source
              </label>
              <select
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1908A6]"
                value={formData.leadSource}
                onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
              >
                <option value="Website">Website</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Referral">Referral</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Lead Status
              </label>
              <select
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1908A6]"
                value={formData.leadStatus}
                onChange={(e) => setFormData({ ...formData, leadStatus: e.target.value })}
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Interested">Interested</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Next Follow-Up
              </label>
              <input
                type="date"
                min={minDate}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1908A6]"
                value={formData.followUpDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    followUpDate: e.target.value,
                    followUpCompleted: false,
                  })
                }
              />
            </div>
          </div>

          {formData.followUpDate && (
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.followUpCompleted}
                onChange={(e) =>
                  setFormData({ ...formData, followUpCompleted: e.target.checked })
                }
                className="rounded border-slate-300 text-[#1908A6]"
              />
              <span>Mark scheduled follow-up as Completed</span>
            </label>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Follow-Up Note (Optional)
            </label>
            <input
              type="text"
              placeholder="Add follow-up notes or action items..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1908A6]"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 text-sm bg-[#1908A6] hover:bg-[#130682] disabled:opacity-60 text-white font-semibold rounded-full shadow-sm transition cursor-pointer"
            >
              {saving ? 'Saving...' : editingLead ? 'Update Lead' : '+ Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}