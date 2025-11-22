/* eslint-disable react/no-unescaped-entities */
'use client';
import { useEffect, useMemo, useState } from 'react';
import { t, useI18n } from '@/lib/i18n/I18nProvider';
import { getDb } from '@/lib/sqlite/db';
import dayjs from 'dayjs';
import Link from 'next/link';
import jsPDF from 'jspdf';

type Project = {
  id: number;
  name: string;
  owner: string | null;
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
};

export default function ProjectsPage() {
  const { dir } = useI18n();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<Partial<Project>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const sorted = useMemo(
    () => [...projects].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)),
    [projects]
  );

  useEffect(() => {
    (async () => {
      const db = getDb();
      await db.ready;
      const rows = db.all<Project>('SELECT * FROM projects');
      setProjects(rows);
      setLoading(false);
    })();
  }, []);

  const resetForm = () => {
    setForm({});
    setEditingId(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = getDb();
    await db.ready;
    if (editingId) {
      db.run(
        `UPDATE projects
         SET name=?, owner=?, budget=?, start_date=?, end_date=?, status=?
         WHERE id=?`,
        [
          form.name ?? '',
          form.owner ?? null,
          form.budget ?? null,
          form.start_date ?? null,
          form.end_date ?? null,
          form.status ?? 'active',
          editingId,
        ]
      );
    } else {
      db.run(
        `INSERT INTO projects (name, owner, budget, start_date, end_date, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          form.name ?? '',
          form.owner ?? null,
          form.budget ?? null,
          form.start_date ?? null,
          form.end_date ?? null,
          form.status ?? 'active',
        ]
      );
    }
    const rows = db.all<Project>('SELECT * FROM projects');
    setProjects(rows);
    resetForm();
    await db.persist();
  };

  const onEdit = (p: Project) => {
    setEditingId(p.id);
    setForm(p);
  };

  const onDelete = async (id: number) => {
    const db = getDb();
    await db.ready;
    db.run('DELETE FROM projects WHERE id = ?', [id]);
    const rows = db.all<Project>('SELECT * FROM projects');
    setProjects(rows);
    await db.persist();
  };

  if (loading) return <div className="p-6">{t('loading')}</div>;

  return (
    <main className="container mx-auto max-w-6xl p-4 md:p-6" dir={dir}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">{t('projects')}</h1>
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={() => {
            const headers = ['id','name','owner','budget','start_date','end_date','status'];
            const rows = [headers.join(',')].concat(sorted.map(p =>
              [p.id,p.name,p.owner ?? '',p.budget ?? '',p.start_date ?? '',p.end_date ?? '',p.status].join(',')
            ));
            const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'projects.csv';
            a.click();
            URL.revokeObjectURL(url);
          }}>{t('export_csv') || '????? CSV'}</button>
          <button className="btn btn-outline" onClick={() => {
            const doc = new jsPDF({ orientation: 'landscape' });
            doc.setFontSize(12);
            let y = 10;
            doc.text('Projects Report', 10, y);
            y += 8;
            sorted.forEach((p, i) => {
              const line = `${p.id} | ${p.name} | ${p.owner ?? ''} | ${p.budget ?? ''} | ${p.start_date ?? ''} ? ${p.end_date ?? ''} | ${p.status}`;
              doc.text(line, 10, y);
              y += 6;
              if (y > 190 && i < sorted.length - 1) {
                doc.addPage();
                y = 10;
              }
            });
            doc.save('projects.pdf');
          }}>{t('export_pdf') || '????? PDF'}</button>
          <Link href="/" className="btn btn-outline">{t('back_dashboard')}</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 md:col-span-1">
          <h2 className="font-semibold mb-3">
            {editingId ? t('edit_project') : t('add_project')}
          </h2>
          <form className="space-y-3" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm mb-1">{t('project_name')}</label>
              <input className="w-full border rounded-md px-3 py-2"
                required
                value={form.name ?? ''}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">{t('owner')}</label>
              <input className="w-full border rounded-md px-3 py-2"
                value={form.owner ?? ''}
                onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">{t('budget')}</label>
              <input type="number" className="w-full border rounded-md px-3 py-2"
                value={form.budget ?? ''}
                onChange={e => setForm(f => ({ ...f, budget: Number(e.target.value) }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm mb-1">{t('start_date')}</label>
                <input type="date" className="w-full border rounded-md px-3 py-2"
                  value={form.start_date ?? ''}
                  onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('end_date')}</label>
                <input type="date" className="w-full border rounded-md px-3 py-2"
                  value={form.end_date ?? ''}
                  onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">{t('status')}</label>
              <select className="w-full border rounded-md px-3 py-2"
                value={form.status ?? 'active'}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              >
                <option value="active">{t('status_active')}</option>
                <option value="paused">{t('status_paused')}</option>
                <option value="completed">{t('status_completed')}</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">
                {editingId ? t('save_changes') : t('add')}
              </button>
              {editingId && (
                <button type="button" className="btn btn-outline" onClick={resetForm}>
                  {t('cancel')}
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="card p-4 md:col-span-2 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">{t('project_name')}</th>
                <th className="p-2">{t('owner')}</th>
                <th className="p-2">{t('budget')}</th>
                <th className="p-2">{t('dates')}</th>
                <th className="p-2">{t('status')}</th>
                <th className="p-2">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(p => (
                <tr key={p.id} className="border-b">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.owner}</td>
                  <td className="p-2">{p.budget?.toLocaleString()}</td>
                  <td className="p-2">
                    {p.start_date} ? {p.end_date} {p.end_date && dayjs(p.end_date).isBefore(dayjs(), 'day') && (
                      <span className="text-red-600 text-xs">{t('overdue')}</span>
                    )}
                  </td>
                  <td className="p-2">{t(`status_${p.status}` as any)}</td>
                  <td className="p-2 space-x-2 space-x-reverse">
                    <button className="btn btn-outline" onClick={() => onEdit(p)}>{t('edit')}</button>
                    <button className="btn btn-outline" onClick={() => onDelete(p.id)}>{t('delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

