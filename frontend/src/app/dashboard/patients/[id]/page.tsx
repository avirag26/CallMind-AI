'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, User, Phone, Mail, Calendar, FileText, Activity, Clock, FileWarning, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function PatientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPatient();
    }
  }, [id]);

  const fetchPatient = async () => {
    try {
      const res = await api.get(`/patients/${id}`);
      setPatient(res.data);
    } catch (error) {
      console.error('Failed to fetch patient details', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h2 className="text-2xl font-bold">Patient not found</h2>
        <button onClick={() => router.back()} className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Go back
        </button>
      </div>
    );
  }

  // Find the most recent summary to display the latest triage details
  const latestSummary = patient.calls?.[0]?.conversations?.[0]?.summaries?.[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.push('/dashboard/patients')}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-muted-foreground mt-1">Patient Details & History</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Demographics & Latest Triage */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              Contact Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span className="text-foreground">{patient.phone}</span>
              </div>
              {patient.email && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="text-foreground">{patient.email}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-foreground">Added {format(new Date(patient.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          {latestSummary && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-primary">
                <Activity className="w-5 h-5" />
                Latest Triage Info
              </h3>
              <div className="space-y-4 text-sm">
                {latestSummary.concern && (
                  <div>
                    <div className="text-muted-foreground text-xs uppercase font-bold mb-1">Primary Concern</div>
                    <div className="font-medium">{latestSummary.concern}</div>
                  </div>
                )}
                {latestSummary.symptoms && (
                  <div>
                    <div className="text-muted-foreground text-xs uppercase font-bold mb-1 flex items-center gap-1">
                      <FileWarning className="w-3 h-3" /> Symptoms
                    </div>
                    <div>{latestSummary.symptoms}</div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {latestSummary.duration && (
                    <div>
                      <div className="text-muted-foreground text-xs uppercase font-bold mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Duration
                      </div>
                      <div>{latestSummary.duration}</div>
                    </div>
                  )}
                  {latestSummary.urgency && (
                    <div>
                      <div className="text-muted-foreground text-xs uppercase font-bold mb-1 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" /> Urgency
                      </div>
                      <div>{latestSummary.urgency}</div>
                    </div>
                  )}
                </div>
                {latestSummary.shortSummary && (
                  <div className="pt-2 border-t border-primary/10 mt-2">
                    <div className="text-primary font-medium italic">"{latestSummary.shortSummary}"</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interaction History */}
        <div className="md:col-span-2">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm h-full">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-primary" />
              Interaction History
            </h3>

            <div className="space-y-6">
              {patient.calls && patient.calls.length > 0 ? (
                patient.calls.map((call: any) => (
                  <div key={call.id} className="relative pl-6 border-l-2 border-muted">
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5 ring-4 ring-background" />
                    <div className="mb-1 flex items-center justify-between">
                      <div className="font-semibold">Incoming AI Call</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(call.createdAt), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                    
                    {call.conversations?.[0]?.summaries?.[0] ? (
                      <div className="mt-2 text-sm bg-muted/30 p-3 rounded-lg border border-border">
                        <div className="font-medium mb-1 text-primary">Summary Extract</div>
                        <p className="text-muted-foreground mb-2">
                          {call.conversations[0].summaries[0].shortSummary || call.conversations[0].summaries[0].concern || 'No summary available.'}
                        </p>
                        <button 
                          onClick={() => router.push(`/dashboard/calls/${call.id}`)}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          View Full Call Details &rarr;
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-muted-foreground">
                        Call logged but no AI summary was generated.
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-center py-8">
                  No interaction history found for this patient.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
