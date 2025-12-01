import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore, Allergy } from '@/hooks/useAppStore';
import ParchmentCard from '@/components/ParchmentCard';
import WaxButton from '@/components/WaxButton';
import FormInput from '@/components/FormInput';
import { Plus, Edit2, Trash2, X, ShieldAlert } from 'lucide-react';

export default function AllergiesPage() {
  const { user } = useAuth();
  const { allergies, setAllergies } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Allergy | null>(null);
  const [form, setForm] = useState({ name: '', severity: '', notes: '' });

  useEffect(() => { fetchAllergies(); }, [user]);

  const fetchAllergies = async () => {
    if (!user) return;
    const { data } = await supabase.from('allergies').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setAllergies(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (editing) {
      await supabase.from('allergies').update(form).eq('id', editing.id);
    } else {
      await supabase.from('allergies').insert({ ...form, user_id: user.id });
    }
    resetForm();
    fetchAllergies();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('allergies').delete().eq('id', id);
    fetchAllergies();
  };

  const handleEdit = (allergy: Allergy) => {
    setEditing(allergy);
    setForm({ name: allergy.name, severity: allergy.severity, notes: allergy.notes });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ name: '', severity: '', notes: '' });
    setEditing(null);
    setShowForm(false);
  };

  const severityColors: Record<string, string> = {
    Mild: 'bg-[#3c6150] text-[#f2ebd7]',
    Moderate: 'bg-[#a77a72] text-[#f2ebd7]',
    Severe: 'bg-[#8b3a3a] text-[#f2ebd7]',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-[#a77a72]" />
          <h1 className="font-serif text-3xl text-[#f2ebd7]">Allergies & Sensitivities</h1>
        </div>
        <WaxButton variant="danger" onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add</WaxButton>
      </div>

      {showForm && (
        <ParchmentCard variant="leather">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif text-xl">{editing ? 'Edit' : 'Add'} Allergy</h2>
            <button onClick={resetForm} className="text-[#a77a72] hover:text-[#f2ebd7]"><X /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput label="Allergen Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required placeholder="e.g., Peanuts, Shellfish, Dairy" />
            <FormInput label="Severity" value={form.severity} onChange={(v) => setForm({ ...form, severity: v })} type="select" options={['Mild', 'Moderate', 'Severe']} />
            <FormInput label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} type="textarea" placeholder="Symptoms, reactions, etc." />
            <WaxButton variant="danger" type="submit">{editing ? 'Update' : 'Save'} Allergy</WaxButton>
          </form>
        </ParchmentCard>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {allergies.map((allergy) => (
          <ParchmentCard key={allergy.id}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-serif text-lg text-[#5f3c43]">{allergy.name}</h3>
                  {allergy.severity && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${severityColors[allergy.severity] || 'bg-[#3c6150]'}`}>
                      {allergy.severity}
                    </span>
                  )}
                </div>
                {allergy.notes && <p className="text-sm text-[#3c6150]">{allergy.notes}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(allergy)} className="p-2 text-[#3c6150] hover:text-[#5f3c43]"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(allergy.id)} className="p-2 text-[#a77a72] hover:text-[#8b3a3a]"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </ParchmentCard>
        ))}
        {allergies.length === 0 && <p className="text-center text-[#b8d3d5] py-8 col-span-2">No allergies or sensitivities added</p>}
      </div>
    </div>
  );
}
