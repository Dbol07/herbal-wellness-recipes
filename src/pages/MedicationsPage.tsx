import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore, Medication } from '@/hooks/useAppStore';
import ParchmentCard from '@/components/ParchmentCard';
import WaxButton from '@/components/WaxButton';
import FormInput from '@/components/FormInput';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function MedicationsPage() {
  const { user } = useAuth();
  const { medications, setMedications } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Medication | null>(null);
  const [form, setForm] = useState({ name: '', dose: '', frequency: '', food_interactions: '', notes: '' });

  useEffect(() => { fetchMedications(); }, [user]);

  const fetchMedications = async () => {
    if (!user) return;
    const { data } = await supabase.from('medications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setMedications(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (editing) {
      await supabase.from('medications').update(form).eq('id', editing.id);
    } else {
      await supabase.from('medications').insert({ ...form, user_id: user.id });
    }
    resetForm();
    fetchMedications();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('medications').delete().eq('id', id);
    fetchMedications();
  };

  const handleEdit = (med: Medication) => {
    setEditing(med);
    setForm({ name: med.name, dose: med.dose, frequency: med.frequency, food_interactions: med.food_interactions, notes: med.notes });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ name: '', dose: '', frequency: '', food_interactions: '', notes: '' });
    setEditing(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-[#f2ebd7]">Medications</h1>
        <WaxButton onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add</WaxButton>
      </div>
      {showForm && (
        <ParchmentCard variant="leather">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif text-xl">{editing ? 'Edit' : 'Add'} Medication</h2>
            <button onClick={resetForm} className="text-[#a77a72] hover:text-[#f2ebd7]"><X /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Dose" value={form.dose} onChange={(v) => setForm({ ...form, dose: v })} />
              <FormInput label="Frequency" value={form.frequency} onChange={(v) => setForm({ ...form, frequency: v })} type="select" options={['Daily', 'Twice Daily', 'Weekly', 'As Needed']} />
            </div>
            <FormInput label="Food Interactions" value={form.food_interactions} onChange={(v) => setForm({ ...form, food_interactions: v })} type="textarea" />
            <WaxButton type="submit">{editing ? 'Update' : 'Save'}</WaxButton>
          </form>
        </ParchmentCard>
      )}
      <div className="grid gap-4">
        {medications.map((med) => (
          <ParchmentCard key={med.id}>
            <div className="flex justify-between">
              <div>
                <h3 className="font-serif text-lg text-[#5f3c43]">{med.name}</h3>
                <p className="text-sm text-[#3c6150]">{med.dose} - {med.frequency}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(med)} className="p-2 text-[#3c6150] hover:text-[#5f3c43]"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(med.id)} className="p-2 text-[#a77a72] hover:text-[#8b3a3a]"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </ParchmentCard>
        ))}
        {medications.length === 0 && <p className="text-center text-[#b8d3d5] py-8">No medications added yet</p>}
      </div>
    </div>
  );
}
