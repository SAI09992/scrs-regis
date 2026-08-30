'use client';

import React, { useState, useEffect } from 'react';
import { CyberButton } from '@/components/ui/CyberButton';
import {
  Users,
  UserPlus,
  Trash2,
  Crown,
  Search,
  FileText,
  Plus,
  Save,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Dices,
  Upload,
  X,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Hash,
} from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  tmId?: string;
  registrationId: string;
  regDisplayId?: string;
  name: string;
  email: string;
  registerNumber: string;
  department: string;
  year: string;
  section: string;
}

interface ProblemStatement {
  id: string;
  slotNumber: number;
  title: string;
  documentUrl: string | null;
  maxTeams: number;
}

interface Team {
  id: string;
  teamName: string;
  teamLeadRegistrationId: string | null;
  problemStatementId: string | null;
  problemStatement: ProblemStatement | null;
  members: TeamMember[];
}

export default function AdminTeamsPage() {
  const [activeTab, setActiveTab] = useState<'teams' | 'ps' | 'controls'>('teams');
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [psList, setPsList] = useState<ProblemStatement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Visibility controls
  const [teamPortalVisible, setTeamPortalVisible] = useState(false);
  const [psSelectionVisible, setPsSelectionVisible] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);

  // Add member modal
  const [addMemberTeamId, setAddMemberTeamId] = useState<string | null>(null);
  const [addMemberRegNum, setAddMemberRegNum] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  // Edit team name modal
  const [editTeamId, setEditTeamId] = useState<string | null>(null);
  const [editTeamName, setEditTeamName] = useState('');

  // PS form
  const [psSlot, setPsSlot] = useState(1);
  const [psTitle, setPsTitle] = useState('');
  const [psDocUrl, setPsDocUrl] = useState('');
  const [psMaxTeams, setPsMaxTeams] = useState(7);
  const [editPsId, setEditPsId] = useState<string | null>(null);
  const [savingPS, setSavingPS] = useState(false);

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/admin/teams');
      const data = await res.json();
      if (data.success) setTeams(data.teams || []);
    } catch (e) { console.error(e); }
  };

  const fetchPS = async () => {
    try {
      const res = await fetch('/api/admin/problem-statements');
      const data = await res.json();
      if (data.success) setPsList(data.problemStatements || []);
    } catch (e) { console.error(e); }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setTeamPortalVisible(!!data.settings.teamPortalVisible);
        setPsSelectionVisible(!!data.settings.psSelectionVisible);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    Promise.all([fetchTeams(), fetchPS(), fetchSettings()]).finally(() => setLoading(false));
  }, []);

  const handleToggleVisibility = async (field: 'teamPortalVisible' | 'psSelectionVisible', value: boolean) => {
    setSavingVisibility(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (data.success) {
        if (field === 'teamPortalVisible') setTeamPortalVisible(value);
        else setPsSelectionVisible(value);
        toast.success(value ? '🟢 Enabled!' : '🔴 Disabled!');
      }
    } catch (e) { toast.error('Failed to update'); }
    finally { setSavingVisibility(false); }
  };

  const handleSaveTeamName = async () => {
    if (!editTeamId) return;
    try {
      const res = await fetch('/api/admin/teams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: editTeamId, teamName: editTeamName }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Team name updated!');
        setEditTeamId(null);
        fetchTeams();
      }
    } catch (e) { toast.error('Failed to update team name'); }
  };

  const handleSetLead = async (teamId: string, registrationId: string) => {
    try {
      const res = await fetch('/api/admin/teams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId, teamLeadRegistrationId: registrationId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Team lead updated!');
        fetchTeams();
      }
    } catch (e) { toast.error('Failed'); }
  };

  const handleAddMember = async () => {
    if (!addMemberTeamId || !addMemberRegNum.trim()) return;
    setAddingMember(true);
    try {
      const res = await fetch('/api/admin/teams/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: addMemberTeamId, registerNumber: addMemberRegNum.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Added ${data.member?.name || 'member'}!`);
        setAddMemberRegNum('');
        setAddMemberTeamId(null);
        fetchTeams();
      } else {
        toast.error(data.error || 'Failed to add');
      }
    } catch (e) { toast.error('Network error'); }
    finally { setAddingMember(false); }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const res = await fetch(`/api/admin/teams/members?memberId=${memberId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Member removed');
        fetchTeams();
      }
    } catch (e) { toast.error('Failed'); }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Delete this team? All members will be unassigned.')) return;
    try {
      const res = await fetch(`/api/admin/teams?teamId=${teamId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Team deleted');
        fetchTeams();
      }
    } catch (e) { toast.error('Failed'); }
  };

  const handleSavePS = async () => {
    if (!psTitle.trim()) return;
    setSavingPS(true);
    try {
      const res = await fetch('/api/admin/problem-statements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editPsId || undefined,
          slotNumber: psSlot,
          title: psTitle.trim(),
          documentUrl: psDocUrl.trim() || null,
          maxTeams: psMaxTeams,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editPsId ? 'PS updated!' : 'PS created!');
        setPsSlot(psList.length + 1 > 5 ? 1 : psList.length + 1);
        setPsTitle('');
        setPsDocUrl('');
        setEditPsId(null);
        fetchPS();
      } else {
        toast.error(data.error || 'Failed');
      }
    } catch (e) { toast.error('Network error'); }
    finally { setSavingPS(false); }
  };

  const handleDeletePS = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/problem-statements?id=${id}`, { method: 'DELETE' });
      if ((await res.json()).success) { toast.success('Deleted'); fetchPS(); }
    } catch (e) { toast.error('Failed'); }
  };

  const filteredTeams = teams.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.teamName.toLowerCase().includes(q) ||
      t.members.some(
        (m) =>
          m.name?.toLowerCase().includes(q) ||
          m.registerNumber?.includes(q) ||
          m.email?.toLowerCase().includes(q)
      )
    );
  });

  // Stats
  const totalMembers = teams.reduce((acc, t) => acc + t.members.length, 0);
  const teamsUnder = teams.filter((t) => t.members.length < 3);
  const teamsOver = teams.filter((t) => t.members.length > 5);
  const teamsWithPS = teams.filter((t) => t.problemStatementId);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-cyber-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono text-cyber-text flex items-center gap-3">
            <Users className="w-7 h-7 text-cyber-primary" />
            TEAMS & PROBLEM STATEMENTS
          </h1>
          <p className="text-xs text-cyber-text-muted mt-1 font-mono">
            MANAGE BOOTCAMP TEAMS, ASSIGN LEADS, AND UPLOAD PROBLEM STATEMENTS
          </p>
        </div>
        <button onClick={() => { fetchTeams(); fetchPS(); }} className="p-2 rounded-xl bg-cyber-surface border border-cyber-border text-cyber-text-muted hover:text-cyber-primary transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-cyber-border pb-1">
        {[
          { key: 'teams' as const, label: 'TEAMS OVERVIEW', icon: Users },
          { key: 'ps' as const, label: 'PROBLEM STATEMENTS', icon: FileText },
          { key: 'controls' as const, label: 'VISIBILITY CONTROLS', icon: Eye },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs font-mono transition-all ${
              activeTab === tab.key
                ? 'bg-cyber-primary/15 text-cyber-primary border border-cyber-primary/40 border-b-0'
                : 'text-cyber-text-muted hover:text-cyber-text hover:bg-cyber-surface/60'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: TEAMS OVERVIEW */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl cyber-glass border border-cyber-border text-center">
              <div className="text-[10px] text-cyber-text-muted">TOTAL TEAMS</div>
              <div className="text-xl font-bold text-cyber-primary">{teams.length}</div>
            </div>
            <div className="p-4 rounded-xl cyber-glass border border-cyber-border text-center">
              <div className="text-[10px] text-cyber-text-muted">MEMBERS ASSIGNED</div>
              <div className="text-xl font-bold text-emerald-400">{totalMembers}</div>
            </div>
            <div className="p-4 rounded-xl cyber-glass border border-amber-500/30 text-center">
              <div className="text-[10px] text-cyber-text-muted">NEED MEMBERS (&lt;3)</div>
              <div className="text-xl font-bold text-amber-400">{teamsUnder.length}</div>
            </div>
            <div className="p-4 rounded-xl cyber-glass border border-cyber-border text-center">
              <div className="text-[10px] text-cyber-text-muted">PS ASSIGNED</div>
              <div className="text-xl font-bold text-violet-400">{teamsWithPS.length}</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-cyber-text-dim absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team name, member name, reg number..."
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text focus:outline-none focus:border-cyber-primary text-xs font-mono"
            />
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTeams.map((team) => {
              const memberCount = team.members.length;
              const sizeStatus =
                memberCount < 3 ? 'under' : memberCount > 5 ? 'over' : 'ok';

              return (
                <div
                  key={team.id}
                  className={`rounded-2xl cyber-glass border p-4 space-y-3 ${
                    sizeStatus === 'under'
                      ? 'border-amber-500/50'
                      : sizeStatus === 'over'
                      ? 'border-red-500/50'
                      : 'border-cyber-border'
                  }`}
                >
                  {/* Team Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {editTeamId === team.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            value={editTeamName}
                            onChange={(e) => setEditTeamName(e.target.value)}
                            className="px-2 py-1 bg-cyber-surface border border-cyber-primary rounded text-cyber-text text-xs font-mono w-40"
                            placeholder="Team name..."
                            autoFocus
                          />
                          <button onClick={handleSaveTeamName} className="p-1 text-emerald-400 hover:text-emerald-300">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditTeamId(null)} className="p-1 text-red-400">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditTeamId(team.id); setEditTeamName(team.teamName); }}
                          className="text-sm font-bold font-mono text-cyber-text hover:text-cyber-primary transition-colors"
                        >
                          {team.teamName || '(unnamed team)'}
                        </button>
                      )}

                      {/* Size badge */}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        sizeStatus === 'under' ? 'bg-amber-500/20 text-amber-400' :
                        sizeStatus === 'over' ? 'bg-red-500/20 text-red-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {memberCount}/5
                      </span>

                      {team.problemStatement && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-violet-500/20 text-violet-400">
                          PS #{team.problemStatement.slotNumber}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {memberCount < 5 && (
                        <button
                          onClick={() => setAddMemberTeamId(team.id)}
                          className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/60 transition-colors"
                          title="Add member"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="p-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/60 transition-colors"
                        title="Delete team"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Add Member Input */}
                  {addMemberTeamId === team.id && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-cyber-surface border border-emerald-500/30">
                      <input
                        value={addMemberRegNum}
                        onChange={(e) => setAddMemberRegNum(e.target.value)}
                        placeholder="Enter registration number..."
                        className="flex-1 px-2 py-1.5 bg-cyber-bg border border-cyber-border rounded text-cyber-text text-xs font-mono"
                        autoFocus
                      />
                      <button
                        onClick={handleAddMember}
                        disabled={addingMember}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold"
                      >
                        {addingMember ? <Loader2 className="w-3 h-3 animate-spin" /> : 'ADD'}
                      </button>
                      <button onClick={() => setAddMemberTeamId(null)} className="p-1 text-red-400">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Members List */}
                  <div className="space-y-1">
                    {team.members.map((m) => {
                      const isLead = m.registrationId === team.teamLeadRegistrationId;
                      return (
                        <div
                          key={m.id || m.registrationId}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono ${
                            isLead ? 'bg-cyber-primary/10 border border-cyber-primary/30' : 'bg-cyber-surface/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isLead && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                            <span className="text-cyber-text truncate">{m.name}</span>
                            <span className="text-cyber-text-dim shrink-0">{m.registerNumber}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {!isLead && (
                              <button
                                onClick={() => handleSetLead(team.id, m.registrationId)}
                                className="p-1 text-cyber-text-dim hover:text-amber-400 transition-colors"
                                title="Make team lead"
                              >
                                <Crown className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveMember(m.id || m.tmId || '')}
                              className="p-1 text-cyber-text-dim hover:text-red-400 transition-colors"
                              title="Remove member"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PROBLEM STATEMENTS */}
      {activeTab === 'ps' && (
        <div className="space-y-6">
          {/* PS Form */}
          <div className="p-5 rounded-2xl cyber-glass border border-cyber-border space-y-4">
            <h3 className="text-sm font-bold font-mono text-cyber-primary flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {editPsId ? 'EDIT PROBLEM STATEMENT' : 'ADD PROBLEM STATEMENT'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-cyber-text-muted block mb-1">DICE SLOT # (1-5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={psSlot}
                  onChange={(e) => setPsSlot(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-cyber-text-muted block mb-1">MAX TEAMS</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={psMaxTeams}
                  onChange={(e) => setPsMaxTeams(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-cyber-text-muted block mb-1">PS TITLE</label>
              <input
                value={psTitle}
                onChange={(e) => setPsTitle(e.target.value)}
                placeholder="Enter problem statement title..."
                className="w-full px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] text-cyber-text-muted block mb-1">DOCUMENT URL (optional)</label>
              <input
                value={psDocUrl}
                onChange={(e) => setPsDocUrl(e.target.value)}
                placeholder="https://drive.google.com/... or paste PDF link"
                className="w-full px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-text text-xs font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSavePS}
                disabled={savingPS || !psTitle.trim()}
                className="px-4 py-2 rounded-xl bg-cyber-primary/20 border border-cyber-primary/50 text-cyber-primary font-bold text-xs flex items-center gap-2 hover:bg-cyber-primary/30 transition-colors"
              >
                {savingPS ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {editPsId ? 'UPDATE PS' : 'ADD PS'}
              </button>
              {editPsId && (
                <button onClick={() => { setEditPsId(null); setPsTitle(''); setPsDocUrl(''); setPsSlot(psList.length + 1); }} className="px-3 py-2 text-xs text-cyber-text-muted hover:text-cyber-text">
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* PS List */}
          <div className="space-y-3">
            {psList.length === 0 ? (
              <div className="p-8 text-center text-cyber-text-muted text-xs font-mono">
                No problem statements uploaded yet. Add your first one above.
              </div>
            ) : (
              psList.map((ps) => {
                const assignedCount = teams.filter((t) => t.problemStatementId === ps.id).length;
                return (
                  <div key={ps.id} className="p-4 rounded-xl cyber-glass border border-cyber-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-violet-950/40 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-lg">
                        {ps.slotNumber}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-cyber-text font-mono">{ps.title}</div>
                        <div className="text-[10px] text-cyber-text-dim flex items-center gap-3 mt-0.5">
                          <span>Teams: {assignedCount}/{ps.maxTeams}</span>
                          {ps.documentUrl && (
                            <a href={ps.documentUrl} target="_blank" rel="noopener noreferrer" className="text-cyber-primary hover:underline">
                              📄 View Document
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditPsId(ps.id); setPsSlot(ps.slotNumber); setPsTitle(ps.title); setPsDocUrl(ps.documentUrl || ''); setPsMaxTeams(ps.maxTeams); }}
                        className="px-2 py-1 text-xs text-cyber-text-muted hover:text-cyber-primary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePS(ps.id)}
                        className="p-1.5 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: VISIBILITY CONTROLS */}
      {activeTab === 'controls' && (
        <div className="space-y-4">
          {/* Team Portal Visibility */}
          <div className="p-6 rounded-2xl cyber-glass-glow border border-cyber-border flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-bold text-cyber-text font-mono">TEAM PORTAL VISIBILITY</div>
              <p className="text-xs text-cyber-text-muted">
                {teamPortalVisible
                  ? '🟢 Team section is VISIBLE to participants in their portal.'
                  : '🔴 Team section is HIDDEN from participants.'}
              </p>
            </div>
            <button
              onClick={() => handleToggleVisibility('teamPortalVisible', !teamPortalVisible)}
              disabled={savingVisibility}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                teamPortalVisible
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                  : 'bg-red-950/60 hover:bg-red-900/60 border border-red-500 text-red-400'
              }`}
            >
              {teamPortalVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {teamPortalVisible ? 'VISIBLE' : 'HIDDEN'}
            </button>
          </div>

          {/* PS Selection Visibility */}
          <div className="p-6 rounded-2xl cyber-glass-glow border border-cyber-border flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-bold text-cyber-text font-mono">PS SELECTION (DICE ROLL)</div>
              <p className="text-xs text-cyber-text-muted">
                {psSelectionVisible
                  ? '🟢 Team leads can now ROLL THE DICE to select their problem statement.'
                  : '🔴 Dice roll is DISABLED. Team leads cannot select PS yet.'}
              </p>
            </div>
            <button
              onClick={() => handleToggleVisibility('psSelectionVisible', !psSelectionVisible)}
              disabled={savingVisibility}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                psSelectionVisible
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                  : 'bg-red-950/60 hover:bg-red-900/60 border border-red-500 text-red-400'
              }`}
            >
              {psSelectionVisible ? <Dices className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {psSelectionVisible ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
