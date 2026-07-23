'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Users, Phone, Calendar, ArrowRight, Loader2, User } from 'lucide-react';
import { format } from 'date-fns';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  createdAt: string;
  _count?: {
    calls: number;
  };
  latestSummary?: {
    shortSummary: string | null;
    concern: string | null;
    symptoms: string | null;
    urgency: string | null;
  } | null;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch (error) {
      console.error('Failed to fetch patients', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Patients
          </h1>
          <p className="text-muted-foreground mt-1">Manage and view your patients and their AI interactions.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <User className="w-12 h-12 mb-4 opacity-20" />
            <p>No patients found.</p>
            <p className="text-sm">Patients will automatically appear here when the AI collects their details during a call.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-4 font-semibold text-muted-foreground">Name</th>
                  <th className="p-4 font-semibold text-muted-foreground">Phone</th>
                  <th className="p-4 font-semibold text-muted-foreground">Latest Summary</th>
                  <th className="p-4 font-semibold text-muted-foreground text-center">Total Calls</th>
                  <th className="p-4 font-semibold text-muted-foreground">Added On</th>
                  <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => {
                  const summaryText =
                    patient.latestSummary?.shortSummary ||
                    patient.latestSummary?.concern ||
                    null;

                  return (
                    <tr
                      key={patient.id}
                      onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
                      className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors group"
                    >
                      <td className="p-4">
                        <div className="font-medium text-foreground">
                          {patient.firstName} {patient.lastName}
                        </div>
                        {patient.email && (
                          <div className="text-xs text-muted-foreground">{patient.email}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {patient.phone}
                        </div>
                      </td>
                      <td className="p-4 max-w-xs">
                        {summaryText ? (
                          <div>
                            <p className="text-sm text-foreground line-clamp-2">{summaryText}</p>
                            {patient.latestSummary?.urgency && (
                              <span className="mt-1 inline-block text-xs text-muted-foreground">
                                Urgency: {patient.latestSummary.urgency}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No summary yet</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {patient._count?.calls || 0}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(patient.createdAt), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button className="text-primary p-2 rounded-md hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
