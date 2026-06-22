'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { useAuth } from '@/providers/AuthProvider';
import { Header } from '@/components/layout/Header';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/PageLoader';
import { Appear } from '@/components/ui/Appear';
import type { ExpenseCategory, User } from '@/types/api';

export default function SettingsPage() {
  const { user: fbUser } = useAuth();
  const qc = useQueryClient();
  const [showAddCat, setShowAddCat] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', icon: '', color: '#339966' });
  const [error, setError] = useState('');

  const { data: me, isLoading: loadingMe }         = useQuery<User>({ queryKey: ['me'], queryFn: () => apiFetch('/users/me') });
  const { data: categories = [], isLoading: loadingCats } = useQuery<ExpenseCategory[]>({ queryKey: ['categories'], queryFn: () => apiFetch('/categories') });
  const isLoading = loadingMe || loadingCats;

  const addCategory = useMutation({
    mutationFn: () => apiFetch('/categories', { method: 'POST', body: JSON.stringify(catForm) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setShowAddCat(false); setCatForm({ name:'',icon:'',color:'#339966' }); },
    onError: (e: Error) => setError(e.message),
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => apiFetch(`/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });

  if (isLoading) return <PageLoader cards={2} />;

  return (
    <div>
      <Header title="Settings" />
      <div className="p-6 space-y-6">

        {/* Account info */}
        <Appear><Card>
          <CardTitle className="mb-4">Account</CardTitle>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="font-medium">{me?.display_name ?? fbUser?.displayName ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium">{me?.email ?? fbUser?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pay start date</span>
              <span className="font-medium">{me?.pay_start_date ?? 'Not set'}</span>
            </div>
          </div>
        </Card></Appear>

        {/* Categories */}
        <Appear delay={60}><Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Categories</CardTitle>
            <Button size="sm" onClick={() => setShowAddCat(true)}>+ Add</Button>
          </div>
          <div className="space-y-2">
            {categories.map(c => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-[#e8e3d8] last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color ?? '#999' }} />
                  <span className="text-sm">{c.icon} {c.name}</span>
                  {c.is_default && <span className="text-xs text-gray-400">(default)</span>}
                </div>
                {!c.is_default && (
                  <button className="text-xs text-red-400 hover:text-red-600" onClick={() => deleteCategory.mutate(c.id)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card></Appear>
      </div>

      <Modal open={showAddCat} onClose={() => setShowAddCat(false)} title="Add category">
        <div className="space-y-4">
          <Input label="Name" value={catForm.name} onChange={e => setCatForm(f => ({...f,name:e.target.value}))} placeholder="e.g. Pet care" />
          <Input label="Icon (emoji)" value={catForm.icon} onChange={e => setCatForm(f => ({...f,icon:e.target.value}))} placeholder="🐾" />
          <Input label="Color (hex)" value={catForm.color} onChange={e => setCatForm(f => ({...f,color:e.target.value}))} type="color" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowAddCat(false)}>Cancel</Button>
            <Button className="flex-1" loading={addCategory.isPending} onClick={() => addCategory.mutate()} disabled={!catForm.name}>Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
