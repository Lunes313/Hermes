import React from 'react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { KanbanBoard } from '../components/admin/KanbanBoard';

export const AdminPage: React.FC = () => {
  return (
    <AdminLayout>
      <KanbanBoard />
    </AdminLayout>
  );
};
