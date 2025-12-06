'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Spinner } from '../../../components/ui/Spinner';

import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  deleteEmployee,
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from '../services/employees.service';

import { useToastStore } from '../../../store/toast.store';
import { useUIStore } from '../../../store/ui.store';

/* ========================================================================== */
/*                            CREATE EMPLOYEE FORM                             */
/* ========================================================================== */

function CreateEmployeeForm({ onSuccess }: { onSuccess: () => void }) {
  const toast = useToastStore();
  const { closeModal } = useUIStore();

  const [form, setForm] = useState<CreateEmployeeDto>({
    username: '',
    password: '',
    position: 'CASHIER',
  });

  const [loading, setLoading] = useState(false);

  function updateField<T extends keyof CreateEmployeeDto>(key: T, value: CreateEmployeeDto[T]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.username.trim()) {
      return toast.push('error', 'Username is required');
    }
    if (!form.password.trim() || form.password.length < 4) {
      return toast.push('error', 'Password must be at least 4 characters');
    }

    try {
      setLoading(true);
      await createEmployee(form);
      toast.push('success', 'Employee created successfully');
      closeModal();
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to create employee';
      toast.push('error', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-[#1B9C6F] mb-4">Create Employee</h2>

      <Input
        label="Username"
        value={form.username}
        onChange={(e) => updateField('username', e.target.value)}
        required
      />

      <Input
        label="Password"
        type="password"
        value={form.password}
        onChange={(e) => updateField('password', e.target.value)}
        required
        minLength={4}
      />

      <Select
        label="Position"
        value={form.position}
        options={[
          { label: 'Admin', value: 'ADMIN' },
          { label: 'Cashier', value: 'CASHIER' },
        ]}
        onChange={(e) => updateField('position', e.target.value as CreateEmployeeDto['position'])}
      />

      <Button loading={loading} className="w-full" variant="primary">
        Create Employee
      </Button>
    </form>
  );
}

/* ========================================================================== */
/*                              EDIT EMPLOYEE FORM                             */
/* ========================================================================== */

function EditEmployeeForm({
  employee,
  onSuccess,
}: {
  employee: Employee;
  onSuccess: () => void;
}) {
  const toast = useToastStore();
  const { closeModal } = useUIStore();

  const [form, setForm] = useState<UpdateEmployeeDto>({
    username: employee.username,
    position: employee.position,
    isActive: employee.isActive,
  });

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField<T extends keyof UpdateEmployeeDto>(key: T, value: UpdateEmployeeDto[T]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.username?.trim()) {
      return toast.push('error', 'Username is required');
    }

    try {
      setLoading(true);
      const updateData: UpdateEmployeeDto = { ...form };
      
      // Only include password if it's provided
      if (password.trim() && password.length >= 4) {
        updateData.password = password;
      } else if (password.trim() && password.length < 4) {
        return toast.push('error', 'Password must be at least 4 characters');
      }

      await updateEmployee(employee.id, updateData);
      toast.push('success', 'Employee updated successfully');
      closeModal();
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to update employee';
      toast.push('error', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-[#1B9C6F] mb-4">Edit Employee</h2>

      <Input
        label="Username"
        value={form.username ?? ''}
        onChange={(e) => updateField('username', e.target.value)}
        required
      />

      <Input
        label="New Password (leave blank to keep current)"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter new password or leave empty"
      />

      <Select
        label="Position"
        value={form.position ?? 'CASHIER'}
        options={[
          { label: 'Admin', value: 'ADMIN' },
          { label: 'Cashier', value: 'CASHIER' },
        ]}
        onChange={(e) => updateField('position', e.target.value as UpdateEmployeeDto['position'])}
      />

      <Select
        label="Status"
        value={form.isActive ? 'true' : 'false'}
        options={[
          { label: 'Active', value: 'true' },
          { label: 'Inactive', value: 'false' },
        ]}
        onChange={(e) => updateField('isActive', e.target.value === 'true')}
      />

      <Button loading={loading} className="w-full" variant="primary">
        Save Changes
      </Button>
    </form>
  );
}

/* ========================================================================== */
/*                           EMPLOYEES TABLE COMPONENT                         */
/* ========================================================================== */

export function EmployeesTable() {
  const toast = useToastStore();
  const { openModal } = useUIStore();

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to load employees';
      toast.push('error', message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  function openCreate() {
    openModal(<CreateEmployeeForm onSuccess={loadEmployees} />);
  }

  function openEdit(emp: Employee) {
    openModal(<EditEmployeeForm employee={emp} onSuccess={loadEmployees} />);
  }

  async function handleToggleStatus(id: string) {
    if (!confirm('Are you sure you want to toggle this employee\'s status?')) {
      return;
    }

    try {
      await toggleEmployeeStatus(id);
      toast.push('success', 'Employee status updated');
      loadEmployees();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to toggle employee status';
      toast.push('error', message);
    }
  }

  async function handleDelete(id: string, username: string) {
    if (!confirm(`Are you sure you want to delete employee "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteEmployee(id);
      toast.push('success', 'Employee deleted successfully');
      loadEmployees();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to delete employee';
      toast.push('error', message);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} variant="primary">Add Employee</Button>
      </div>

      <Table columns={['Username', 'Position', 'Status', 'Created', 'Actions']}>
        {employees.map((emp) => (
          <tr key={emp.id} className="border-b border-[#D9E6DF] hover:bg-[#F7FAF8]">
            <td className="px-4 py-2 font-medium">{emp.username}</td>
            <td className="px-4 py-2">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                emp.position === 'ADMIN' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {emp.position}
              </span>
            </td>
            <td className="px-4 py-2">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                emp.isActive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {emp.isActive ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="px-4 py-2 text-sm text-gray-600">
              {new Date(emp.createdAt).toLocaleDateString()}
            </td>

            <td className="px-4 py-2">
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  onClick={() => openEdit(emp)}
                  className="text-sm"
                >
                  Edit
                </Button>

                <Button 
                  variant={emp.isActive ? "secondary" : "primary"}
                  onClick={() => handleToggleStatus(emp.id)}
                  className="text-sm"
                >
                  {emp.isActive ? 'Deactivate' : 'Activate'}
                </Button>

                <Button 
                  variant="danger" 
                  onClick={() => handleDelete(emp.id, emp.username)}
                  className="text-sm"
                >
                  Delete
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {employees.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No employees found. Click "Add Employee" to create one.
        </div>
      )}

      <Modal />
    </div>
  );
}
