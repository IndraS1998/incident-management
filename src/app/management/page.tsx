'use client';
import { NextPage } from 'next';
import { useState } from 'react';
import Navbar from '@/components/navbar';
import Footer from '../../../components/footer/footerComponent';

// Type definitions
type IncidentStatus = 'En attente' | 'En cours' | 'Résolu' | 'Rejeté';
type UrgencyLevel = 'Faible' | 'Modéré' | 'Élevé' | 'Critique';
type IncidentType = 'Matériel' | 'Applicatifs' | 'Réseau' | 'Autre';

interface Incident {
  id: number;
  title: string;
  description: string;
  type: IncidentType;
  status: IncidentStatus;
  urgency: UrgencyLevel;
  date: string;
  assignedTo: string;
}

const IncidentManagement: NextPage = () => {
    
    // Mock data
    const initialIncidents: Incident[] = [
        { id: 1, title: 'Serveur en panne', description: 'Le serveur principal ne répond pas', type: 'Matériel', status: 'En cours', urgency: 'Critique', date: '2023-06-15', assignedTo: 'Jean Dupont' },
        { id: 2, title: 'Problème de connexion', description: 'Les utilisateurs ne peuvent pas se connecter', type: 'Réseau', status: 'En attente', urgency: 'Élevé', date: '2023-06-14', assignedTo: '' },
        { id: 3, title: 'Bug interface admin', description: 'Bouton non fonctionnel sur le panel admin', type: 'Applicatifs', status: 'En cours', urgency: 'Modéré', date: '2023-06-13', assignedTo: 'Marie Lambert' },
        { id: 4, title: 'Souris défectueuse', description: 'Souris ne fonctionnant plus en salle de réunion B', type: 'Matériel', status: 'Résolu', urgency: 'Faible', date: '2023-06-10', assignedTo: 'Pierre Martin' },
    ];

  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [filters, setFilters] = useState({
    status: '',
    urgency: '',
    type: '',
    startDate: '',
    endDate: '',
    searchQuery: ''
  });
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const teamMembers = ['Jean Dupont', 'Marie Lambert', 'Pierre Martin', 'Sophie Bernard', 'Non assigné'];

  // Filter incidents based on filters
  const filteredIncidents = incidents.filter(incident => {
    return (
      (filters.status === '' || incident.status === filters.status) &&
      (filters.urgency === '' || incident.urgency === filters.urgency) &&
      (filters.type === '' || incident.type === filters.type) &&
      (filters.startDate === '' || new Date(incident.date) >= new Date(filters.startDate)) &&
      (filters.endDate === '' || new Date(incident.date) <= new Date(filters.endDate)) &&
      (filters.searchQuery === '' || 
        incident.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        incident.description.toLowerCase().includes(filters.searchQuery.toLowerCase()))
    );
  });

  const handleStatusChange = (id: number, newStatus: IncidentStatus) => {
    setIncidents(incidents.map(inc => 
      inc.id === id ? { ...inc, status: newStatus } : inc
    ));
  };

  const handleAssignChange = (id: number, assignee: string) => {
    setIncidents(incidents.map(inc => 
      inc.id === id ? { ...inc, assignedTo: assignee } : inc
    ));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIncident) {
      setIncidents(incidents.map(inc => 
        inc.id === editingIncident.id ? editingIncident : inc
      ));
      setEditingIncident(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAF6FF]">
      <Navbar />

      <main className="container mx-auto p-4">
        {/* Filters Section */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-[#EAF6FF]">
          <h2 className="text-lg font-semibold text-[#232528] mb-4">Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-[#232528] mb-1">Statut</label>
              <select 
                className="w-full p-2 border border-[#EAF6FF] rounded"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value as IncidentStatus})}
              >
                <option value="">Tous</option>
                <option value="En attente">En attente</option>
                <option value="En cours">En cours</option>
                <option value="Résolu">Résolu</option>
                <option value="Rejeté">Rejeté</option>
              </select>
            </div>

            {/* Urgency Filter */}
            <div>
              <label className="block text-sm font-medium text-[#232528] mb-1">Urgence</label>
              <select 
                className="w-full p-2 border border-[#EAF6FF] rounded"
                value={filters.urgency}
                onChange={(e) => setFilters({...filters, urgency: e.target.value as UrgencyLevel})}
              >
                <option value="">Tous</option>
                <option value="Faible">Faible</option>
                <option value="Modéré">Modéré</option>
                <option value="Élevé">Élevé</option>
                <option value="Critique">Critique</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-[#232528] mb-1">Type</label>
              <select 
                className="w-full p-2 border border-[#EAF6FF] rounded"
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value as IncidentType})}
              >
                <option value="">Tous</option>
                <option value="Matériel">Matériel</option>
                <option value="Applicatifs">Applicatifs</option>
                <option value="Réseau">Réseau</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-[#232528] mb-1">Recherche</label>
              <input
                type="text"
                className="w-full p-2 border border-[#EAF6FF] rounded"
                placeholder="Rechercher..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
              />
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-[#232528] mb-1">Date de début</label>
              <input
                type="date"
                className="w-full p-2 border border-[#EAF6FF] rounded"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#232528] mb-1">Date de fin</label>
              <input
                type="date"
                className="w-full p-2 border border-[#EAF6FF] rounded"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Incidents Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden border border-[#EAF6FF]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#EAF6FF]">
              <thead className="bg-[#2A2A72] bg-opacity-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#EAF6FF] uppercase tracking-wider">Titre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#EAF6FF] uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#EAF6FF] uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#EAF6FF] uppercase tracking-wider">Urgence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#EAF6FF] uppercase tracking-wider">Assigné à</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#EAF6FF] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#EAF6FF]">
                {filteredIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-[#EAF6FF] hover:bg-opacity-30">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#232528]">
                      {incident.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#232528]">
                      {incident.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={incident.status}
                        onChange={(e) => handleStatusChange(incident.id, e.target.value as IncidentStatus)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${incident.status === 'En attente' ? 'bg-blue-100 text-blue-800' : 
                              incident.status === 'En cours' ? 'bg-yellow-100 text-yellow-800' : 
                              incident.status === 'Rejeté' ? 'bg-red-100 text-red-800' : 
                              'bg-green-100 text-green-800'}`}>
                        {['En attente', 'En cours', 'Résolu', 'Rejeté'].map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${incident.urgency === 'Élevé' ? 'bg-orange-100 text-orange-800' : 
                              incident.urgency === 'Modéré' ? 'bg-yellow-100 text-yellow-800' : 
                              incident.urgency === 'Critique' ? 'bg-red-100 text-red-800' : 
                              'bg-blue-100 text-blue-800'}`}>
                        {incident.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={incident.assignedTo || ''}
                        onChange={(e) => handleAssignChange(incident.id, e.target.value)}
                        className="p-1 text-xs border border-[#EAF6FF] rounded"
                      >
                        <option value="">Non assigné</option>
                        {teamMembers.map(member => (
                          <option key={member} value={member}>{member}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex justify-start space-x-2">
                            <button
                                type="button"
                                onClick={() => setEditingIncident({...incident})}
                                className="px-4 py-2 text-white bg-[#FFA400] rounded cursor-pointer"
                            >
                               Éditer 
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[#2A2A72] text-white rounded cursor-pointer" >
                                Enregistrer
                            </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Incident Modal */}
        {editingIncident && (
        <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl border border-[#EAF6FF]">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-[#232528]">Éditer l&apos;incident</h2>
                    <button 
                    onClick={() => setEditingIncident(null)}
                    className="text-[#232528] hover:text-[#FFA400]"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
                <form onSubmit={handleEditSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-[#232528] mb-1">Titre</label>
                        <input
                        type="text"
                        className="w-full p-2 border border-[#EAF6FF] rounded focus:ring-2 focus:ring-[#009FFD] focus:border-transparent"
                        value={editingIncident.title}
                        onChange={(e) => setEditingIncident({...editingIncident, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#232528] mb-1">Type</label>
                        <select
                        className="w-full p-2 border border-[#EAF6FF] rounded focus:ring-2 focus:ring-[#009FFD] focus:border-transparent"
                        value={editingIncident.type}
                        onChange={(e) => setEditingIncident({...editingIncident, type: e.target.value as IncidentType})}
                        >
                        <option value="Matériel">Matériel</option>
                        <option value="Applicatifs">Applicatifs</option>
                        <option value="Réseau">Réseau</option>
                        <option value="Autre">Autre</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#232528] mb-1">Urgence</label>
                        <select
                        className="w-full p-2 border border-[#EAF6FF] rounded focus:ring-2 focus:ring-[#009FFD] focus:border-transparent"
                        value={editingIncident.urgency}
                        onChange={(e) => setEditingIncident({...editingIncident, urgency: e.target.value as UrgencyLevel})}
                        >
                        <option value="Faible">Faible</option>
                        <option value="Modéré">Modéré</option>
                        <option value="Élevé">Élevé</option>
                        <option value="Critique">Critique</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#232528] mb-1">Statut</label>
                        <select
                        className="w-full p-2 border border-[#EAF6FF] rounded focus:ring-2 focus:ring-[#009FFD] focus:border-transparent"
                        value={editingIncident.status}
                        onChange={(e) => setEditingIncident({...editingIncident, status: e.target.value as IncidentStatus})}
                        >
                        <option value="En attente">En attente</option>
                        <option value="En cours">En cours</option>
                        <option value="Résolu">Résolu</option>
                        <option value="Rejeté">Rejeté</option>
                        </select>
                    </div>
                    </div>
                    <div className="mb-4">
                    <label className="block text-sm font-medium text-[#232528] mb-1">Description</label>
                    <textarea
                        className="w-full p-2 border border-[#EAF6FF] rounded focus:ring-2 focus:ring-[#009FFD] focus:border-transparent"
                        rows={4}
                        value={editingIncident.description}
                        onChange={(e) => setEditingIncident({...editingIncident, description: e.target.value})}
                    />
                    </div>
                    <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={() => setEditingIncident(null)}
                        className="px-4 py-2 text-[#232528] cursor-pointer border border-[#EAF6FF] rounded hover:bg-[#EAF6FF] transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-[#2A2A72] text-white cursor-pointer rounded hover:bg-[#3A3A82] transition-colors"
                    >
                        Enregistrer
                    </button>
                    </div>
                </form>
            </div>
        </div>
        )}
      </main>
      <Footer />
    </div>
)};

export default IncidentManagement;