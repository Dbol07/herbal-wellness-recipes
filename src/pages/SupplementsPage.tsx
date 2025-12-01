import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore, Supplement } from '@/hooks/useAppStore';
import ParchmentCard from '@/components/ParchmentCard';
import WaxButton from '@/components/WaxButton';
import FormInput from '@/components/FormInput';
import { Plus, Edit2, Trash2, X, Droplets } from 'lucide-react';

export default function SupplementsPage() {
  const { user } = useAuth();
  const { supplements, setSupplements } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Supplement | null>(null);
  const [form, setForm] = useState({ name: '', dosage: '', frequency: '', benefits: '' });

  useEffect(() => { fetchSupplements(); }, [user]);

  const fetchSupplements = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('supplements')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setSupplements(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (editing) {
      await supabase.from('supplements').update(form).eq('id', editing.id).eq('user_id', user.id);
    } else {
      await supabase.from('supplements').insert({ ...form, user_id: user.id });
    }
    resetForm();
    fetchSupplements();
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await supabase.from('supplements').delete().eq('id', id).eq('user_id', user.id);
    fetchSupplements();
  };

  const handleEdit = (supp: Supplement) => {
    setEditing(supp);
    setForm({ name: supp.name, dosage: supp.dosage, frequency: supp.frequency, benefits: supp.benefits });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ name: '', dosage: '', frequency: '', benefits: '' });
    setEditing(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Droplets className="w-8 h-8 text-[#3c6150]" />
          <h1 className="font-serif text-3xl text-[#f2ebd7]">Supplements</h1>
        </div>
        <WaxButton variant="secondary" onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add</WaxButton>
      </div>

      {showForm && (
        <ParchmentCard variant="linen">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif text-xl">{editing ? 'Edit' : 'Add'} Supplement</h2>
            <button onClick={resetForm} className="text-[#a77a72] hover:text-[#f2ebd7]"><X /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Dosage" value={form.dosage} onChange={(v) => setForm({ ...form, dosage: v })} />
              <FormInput label="Frequency" value={form.frequency} onChange={(v) => setForm({ ...form, frequency: v })} type="select" options={['Daily', 'Twice Daily', 'Weekly', 'As Needed']} />
            </div>
            <FormInput label="Benefits" value={form.benefits} onChange={(v) => setForm({ ...form, benefits: v })} type="textarea" placeholder="Health benefits of this supplement..." />
            <WaxButton variant="secondary" type="submit">{editing ? 'Update' : 'Save'} Supplement</WaxButton>
          </form>
        </ParchmentCard>
      )}

      <div className="grid gap-4">
        {supplements.map((supp) => (
          <ParchmentCard key={supp.id} variant="linen" glow>
            <div className="flex justify-between">
              <div>
                <h3 className="font-serif text-lg text-[#b8d3d5]">{supp.name}</h3>
                <p className="text-sm text-[#3c6150]">{supp.dosage} - {supp.frequency}</p>
                {supp.benefits && <p className="text-xs text-[#a77a72] mt-2">Benefits: {supp.benefits}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(supp)} className="p-2 text-[#b8d3d5] hover:text-[#f2ebd7]"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(supp.id)} className="p-2 text-[#a77a72] hover:text-[#8b3a3a]"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </ParchmentCard>
        ))}
        {supplements.length === 0 && <p className="text-center text-[#b8d3d5] py-8">No supplements added yet</p>}
      </div>
    </div>
  );
}
