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
  deactivateEmployee,
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

    try {
      setLoading(true);
      await createEmployee(form);
      toast.push('success', 'Employee created');
      closeModal();
      onSuccess();
    } catch (error) {
      toast.push('error', 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        label="Username"
        value={form.username}
        onChange={(e) => updateField('username', e.target.value)}
      />

      <Input
        label="Password"
        type="password"
        value={form.password}
        onChange={(e) => updateField('password', e.target.value)}
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

      <Button loading={loading} className="w-full">
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
  });

  const [loading, setLoading] = useState(false);

  function updateField<T extends keyof UpdateEmployeeDto>(key: T, value: UpdateEmployeeDto[T]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      await updateEmployee(employee.id, form);
      toast.push('success', 'Employee updated');
      closeModal();
      onSuccess();
    } catch (error) {
      toast.push('error', 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        label="Username"
        value={form.username ?? ''}
        onChange={(e) => updateField('username', e.target.value)}
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

      <Button loading={loading} className="w-full">
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
    } catch {
      toast.push('error', 'Failed to load employees');
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

  async function handleDeactivate(id: string) {
    try {
      await deactivateEmployee(id);
      toast.push('success', 'Employee deactivated');
      loadEmployees();
    } catch {
      toast.push('error', 'Failed to deactivate employee');
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
        <Button onClick={openCreate}>Add Employee</Button>
      </div>

      <Table columns={['Username', 'Position', 'Status', 'Actions']}>
        {employees.map((emp) => (
          <tr key={emp.id} className="border-b border-[#D9E6DF]">
            <td className="px-4 py-2">{emp.username}</td>
            <td className="px-4 py-2">{emp.position}</td>
            <td className="px-4 py-2">{emp.isActive ? 'Active' : 'Inactive'}</td>

            <td className="px-4 py-2 flex gap-2">
              <Button variant="secondary" onClick={() => openEdit(emp)}>
                Edit
              </Button>

              {emp.isActive && (
                <Button variant="danger" onClick={() => handleDeactivate(emp.id)}>
                  Deactivate
                </Button>
              )}
            </td>
          </tr>
        ))}
      </Table>

      <Modal />
    </div>
  );
}
